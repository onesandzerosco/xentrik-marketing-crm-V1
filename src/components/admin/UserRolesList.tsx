
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeStatus, PrimaryRole } from "@/types/employee";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditUserRolesModal from "./EditUserRolesModal";
import { useToast } from "@/hooks/use-toast";

const UserRolesList: React.FC = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from Supabase profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        // Map the data to match our Employee type with proper type casting
        const formattedUsers = data.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as PrimaryRole,
          roles: profile.roles as string[] || [],
          status: (profile.status || "Active") as EmployeeStatus,
          profileImage: profile.profile_image,
          lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never",
          createdAt: profile.created_at ? new Date(profile.created_at).toLocaleString() : "Unknown",
          department: profile.department,
          telegram: profile.telegram
        }));
        
        // Sort users by role: Admin > Manager > Employee
        const sortedUsers = sortUsersByRole(formattedUsers);
        
        console.log("Fetched users:", sortedUsers);
        setUsers(sortedUsers);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Sort users by role priority: Admin > Manager > Employee
  const sortUsersByRole = (users: Employee[]): Employee[] => {
    const rolePriority: Record<PrimaryRole, number> = {
      "Admin": 0,
      "Manager": 1,
      "Employee": 2
    };

    return [...users].sort((a, b) => {
      // Sort by role priority first
      return rolePriority[a.role] - rolePriority[b.role];
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Employee) => {
    console.log("Editing user:", user);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (userId: string, primaryRole: PrimaryRole, additionalRoles: string[]) => {
    try {
      setLoading(true);
      
      console.log("Updating user with:", { userId, primaryRole, additionalRoles });
      
      // Check if the user previously had Creator role
      const currentUser = users.find(user => user.id === userId);
      const hadCreatorRole = currentUser?.roles?.includes('Creator') || false;
      const hasCreatorRole = additionalRoles.includes('Creator');
      
      // Use RPC function instead of direct update to bypass RLS
      const { data, error } = await supabase
        .rpc('admin_update_user_roles', {
          user_id: userId,
          new_primary_role: primaryRole,
          new_additional_roles: additionalRoles
        });

      if (error) {
        throw error;
      }
      
      console.log("Supabase update response:", data);

      // If Creator role is being added
      if (!hadCreatorRole && hasCreatorRole) {
        await ensureCreatorRecordExists(userId);
      }
      
      // If Creator role is being removed
      if (hadCreatorRole && !hasCreatorRole) {
        await disableCreatorRecord(userId);
      }
      
      // Update the local state to reflect the changes immediately
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: primaryRole, roles: additionalRoles } 
            : user
        );
        // Re-sort the list after updates
        return sortUsersByRole(updatedUsers);
      });
      
      // Close the modal
      setIsModalOpen(false);
      setSelectedUser(null);
      
      toast({
        title: "Success",
        description: "User roles updated successfully",
      });
      
      // Refetch users to ensure UI is in sync with database
      await fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to ensure a creator record exists for users with Creator role
  const ensureCreatorRecordExists = async (userId: string) => {
    try {
      // Get user data from profiles table
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        return;
      }

      if (!userData || !userData.name) {
        console.error("User data is missing or incomplete");
        return;
      }

      // Check if creator record already exists
      const { data: existingCreator } = await supabase
        .from('creators')
        .select('id, active')
        .eq('id', userId)
        .maybeSingle();

      // If creator record doesn't exist, create one
      if (!existingCreator) {
        console.log("Creating new creator record for user:", userId);
        
        // Create the creator record with required fields
        const { error: creatorError } = await supabase
          .from('creators')
          .insert({
            id: userId,
            name: userData.name,
            gender: 'Male', // Default value
            team: 'A Team', // Default value
            creator_type: 'Real', // Default value
            needs_review: false, // Automatically approved
            active: true // Explicitly set to active
          });

        if (creatorError) {
          console.error("Error creating creator record:", creatorError);
          return;
        }

        // Create an empty social links record for the creator
        const { error: socialLinksError } = await supabase
          .from('creator_social_links')
          .insert({
            creator_id: userId
          });

        if (socialLinksError) {
          console.error("Error creating social links record:", socialLinksError);
        }
        
        toast({
          title: "Creator account created",
          description: `${userData.name} has been set up as a creator`,
        });
      } else if (!existingCreator.active) {
        // If creator record exists but is inactive, make it active again
        const { error: updateError } = await supabase
          .from('creators')
          .update({ 
            active: true,
            needs_review: false // Also ensure it's approved
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating creator active status:", updateError);
        } else {
          console.log("Reactivated existing creator account:", userId);
          toast({
            title: "Creator account reactivated",
            description: `${userData.name} has been reactivated as a creator`,
          });
        }
      } else {
        // If creator record exists and is already active, just ensure it's approved
        const { error: updateError } = await supabase
          .from('creators')
          .update({ needs_review: false })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating creator approval status:", updateError);
        }
      }
    } catch (error) {
      console.error("Error ensuring creator record exists:", error);
    }
  };

  // Function to disable a creator record when Creator role is removed
  const disableCreatorRecord = async (userId: string) => {
    try {
      // Update the creator record to mark it as inactive
      const { error } = await supabase
        .from('creators')
        .update({
          active: false
        })
        .eq('id', userId);

      if (error) {
        console.error("Error disabling creator record:", error);
        toast({
          title: "Error",
          description: "Failed to update creator status",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Creator status updated",
          description: "User is no longer listed as a creator",
        });
      }
    } catch (error) {
      console.error("Error disabling creator record:", error);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead className="w-[150px]">Email</TableHead>
              <TableHead className="w-[100px]">Primary Role</TableHead>
              <TableHead>Additional Roles</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className="bg-brand-yellow text-black">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((role, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={
                      user.status === "Active" ? "bg-green-500" : 
                      user.status === "Paused" ? "bg-amber-500" : 
                      "bg-red-500"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEdit(user)}
                    className="hover:bg-transparent p-0 h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <EditUserRolesModal 
        user={selectedUser}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUpdate={handleUpdateUser}
      />
    </>
  );
};

export default UserRolesList;

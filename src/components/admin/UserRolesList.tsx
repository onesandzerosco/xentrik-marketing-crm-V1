
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Employee, TeamMemberRole, EmployeeStatus } from "@/types/employee";
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
          // Cast the role string to TeamMemberRole type
          role: profile.role as TeamMemberRole,
          // Cast the status string to EmployeeStatus type
          status: (profile.status || "Active") as EmployeeStatus,
          permissions: profile.roles || [],
          profileImage: profile.profile_image,
          lastLogin: profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never",
          createdAt: profile.created_at ? new Date(profile.created_at).toLocaleString() : "Unknown",
          department: profile.department
        }));
        
        setUsers(formattedUsers);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Employee) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdateUser = async (userId: string, primaryRole: TeamMemberRole, additionalRoles: string[]) => {
    try {
      setLoading(true);
      
      // Update the user in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          role: primaryRole,
          roles: additionalRoles
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "User roles updated",
        description: "The user's roles have been successfully updated.",
      });

      // Refresh the user list
      fetchUsers();
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      
      // Show error message
      toast({
        title: "Failed to update roles",
        description: "There was a problem updating the user's roles.",
        variant: "destructive",
      });
      
      setLoading(false);
    }
  };

  if (loading) {
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
                    {user.permissions?.map((permission, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
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

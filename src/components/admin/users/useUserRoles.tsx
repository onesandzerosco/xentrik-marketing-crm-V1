
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeStatus, PrimaryRole } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";

export const useUserRoles = () => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { toast } = useToast();

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
        
        // Sort users by role
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: Employee) => {
    console.log("Editing user:", user);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return {
    users,
    loading,
    selectedUser,
    setSelectedUser,
    isModalOpen,
    setIsModalOpen,
    fetchUsers,
    handleEdit
  };
};

export default useUserRoles;

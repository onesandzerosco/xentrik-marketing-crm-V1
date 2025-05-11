
import { useState } from "react";
import { PrimaryRole } from "@/types/employee";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CreatorService from "@/services/creator";

export const useUserRolesUpdate = (fetchUsers: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdateUser = async (userId: string, primaryRole: PrimaryRole, additionalRoles: string[]) => {
    try {
      setLoading(true);
      
      console.log("Updating user with:", { userId, primaryRole, additionalRoles });
      
      // Fetch the current user to check for creator role changes
      const { data: currentUserData } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', userId)
        .single();
      
      const hadCreatorRole = currentUserData?.roles?.includes('Creator') || false;
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

      // Handle creator role changes
      if (!hadCreatorRole && hasCreatorRole) {
        // Creator role added
        const result = await CreatorService.ensureCreatorRecordExists(userId);
        if (result) {
          toast({
            title: "Creator account created",
            description: "User has been assigned the Creator role and a creator record was created.",
          });
        }
      } else if (hadCreatorRole && !hasCreatorRole) {
        // Creator role removed - would need additional functionality to handle this
        toast({
          title: "Creator status updated",
          description: "User's Creator role has been removed.",
        });
      }
      
      toast({
        title: "Success",
        description: "User roles updated successfully",
      });
      
      // Refetch users to ensure UI is in sync with database
      await fetchUsers();

      return true;
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user roles",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleUpdateUser
  };
};

export default useUserRolesUpdate;

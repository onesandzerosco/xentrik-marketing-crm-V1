
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { teamMemberFormSchema, TeamMemberFormData } from "./schema";
import { ADDITIONAL_ROLES, EXCLUSIVE_ROLES } from "../users/constants";
import { v4 as uuidv4 } from 'uuid';

export const useTeamMemberForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter out "Creator" from the displayed options
  const availableAdditionalRoles = ADDITIONAL_ROLES.filter(role => role !== "Creator");
  
  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      email: "",
      primaryRole: "Employee",
      additionalRoles: []
    }
  });

  const onSubmit = async (data: TeamMemberFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate a UUID for the new user
      const userId = uuidv4();
      
      // Call the stored procedure to create a team member with default password and explicit ID
      // Use a custom function call since the RPC name might not be in the TypeScript type definition yet
      const { error } = await supabase.rpc(
        // @ts-ignore - Ignore type error until types are updated
        'create_team_member_with_id',
        {
          user_id: userId,
          email: data.email,
          password: 'XentrikBananas', // Set default password as requested
          name: data.email.split('@')[0], // Use first part of email as name
          phone: '', // Empty optional fields
          telegram: '',
          roles: data.additionalRoles,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Update the primary role
      const { error: updateError } = await supabase.rpc(
        // @ts-ignore - Ignore type error until types are updated
        'admin_update_user_roles',
        {
          user_id: userId,
          new_primary_role: data.primaryRole,
          new_additional_roles: data.additionalRoles
        }
      );

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast({
        title: "Success",
        description: `New team member created with email ${data.email}`,
      });

      // Reset form
      form.reset({
        email: "",
        primaryRole: "Employee",
        additionalRoles: []
      });
    } catch (error: any) {
      console.error("Error creating team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create team member",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if an additional role should be disabled based on selected roles
  const isRoleDisabled = (role: string): boolean => {
    const selectedRoles = form.watch("additionalRoles");
    // If current roles include any exclusive role and this isn't that role
    return selectedRoles.some(r => 
      EXCLUSIVE_ROLES.includes(r) && r !== role
    );
  };

  // Handle checkbox change for additional roles
  const handleAdditionalRoleChange = (checked: boolean | string, role: string) => {
    const currentRoles = form.getValues("additionalRoles");
    
    if (checked) {
      // If adding an exclusive role, clear all other roles
      if (EXCLUSIVE_ROLES.includes(role)) {
        form.setValue("additionalRoles", [role]);
      } else {
        // If adding a non-exclusive role, remove any exclusive roles first
        const filteredRoles = currentRoles.filter(r => !EXCLUSIVE_ROLES.includes(r));
        form.setValue("additionalRoles", [...filteredRoles, role]);
      }
    } else {
      // If removing a role, just filter it out
      form.setValue(
        "additionalRoles", 
        currentRoles.filter(r => r !== role)
      );
    }
  };

  return {
    form,
    isSubmitting,
    availableAdditionalRoles,
    isRoleDisabled,
    handleAdditionalRoleChange,
    onSubmit,
  };
};

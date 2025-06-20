
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { teamMemberFormSchema, TeamMemberFormData } from "./schema";
import { ADDITIONAL_ROLES, EXCLUSIVE_ROLES } from "../users/constants";

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
      additionalRoles: [],
      geographicRestrictions: []
    }
  });

  const onSubmit = async (data: TeamMemberFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log("Form data:", data);
      
      // Call the edge function to create the team member
      const { data: userData, error: userError } = await supabase.functions.invoke('create_team_member', {
        body: {
          email: data.email,
          password: 'XentrikBananas',
          name: data.email.split('@')[0],
          primary_role: data.primaryRole,
          additional_roles: data.additionalRoles,
          geographic_restrictions: data.geographicRestrictions || []
        }
      });

      if (userError) {
        throw new Error(userError.message);
      }

      if (!userData) {
        throw new Error("Failed to create user account");
      }

      toast({
        title: "Success",
        description: `New team member created with email ${data.email}`,
      });

      // Reset form
      form.reset({
        email: "",
        primaryRole: "Employee",
        additionalRoles: [],
        geographicRestrictions: []
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

  // Handle checkbox change for geographic restrictions
  const handleGeographicRestrictionChange = (checked: boolean | string, restriction: string) => {
    const currentRestrictions = form.getValues("geographicRestrictions") || [];
    
    if (checked) {
      form.setValue("geographicRestrictions", [...currentRestrictions, restriction]);
    } else {
      form.setValue(
        "geographicRestrictions", 
        currentRestrictions.filter(r => r !== restriction)
      );
    }
  };

  return {
    form,
    isSubmitting,
    availableAdditionalRoles,
    isRoleDisabled,
    handleAdditionalRoleChange,
    handleGeographicRestrictionChange,
    onSubmit,
  };
};

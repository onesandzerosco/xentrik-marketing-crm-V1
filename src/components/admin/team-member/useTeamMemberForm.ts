
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamMemberSchema, TeamMemberFormData } from "./schema";
import { useTeam } from "@/context/TeamContext";
import { generatePassword } from "@/utils/passwordUtils";

export const useTeamMemberForm = () => {
  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      email: "",
      name: "",
      primaryRole: "Employee",
      additionalRoles: [],
      geographicRestrictions: [], // Add default value
    },
  });
  const { addTeamMember } = useTeam();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableAdditionalRoles = ["VA", "Chatter", "Manager", "Developer"];

  const isRoleDisabled = (role: string, selectedRoles: string[]) => {
    if (role === "Admin") return true;
    return selectedRoles.includes(role);
  };

  const handleAdditionalRoleChange = (role: string, checked: boolean) => {
    const currentRoles = form.watch("additionalRoles");
    if (checked) {
      form.setValue("additionalRoles", [...currentRoles, role]);
    } else {
      form.setValue(
        "additionalRoles",
        currentRoles.filter((r) => r !== role)
      );
    }
  };

  const onSubmit = async (values: TeamMemberFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const password = generatePassword();
      
      // Pass the geographic restrictions along with other data
      await addTeamMember({
        name: values.name,
        email: values.email,
        roles: [values.primaryRole, ...values.additionalRoles],
        status: 'Active',
        teams: [],
        lastLogin: 'Never', // Add required lastLogin field
        geographicRestrictions: values.geographicRestrictions, // Include in team member data
      }, password);
      
      form.reset();
      
    } catch (error) {
      console.error('Error creating team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    availableAdditionalRoles,
    isRoleDisabled,
    handleAdditionalRoleChange,
    onSubmit
  };
};

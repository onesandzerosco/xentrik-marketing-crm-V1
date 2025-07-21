
import React from "react";
import { Form } from "@/components/ui/form";
import { useTeamMemberForm } from "./team-member/useTeamMemberForm";
import FormHeader from "./team-member/FormHeader";
import EmailField from "./team-member/EmailField";
import PrimaryRoleField from "./team-member/PrimaryRoleField";
import AdditionalRolesField from "./team-member/AdditionalRolesField";
import GeographicRestrictionsField from "./team-member/GeographicRestrictionsField";
import FormActions from "./team-member/FormActions";

const AddTeamMemberForm: React.FC = () => {
  const {
    form,
    isSubmitting,
    availableAdditionalRoles,
    isRoleDisabled,
    handleAdditionalRoleChange,
    handleGeographicRestrictionChange,
    onSubmit
  } = useTeamMemberForm();

  return (
    <div className="px-6 md:px-12 lg:px-16">
      <FormHeader />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <EmailField control={form.control} />
          <PrimaryRoleField control={form.control} />
          
          <AdditionalRolesField 
            availableRoles={availableAdditionalRoles}
            selectedRoles={form.watch("additionalRoles")}
            isRoleDisabled={isRoleDisabled}
            handleRoleChange={handleAdditionalRoleChange}
          />

          <GeographicRestrictionsField 
            selectedRestrictions={form.watch("geographicRestrictions") || []}
            handleRestrictionChange={handleGeographicRestrictionChange}
          />

          <FormActions isSubmitting={isSubmitting} />
        </form>
      </Form>
    </div>
  );
};

export default AddTeamMemberForm;

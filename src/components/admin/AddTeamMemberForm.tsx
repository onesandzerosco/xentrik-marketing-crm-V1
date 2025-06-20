
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
    <div>
      <FormHeader />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <EmailField control={form.control} />
              
              <GeographicRestrictionsField 
                selectedRestrictions={form.watch("geographicRestrictions") || []}
                handleRestrictionChange={handleGeographicRestrictionChange}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <PrimaryRoleField control={form.control} />
              
              <AdditionalRolesField 
                availableRoles={availableAdditionalRoles}
                selectedRoles={form.watch("additionalRoles")}
                isRoleDisabled={isRoleDisabled}
                handleRoleChange={handleAdditionalRoleChange}
              />
            </div>
          </div>

          <FormActions isSubmitting={isSubmitting} />
        </form>
      </Form>
    </div>
  );
};

export default AddTeamMemberForm;

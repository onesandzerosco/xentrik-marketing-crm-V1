
import React from "react";
import { Form } from "@/components/ui/form";
import { useTeamMemberForm } from "./team-member/useTeamMemberForm";
import FormHeader from "./team-member/FormHeader";
import EmailField from "./team-member/EmailField";
import PrimaryRoleField from "./team-member/PrimaryRoleField";
import AdditionalRolesField from "./team-member/AdditionalRolesField";
import FormActions from "./team-member/FormActions";

const AddTeamMemberForm: React.FC = () => {
  const {
    form,
    isSubmitting,
    availableAdditionalRoles,
    isRoleDisabled,
    handleAdditionalRoleChange,
    onSubmit
  } = useTeamMemberForm();

  return (
    <div>
      <FormHeader />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <EmailField control={form.control} />
          <PrimaryRoleField control={form.control} />
          
          <AdditionalRolesField 
            availableRoles={availableAdditionalRoles}
            selectedRoles={form.watch("additionalRoles")}
            isRoleDisabled={isRoleDisabled}
            handleRoleChange={handleAdditionalRoleChange}
          />

          <FormActions isSubmitting={isSubmitting} />
        </form>
      </Form>
    </div>
  );
};

export default AddTeamMemberForm;

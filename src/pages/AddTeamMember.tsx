
import React from "react";
import NewTeamMemberOnboardingForm from "@/components/team/NewTeamMemberOnboardingForm";

const AddTeamMember: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#181828] p-6">
      <div className="max-w-3xl mx-auto">
        <NewTeamMemberOnboardingForm />
      </div>
    </div>
  );
};

export default AddTeamMember;

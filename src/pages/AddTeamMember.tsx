
import React from "react";
import AddTeamMemberHeader from "@/components/team/AddTeamMemberHeader";
import AddTeamMemberForm from "@/components/team/AddTeamMemberForm";

const AddTeamMember = () => {
  return (
    <div className="min-h-screen bg-[#181828] p-6">
      <div className="max-w-7xl mx-auto">
        <AddTeamMemberHeader />
        <AddTeamMemberForm />
      </div>
    </div>
  );
};

export default AddTeamMember;

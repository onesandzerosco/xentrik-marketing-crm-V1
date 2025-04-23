
import React from "react";
import { BackButton } from "@/components/ui/back-button";

const AddTeamMemberHeader = () => (
  <div className="flex items-center gap-3 mb-8">
    <BackButton to="/team" />
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Team Member</h1>
      <p className="text-gray-400 text-sm mt-1">
        Create login credentials and assign teams and roles
      </p>
    </div>
  </div>
);

export default AddTeamMemberHeader;

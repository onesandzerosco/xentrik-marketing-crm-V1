
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";

const FormHeader: React.FC = () => {
  return (
    <>
      <CardTitle className="text-xl mb-2">Add Team Member</CardTitle>
      <CardDescription className="mb-6">
        Create a new authenticated account for a team member
      </CardDescription>
    </>
  );
};

export default FormHeader;

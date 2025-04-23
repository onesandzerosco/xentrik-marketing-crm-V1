
import React from "react";
import OnboardingPageHeader from "@/components/creators/onboarding/OnboardingPageHeader";
import OnboardingFormContainer from "@/components/creators/onboarding/OnboardingFormContainer";
import OnboardingTeamMemberForm from "@/components/team/OnboardingTeamMemberForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AddTeamMember = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formValues: any) => {
    setIsSubmitting(true);
    try {
      // You would replace this with the necessary logic to create a team member in Supabase
      // await submitTeamMember(formValues);
      toast({
        title: "Team member added",
        description: `${formValues.name} has been added to the team.`,
      });
      navigate("/team");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] p-6">
      <OnboardingFormContainer>
        <OnboardingPageHeader 
          isSubmitting={isSubmitting}
          onSubmit={() => {
            // No-op as the header button is now always on the form, the true submit is inside form
          }}
        />
        <OnboardingTeamMemberForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </OnboardingFormContainer>
    </div>
  );
};

export default AddTeamMember;

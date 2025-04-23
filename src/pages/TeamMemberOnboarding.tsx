
import React from 'react';
import { BackButton } from '@/components/ui/back-button';
import { TeamProvider } from '@/context/TeamContext';
import OnboardingTeamMemberForm from '@/components/team/OnboardingTeamMemberForm';

const TeamMemberOnboarding = () => {
  return (
    <TeamProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <BackButton to="/team" />
          <h1 className="text-2xl font-bold">Add New Team Member</h1>
        </div>
        
        <OnboardingTeamMemberForm />
      </div>
    </TeamProvider>
  );
};

export default TeamMemberOnboarding;

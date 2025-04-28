
import React from 'react';
import { Loader2 } from 'lucide-react';
import { TeamMember } from '@/types/team';
import TeamMemberCard from './TeamMemberCard';
import TeamEmptyState from './TeamEmptyState';

interface TeamMembersListProps {
  members: TeamMember[];
  isLoading: boolean;
  hasFilters: boolean;
  onEditMember: (member: TeamMember) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  isLoading,
  hasFilters,
  onEditMember
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-yellow mb-4" />
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return <TeamEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map(member => (
        <TeamMemberCard 
          key={member.id} 
          teamMember={member} 
          onEditClick={() => onEditMember(member)}
        />
      ))}
    </div>
  );
};

export default TeamMembersList;

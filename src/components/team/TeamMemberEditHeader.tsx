
import React from 'react';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface TeamMemberEditHeaderProps {
  memberName: string;
  isCurrentUser: boolean;
  onSave: () => void;
}

const TeamMemberEditHeader: React.FC<TeamMemberEditHeaderProps> = ({
  memberName,
  isCurrentUser,
  onSave
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <BackButton to={`/team/${memberName}`} />
      <div>
        <h1 className="text-2xl font-bold">Edit Team Member</h1>
        <p className="text-sm text-muted-foreground">
          Update information for {memberName}
          {isCurrentUser && " (me)"}
        </p>
      </div>
      <div className="flex gap-3 ml-auto">
        <Button 
          onClick={onSave}
          className="text-black rounded-[15px] px-4 py-2 transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default TeamMemberEditHeader;


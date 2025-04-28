
import React from 'react';
import { Users } from 'lucide-react';

interface TeamHeaderTitleProps {
  memberCount: number;
  isLoading: boolean;
}

const TeamHeaderTitle: React.FC<TeamHeaderTitleProps> = ({ memberCount, isLoading }) => {
  return (
    <div className="flex items-center gap-2">
      <Users className="h-6 w-6 text-white" />
      <h1 className="text-2xl font-bold text-white">
        Total Team Members: 
        <span className="ml-2 text-brand-yellow">{isLoading ? "..." : memberCount}</span>
      </h1>
    </div>
  );
};

export default TeamHeaderTitle;

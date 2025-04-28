
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamFilters } from '@/types/team';

interface TeamFilterClearProps {
  filters: TeamFilters;
  onClearFilters: () => void;
}

const TeamFilterClear: React.FC<TeamFilterClearProps> = ({
  filters,
  onClearFilters
}) => {
  if (!(filters.roles.length > 0 || filters.teams.length > 0 || filters.status.length > 0 || filters.searchQuery)) {
    return null;
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-12 text-white hover:text-white/80" 
      onClick={onClearFilters}
    >
      <span className="mr-1">Clear</span>
      <Filter className="h-4 w-4 text-white" />
    </Button>
  );
};

export default TeamFilterClear;


import React from 'react';
import { TeamFilters } from '@/types/team';
import TeamHeaderTitle from './header/TeamHeaderTitle';
import TeamHeaderActions from './header/TeamHeaderActions';
import TeamFiltersSearch from './header/TeamFiltersSearch';
import TeamFilterDropdowns from './header/TeamFilterDropdowns';
import TeamFilterClear from './header/TeamFilterClear';

interface TeamHeaderProps {
  memberCount: number;
  isLoading: boolean;
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
  onClearFilters: () => void;
}

const TeamHeader: React.FC<TeamHeaderProps> = ({
  memberCount,
  isLoading,
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  return (
    <div className="mb-8">
      {/* Header with Count and Add Button */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <TeamHeaderTitle memberCount={memberCount} isLoading={isLoading} />
        <TeamHeaderActions />
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <TeamFiltersSearch filters={filters} onFiltersChange={onFiltersChange} />
        <TeamFilterDropdowns filters={filters} onFiltersChange={onFiltersChange} />
        <TeamFilterClear filters={filters} onClearFilters={onClearFilters} />
      </div>
    </div>
  );
};

export default TeamHeader;

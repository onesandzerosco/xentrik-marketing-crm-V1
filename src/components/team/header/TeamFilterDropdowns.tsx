
import React from 'react';
import { TeamFilters } from '@/types/team';
import RolesDropdown from './dropdowns/RolesDropdown';
import TeamsDropdown from './dropdowns/TeamsDropdown';
import StatusDropdown from './dropdowns/StatusDropdown';

interface TeamFilterDropdownsProps {
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
}

const TeamFilterDropdowns: React.FC<TeamFilterDropdownsProps> = ({
  filters,
  onFiltersChange
}) => {
  return (
    <>
      <RolesDropdown filters={filters} onFiltersChange={onFiltersChange} />
      <TeamsDropdown filters={filters} onFiltersChange={onFiltersChange} />
      <StatusDropdown filters={filters} onFiltersChange={onFiltersChange} />
    </>
  );
};

export default TeamFilterDropdowns;

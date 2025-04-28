
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TeamFilters } from '@/types/team';

interface TeamFiltersSearchProps {
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
}

const TeamFiltersSearch: React.FC<TeamFiltersSearchProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchQuery: e.target.value
    });
  };

  return (
    <div className="relative flex-1">
      <Input 
        placeholder="Search by name or email..." 
        className="pl-10 h-12 w-full bg-background border-white/20 text-white" 
        value={filters.searchQuery} 
        onChange={handleSearchChange} 
      />
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <SlidersHorizontal className="h-5 w-5 text-white" />
      </span>
    </div>
  );
};

export default TeamFiltersSearch;

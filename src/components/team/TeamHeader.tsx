
import React, { useState } from 'react';
import { 
  Users, 
  SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeamMemberRole } from '@/types/employee';
import { TeamFilters } from '@/types/team';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  onClearFilters,
}) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(filters.searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onFiltersChange({ ...filters, searchQuery: e.target.value });
  };

  const toggleRole = (role: TeamMemberRole) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    
    onFiltersChange({ ...filters, roles: newRoles });
  };

  const toggleTeam = (team: "A" | "B" | "C") => {
    const newTeams = filters.teams.includes(team)
      ? filters.teams.filter(t => t !== team)
      : [...filters.teams, team];
    
    onFiltersChange({ ...filters, teams: newTeams });
  };

  const toggleStatus = (status: "Active" | "Inactive" | "Paused") => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4 w-full">
        <div className="flex-grow max-w-3xl">
          <Input
            placeholder="Search by name or email..."
            className="bg-[#252538] text-white border-none rounded-xl h-12 px-4 text-sm"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-[#252538] text-white border-none rounded-xl px-4 py-2 text-sm flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Roles
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-[#252538] text-white border-none rounded-xl px-4 py-2 text-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Teams
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-[#252538] text-white border-none rounded-xl px-4 py-2 text-sm flex items-center gap-2"
          >
            Status
          </Button>
        </div>
        
        <Button
          onClick={() => navigate('/team/onboard')}
          className="bg-[#FFD54F] text-black rounded-xl px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#FFD54F]/90"
        >
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>
    </div>
  );
};

export default TeamHeader;

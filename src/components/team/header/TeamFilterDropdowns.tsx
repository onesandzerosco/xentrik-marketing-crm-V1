
import React from 'react';
import { SlidersHorizontal, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TeamMemberRole } from '@/types/employee';
import { TeamFilters } from '@/types/team';

interface TeamFilterDropdownsProps {
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
}

const TeamFilterDropdowns: React.FC<TeamFilterDropdownsProps> = ({
  filters,
  onFiltersChange
}) => {
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
    <>
      {/* Role Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white"
          >
            <SlidersHorizontal className="h-5 w-5 text-white" />
            Roles
            {filters.roles.length > 0 && 
              <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                {filters.roles.length}
              </span>
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
          <DropdownMenuLabel className="text-white">Filter by role</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/20" />
          {["Admin", "Manager", "Employee"].map(role => (
            <DropdownMenuCheckboxItem 
              key={role} 
              checked={filters.roles.includes(role as TeamMemberRole)} 
              onCheckedChange={() => toggleRole(role as TeamMemberRole)} 
              className="text-white"
            >
              {role}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Team Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white"
          >
            <Users className="h-5 w-5 text-white" />
            Teams
            {filters.teams.length > 0 && 
              <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                {filters.teams.length}
              </span>
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
          <DropdownMenuLabel className="text-white">Filter by team</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/20" />
          {["A", "B", "C"].map(team => (
            <DropdownMenuCheckboxItem 
              key={team} 
              checked={filters.teams.includes(team as any)} 
              onCheckedChange={() => toggleTeam(team as any)} 
              className="text-white"
            >
              Team {team}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full flex gap-2 items-center min-w-[120px] h-12 border-white/20 text-white"
          >
            <Filter className="h-5 w-5 text-white" />
            Status
            {filters.status.length > 0 && 
              <span className="ml-1 bg-white/10 text-xs px-2 py-0.5 rounded-full text-white">
                {filters.status.length}
              </span>
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-50 w-44 bg-background border-white/20">
          <DropdownMenuLabel className="text-white">Filter by status</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/20" />
          {["Active", "Inactive", "Paused"].map(status => (
            <DropdownMenuCheckboxItem 
              key={status} 
              checked={filters.status.includes(status as any)} 
              onCheckedChange={() => toggleStatus(status as any)} 
              className="text-white"
            >
              {status}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default TeamFilterDropdowns;

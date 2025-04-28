
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TeamFilters } from '@/types/team';

interface TeamsDropdownProps {
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
}

const TeamsDropdown: React.FC<TeamsDropdownProps> = ({
  filters,
  onFiltersChange
}) => {
  const toggleTeam = (team: "A" | "B" | "C") => {
    const newTeams = filters.teams.includes(team) 
      ? filters.teams.filter(t => t !== team) 
      : [...filters.teams, team];
    onFiltersChange({ ...filters, teams: newTeams });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full flex gap-2 items-center min-w-[120px] h-14 border-white/20 text-white"
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
  );
};

export default TeamsDropdown;

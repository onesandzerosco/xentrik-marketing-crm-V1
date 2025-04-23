
import React, { useState } from 'react';
import { 
  Users, 
  Search,
  SlidersHorizontal,
  X,
  AlertCircle
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

  const hasActiveFilters = filters.roles.length > 0 || 
                          filters.teams.length > 0 || 
                          filters.status.length > 0 || 
                          filters.searchQuery !== '';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Team Management</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground animate-pulse">Loading...</div>
          ) : (
            <Badge variant="outline" className="bg-primary/10">
              {memberCount} team members
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => {
                setSearchValue('');
                onFiltersChange({ ...filters, searchQuery: '' });
              }}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Roles
                {filters.roles.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.roles.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["Chatters", "Creative Director", "Manager", "Developer", "Editor"].map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={filters.roles.includes(role as TeamMemberRole)}
                  onCheckedChange={() => toggleRole(role as TeamMemberRole)}
                >
                  {role}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Teams
                {filters.teams.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.teams.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by team</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["A", "B", "C"].map((team) => (
                <DropdownMenuCheckboxItem
                  key={team}
                  checked={filters.teams.includes(team as "A" | "B" | "C")}
                  onCheckedChange={() => toggleTeam(team as "A" | "B" | "C")}
                >
                  Team {team}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Status
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["Active", "Inactive", "Paused"].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.status.includes(status as "Active" | "Inactive" | "Paused")}
                  onCheckedChange={() => toggleStatus(status as "Active" | "Inactive" | "Paused")}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;

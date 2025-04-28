
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TeamMemberRole } from '@/types/employee';
import { TeamFilters } from '@/types/team';

interface RolesDropdownProps {
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
}

const RolesDropdown: React.FC<RolesDropdownProps> = ({
  filters,
  onFiltersChange
}) => {
  const toggleRole = (role: TeamMemberRole) => {
    const newRoles = filters.roles.includes(role) 
      ? filters.roles.filter(r => r !== role) 
      : [...filters.roles, role];
    onFiltersChange({ ...filters, roles: newRoles });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full flex gap-2 items-center min-w-[120px] h-14 border-white/20 text-white"
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
        {["Admin", "Manager", "Employee", "Chatters", "Creative Director", "Developer", "Editor"].map((role) => (
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
  );
};

export default RolesDropdown;


import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TeamFilters } from '@/types/team';

interface StatusDropdownProps {
  filters: TeamFilters;
  onFiltersChange: (filters: TeamFilters) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  filters,
  onFiltersChange
}) => {
  const toggleStatus = (status: "Active" | "Inactive" | "Paused") => {
    const newStatus = filters.status.includes(status) 
      ? filters.status.filter(s => s !== status) 
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full flex gap-2 items-center min-w-[120px] h-14 border-white/20 text-white"
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
  );
};

export default StatusDropdown;

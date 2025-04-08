
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FilterRole } from "../../types/employee";

interface EmployeeFilterBadgesProps {
  selectedRoles: FilterRole[];
  setSelectedRoles: (roles: FilterRole[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleClearFilters: () => void;
}

const EmployeeFilterBadges: React.FC<EmployeeFilterBadgesProps> = ({
  selectedRoles,
  setSelectedRoles,
  searchQuery,
  setSearchQuery,
  handleClearFilters,
}) => {
  if (selectedRoles.length === 0 && !searchQuery) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center">
      <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
      <div className="flex flex-wrap gap-2">
        {selectedRoles.map((role) => (
          <div key={role} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
            {role}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => setSelectedRoles(selectedRoles.filter(r => r !== role))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {searchQuery && (
          <div className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
            Search: {searchQuery}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-6"
          onClick={handleClearFilters}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default EmployeeFilterBadges;

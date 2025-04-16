
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  selectedGenders: string[];
  selectedTeams: string[];
  selectedClasses: string[];
  setSelectedGenders: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedGenders,
  selectedTeams,
  selectedClasses,
  setSelectedGenders,
  setSelectedTeams,
  setSelectedClasses,
  handleClearFilters
}) => {
  const hasActiveFilters = selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0;
  
  if (!hasActiveFilters) return null;
  
  return (
    <div className="mb-6 flex items-center bg-card/50 p-4 rounded-lg border border-border">
      <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
      <div className="flex flex-wrap gap-2">
        {selectedGenders.map(gender => (
          <div key={gender} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
            {gender}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 ml-1 p-0" 
              onClick={() => setSelectedGenders(selectedGenders.filter(g => g !== gender))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {selectedTeams.map(team => (
          <div key={team} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
            {team}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 ml-1 p-0" 
              onClick={() => setSelectedTeams(selectedTeams.filter(t => t !== team))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {selectedClasses.map(classType => (
          <div key={classType} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
            {classType}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 ml-1 p-0" 
              onClick={() => setSelectedClasses(selectedClasses.filter(c => c !== classType))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={handleClearFilters}>
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
};

export default ActiveFilters;

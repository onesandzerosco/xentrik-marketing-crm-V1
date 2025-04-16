
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import TagFilter from "@/components/TagFilter";

interface FilterSectionProps {
  genderTags: string[];
  teamTags: string[];
  classTags: string[];
  selectedGenders: string[];
  selectedTeams: string[];
  selectedClasses: string[];
  setSelectedGenders: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  genderTags,
  teamTags,
  classTags,
  selectedGenders,
  selectedTeams,
  selectedClasses,
  setSelectedGenders,
  setSelectedTeams,
  setSelectedClasses,
  handleClearFilters
}) => {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Gender</h3>
        <TagFilter tags={genderTags} selectedTags={selectedGenders} onChange={setSelectedGenders} type="gender" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-3">Team</h3>
        <TagFilter tags={teamTags} selectedTags={selectedTeams} onChange={setSelectedTeams} type="team" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-3">Class</h3>
        <TagFilter tags={classTags} selectedTags={selectedClasses} onChange={setSelectedClasses} type="class" />
      </div>
      {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && (
        <Button variant="ghost" className="mt-4" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}
    </div>
  );
};

export default FilterSection;


import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import FilterSection from "./FilterSection";

interface CreatorsHeaderProps {
  isLoading: boolean;
  creatorCount: number;
  selectedGenders: string[];
  selectedTeams: string[];
  selectedClasses: string[];
  setSelectedGenders: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  handleClearFilters: () => void;
}

const CreatorsHeader: React.FC<CreatorsHeaderProps> = ({
  isLoading,
  creatorCount,
  selectedGenders,
  selectedTeams,
  selectedClasses,
  setSelectedGenders,
  setSelectedTeams,
  setSelectedClasses,
  handleClearFilters
}) => {
  const genderTags = ["Male", "Female", "Trans"];
  const teamTags = ["A Team", "B Team", "C Team"];
  const classTags = ["Real", "AI"];
  
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 pl-0 text-left">Creators</h1>
        <p className="text-muted-foreground pl-0">
          {isLoading ? 
            "Loading creators..." : 
            `${creatorCount} creators in your database`
          }
        </p>
      </div>
      
      <div className="flex gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="premium" 
              className="flex items-center gap-2 shadow-premium-yellow hover:shadow-premium-highlight"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Creators</SheetTitle>
              <SheetDescription>
                Filter creators by gender, team and class
              </SheetDescription>
            </SheetHeader>
            <FilterSection
              genderTags={genderTags}
              teamTags={teamTags}
              classTags={classTags}
              selectedGenders={selectedGenders}
              selectedTeams={selectedTeams}
              selectedClasses={selectedClasses}
              setSelectedGenders={setSelectedGenders}
              setSelectedTeams={setSelectedTeams}
              setSelectedClasses={setSelectedClasses}
              handleClearFilters={handleClearFilters}
            />
          </SheetContent>
        </Sheet>
        
        <Link to="/creators/onboard">
          <Button variant="premium" className="shadow-premium-yellow hover:shadow-premium-highlight">
            <Plus className="h-4 w-4 mr-2" />
            Onboard Creator
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CreatorsHeader;

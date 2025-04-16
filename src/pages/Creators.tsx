
import React, { useState, useEffect } from "react";
import { useCreators } from "../context/creator";
import CreatorCard from "../components/CreatorCard";
import TagFilter from "../components/TagFilter";
import { Button } from "@/components/ui/button";
import { Filter, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Creators = () => {
  const {
    creators,
    filterCreators
  } = useCreators();
  
  // Log creators when component mounts and whenever creators change
  useEffect(() => {
    console.log("Creators component - current creators:", creators);
  }, [creators]);
  
  // State for filters - not persisted to localStorage
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const { toast } = useToast();
  
  const genderTags = ["Male", "Female", "Trans", "AI"];
  const teamTags = ["A Team", "B Team", "C Team"];
  const classTags = ["Real", "AI"];
  
  const filteredCreators = filterCreators({
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses
  });

  useEffect(() => {
    console.log("Filtered creators:", filteredCreators);
  }, [filteredCreators]);
  
  const handleClearFilters = () => {
    setSelectedGenders([]);
    setSelectedTeams([]);
    setSelectedClasses([]);
  };
  
  return <div className="p-8 w-full max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 pl-0 text-left">Creators</h1>
          <p className="text-muted-foreground pl-0">
            {filteredCreators.length} creators in your database
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
                {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && <Button variant="ghost" className="mt-4" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear all filters
                  </Button>}
              </div>
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

      {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && <div className="mb-6 flex items-center bg-card/50 p-4 rounded-lg border border-border">
          <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {selectedGenders.map(gender => <div key={gender} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
                {gender}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSelectedGenders(selectedGenders.filter(g => g !== gender))}>
                  <X className="h-3 w-3" />
                </Button>
              </div>)}
            {selectedTeams.map(team => <div key={team} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
                {team}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSelectedTeams(selectedTeams.filter(t => t !== team))}>
                  <X className="h-3 w-3" />
                </Button>
              </div>)}
            {selectedClasses.map(classType => <div key={classType} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
                {classType}
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSelectedClasses(selectedClasses.filter(c => c !== classType))}>
                  <X className="h-3 w-3" />
                </Button>
              </div>)}
            {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0) && <Button variant="ghost" size="sm" className="text-xs h-6" onClick={handleClearFilters}>
                Clear all
              </Button>}
          </div>
        </div>}

      <div className="space-y-2">
        {filteredCreators.map(creator => <CreatorCard key={creator.id} creator={creator} />)}
      </div>

      {filteredCreators.length === 0 && <div className="text-center py-12 bg-card/50 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-2">No creators found</h3>
          <p className="text-muted-foreground mb-4">Try changing your filters or add a new creator</p>
          <Link to="/creators/onboard">
            <Button variant="premium" className="shadow-premium-yellow hover:shadow-premium-highlight">
              <Plus className="h-4 w-4 mr-2" />
              Onboard Creator
            </Button>
          </Link>
        </div>}
    </div>;
};

export default Creators;

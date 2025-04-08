
import React, { useState, useEffect } from "react";
import { useCreators } from "../context/CreatorContext";
import Sidebar from "../components/Sidebar";
import CreatorCard from "../components/CreatorCard";
import TagFilter from "../components/TagFilter";
import { Button } from "@/components/ui/button";
import { Filter, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OnboardingModal from "../components/OnboardingModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

// Keys for localStorage
const FILTER_KEYS = {
  GENDER: 'creator_filter_gender',
  TEAM: 'creator_filter_team',
  CLASS: 'creator_filter_class',
  REVIEW: 'creator_filter_review'
};

const Creators = () => {
  const { creators, filterCreators } = useCreators();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  
  // Initialize state with values from localStorage or empty arrays
  const [selectedGenders, setSelectedGenders] = useState<string[]>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.GENDER);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.TEAM);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedClasses, setSelectedClasses] = useState<string[]>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.CLASS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedReviewStatuses, setSelectedReviewStatuses] = useState<string[]>(() => {
    const saved = localStorage.getItem(FILTER_KEYS.REVIEW);
    return saved ? JSON.parse(saved) : [];
  });
  
  const { toast } = useToast();

  const genderTags = ["Male", "Female", "Trans", "AI"];
  const teamTags = ["A Team", "B Team", "C Team"];
  const classTags = ["Real", "AI"];
  const reviewTags = ["Needs Review", "Reviewed"];

  // Save to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.GENDER, JSON.stringify(selectedGenders));
  }, [selectedGenders]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.TEAM, JSON.stringify(selectedTeams));
  }, [selectedTeams]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.CLASS, JSON.stringify(selectedClasses));
  }, [selectedClasses]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_KEYS.REVIEW, JSON.stringify(selectedReviewStatuses));
  }, [selectedReviewStatuses]);

  const filteredCreators = filterCreators({
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses,
    reviewStatus: selectedReviewStatuses,
  });

  const handleClearFilters = () => {
    setSelectedGenders([]);
    setSelectedTeams([]);
    setSelectedClasses([]);
    setSelectedReviewStatuses([]);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-60 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Creators</h1>
            <p className="text-muted-foreground">
              {filteredCreators.length} creators in your database
            </p>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Creators</SheetTitle>
                  <SheetDescription>
                    Filter creators by gender, team, class and review status
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Gender</h3>
                    <TagFilter
                      tags={genderTags}
                      selectedTags={selectedGenders}
                      onChange={setSelectedGenders}
                      type="gender"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Team</h3>
                    <TagFilter
                      tags={teamTags}
                      selectedTags={selectedTeams}
                      onChange={setSelectedTeams}
                      type="team"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Class</h3>
                    <TagFilter
                      tags={classTags}
                      selectedTags={selectedClasses}
                      onChange={setSelectedClasses}
                      type="class"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3">Review Status</h3>
                    <TagFilter
                      tags={reviewTags}
                      selectedTags={selectedReviewStatuses}
                      onChange={setSelectedReviewStatuses}
                      type="review"
                    />
                  </div>
                  {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || selectedReviewStatuses.length > 0) && (
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Button 
              onClick={() => setOnboardingOpen(true)}
              className="bg-brand text-black hover:bg-brand/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Onboard Creator
            </Button>
          </div>
        </div>

        {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || selectedReviewStatuses.length > 0) && (
          <div className="mb-6 flex items-center">
            <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {selectedGenders.map((gender) => (
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
              {selectedTeams.map((team) => (
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
              {selectedClasses.map((classType) => (
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
              {selectedReviewStatuses.map((status) => (
                <div key={status} className="bg-secondary text-foreground text-xs px-3 py-1 rounded-full flex items-center">
                  {status}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setSelectedReviewStatuses(selectedReviewStatuses.filter(s => s !== status))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {(selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || selectedReviewStatuses.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={handleClearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>

        {filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No creators found</h3>
            <p className="text-muted-foreground mb-4">Try changing your filters or add a new creator</p>
            <Button 
              onClick={() => setOnboardingOpen(true)}
              className="bg-brand text-black hover:bg-brand/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Onboard Creator
            </Button>
          </div>
        )}
      </div>
      
      <OnboardingModal 
        open={onboardingOpen} 
        onOpenChange={setOnboardingOpen} 
      />
    </div>
  );
};

export default Creators;


import React, { useState, useEffect } from "react";
import { useCreators } from "../context/creator";
import CreatorsHeader from "../components/creators/list/CreatorsHeader";
import ActiveFilters from "../components/creators/list/ActiveFilters";
import CreatorsList from "../components/creators/list/CreatorsList";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart2, Edit } from "lucide-react";

const Creators = () => {
  const { creators, filterCreators } = useCreators();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pass searchQuery to filterCreators
  const filteredCreators = filterCreators({
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses,
    searchQuery,
  });

  useEffect(() => {
    if (creators.length > 0) {
      setIsLoading(false);
    } else if (creators.length === 0 && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [creators, isLoading]);

  useEffect(() => {
    if (creators.length > 0) {
      console.log("Creators loaded:", creators.length);
      console.log("Sample creator data:", creators[0]);
    }
  }, [creators]);

  const handleClearFilters = () => {
    setSelectedGenders([]);
    setSelectedTeams([]);
    setSelectedClasses([]);
    setSearchQuery("");
  };

  const hasFilters = selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0 || !!searchQuery;

  return (
    <div className="p-8 w-full max-w-[1400px] mx-auto">
      <CreatorsHeader 
        isLoading={isLoading}
        creatorCount={filteredCreators.length}
        selectedGenders={selectedGenders}
        selectedTeams={selectedTeams}
        selectedClasses={selectedClasses}
        setSelectedGenders={setSelectedGenders}
        setSelectedTeams={setSelectedTeams}
        setSelectedClasses={setSelectedClasses}
        handleClearFilters={handleClearFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <CreatorsList 
        isLoading={isLoading}
        creators={filteredCreators}
        hasFilters={hasFilters}
        renderCreatorActions={(creator) => (
          <div className="flex gap-2">
            <Link to={`/creators/${creator.id}/analytics`}>
              <Button variant="outline" size="sm" className="border-white/20 text-white">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to={`/creators/${creator.id}`}>
              <Button variant="outline" size="sm" className="border-white/20 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        )}
      />
    </div>
  );
};

export default Creators;

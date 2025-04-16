
import React, { useState, useEffect } from "react";
import { useCreators } from "../context/creator";
import CreatorsHeader from "../components/creators/list/CreatorsHeader";
import ActiveFilters from "../components/creators/list/ActiveFilters";
import CreatorsList from "../components/creators/list/CreatorsList";

const Creators = () => {
  const { creators, filterCreators } = useCreators();
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
  const filteredCreators = filterCreators({
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses
  });

  useEffect(() => {
    // Set loading state based on creators data
    if (creators.length > 0) {
      setIsLoading(false);
    } else if (creators.length === 0 && isLoading) {
      // Add a delay to show loading state for a better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [creators, isLoading]);
  
  const handleClearFilters = () => {
    setSelectedGenders([]);
    setSelectedTeams([]);
    setSelectedClasses([]);
  };
  
  const hasFilters = selectedGenders.length > 0 || selectedTeams.length > 0 || selectedClasses.length > 0;
  
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
      />

      <ActiveFilters 
        selectedGenders={selectedGenders}
        selectedTeams={selectedTeams}
        selectedClasses={selectedClasses}
        setSelectedGenders={setSelectedGenders}
        setSelectedTeams={setSelectedTeams}
        setSelectedClasses={setSelectedClasses}
        handleClearFilters={handleClearFilters}
      />

      <CreatorsList 
        isLoading={isLoading}
        creators={filteredCreators}
        hasFilters={hasFilters}
      />
    </div>
  );
};

export default Creators;

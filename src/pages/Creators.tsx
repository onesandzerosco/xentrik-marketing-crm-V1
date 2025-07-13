
import React, { useState, useEffect } from "react";
import { useCreators } from "../context/creator";
import { useAuth } from "@/context/AuthContext";
import CreatorsHeader from "../components/creators/list/CreatorsHeader";
import CreatorsManagementList from "../components/creators/management/CreatorsManagementList";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Creators = () => {
  const { creators, filterCreators } = useCreators();
  const { userRole, userRoles, isCreator, creatorId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  // Filter creators based on user role
  const displayCreators = React.useMemo(() => {
    // If user is a Creator themselves but not an Admin/VA/Chatter, only show their own profile
    if (isCreator && 
        creatorId && 
        !["Admin", "VA", "Chatter"].some(role => userRole === role || userRoles.includes(role))) {
      return creators.filter(creator => creator.id === creatorId);
    }
    return filteredCreators;
  }, [creators, filteredCreators, isCreator, creatorId, userRole, userRoles]);

  return (
    <div className={`w-full mx-auto ${isMobile ? 'p-4 max-w-full' : 'p-8 max-w-[1400px]'}`}>
      <CreatorsHeader 
        isLoading={isLoading}
        creatorCount={displayCreators.length}
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

      <CreatorsManagementList 
        isLoading={isLoading}
        creators={displayCreators}
        hasFilters={hasFilters}
      />
    </div>
  );
};

export default Creators;

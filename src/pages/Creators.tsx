
import React, { useState, useEffect } from "react";
import { useCreators } from "../context/creator";
import CreatorsHeader from "../components/creators/list/CreatorsHeader";
import ActiveFilters from "../components/creators/list/ActiveFilters";
import CreatorsManagementList from "../components/creators/management/CreatorsManagementList";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Creators = () => {
  const { creators, filterCreators } = useCreators();
  const { userRole, userRoles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if user has both Chatter and Creator roles
  const isChatter = userRole === "Chatter" || userRoles.includes("Chatter");
  const isCreator = userRole === "Creator" || userRoles.includes("Creator");
  const isAdmin = userRole === "Admin" || userRoles.includes("Admin");

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

  // Determine if user should have access to this page
  useEffect(() => {
    // If user is only a Creator (not also a Chatter, VA, or Admin), they shouldn't access this page
    if (isCreator && !isChatter && !isAdmin && userRole !== "VA" && !userRoles.includes("VA")) {
      toast({
        title: "Access Restricted",
        description: "You don't have permission to view the creators list",
        variant: "destructive"
      });
      // Note: We could redirect here if needed
    }
  }, [isCreator, isChatter, isAdmin, userRole, userRoles, toast]);

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

      {/* Remove old ActiveFilters, can show chip-row if you want */}
      {/* 
      <ActiveFilters 
        selectedGenders={selectedGenders}
        selectedTeams={selectedTeams}
        selectedClasses={selectedClasses}
        setSelectedGenders={setSelectedGenders}
        setSelectedTeams={setSelectedTeams}
        setSelectedClasses={setSelectedClasses}
        handleClearFilters={handleClearFilters}
      />
      */}

      <CreatorsManagementList 
        isLoading={isLoading}
        creators={filteredCreators}
        hasFilters={hasFilters}
      />
    </div>
  );
};

export default Creators;

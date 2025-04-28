
import React, { useState, useEffect } from "react";
import { useCreators } from '../context/creator';
import CreatorsHeader from "../components/creators/list/CreatorsHeader";
import CreatorsList from "../components/creators/list/CreatorsList";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SharedFiles = () => {
  const { creators, filterCreators } = useCreators();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get file counts for each creator
  const { data: fileCountsMap = {} } = useQuery({
    queryKey: ['creator-file-counts'],
    queryFn: async () => {
      const creatorCounts: Record<string, { total: number, uploading: number }> = {};
      
      for (const creator of creators) {
        const { data: filesData } = await supabase.storage
          .from('creator_files')
          .list(`${creator.id}/shared`);
          
        creatorCounts[creator.id] = {
          total: filesData?.length || 0,
          uploading: 0 // This would be updated in real-time when uploads are happening
        };
      }
      
      return creatorCounts;
    }
  });

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
      />
    </div>
  );
};

export default SharedFiles;


import React, { useState, useEffect } from "react";
import { useCreators } from '../context/creator';
import SharedFilesHeader from "../components/files/SharedFilesHeader";
import SharedFilesCreatorList from "../components/files/shared/SharedFilesCreatorList";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SharedFiles = () => {
  const { creators, filterCreators } = useCreators();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isCreator, creatorId, userRole, userRoles, isCreatorSelf } = useAuth();
  const navigate = useNavigate();

  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // If user is a creator viewing their own files, redirect them directly to their files
  useEffect(() => {
    if (isCreatorSelf && creatorId) {
      // Find the creator data to get the name for display
      const creatorData = creators.find(c => c.id === creatorId);
      if (creatorData) {
        navigate(`/creator-files/${creatorId}`, { 
          state: { 
            creatorName: creatorData.name 
          } 
        });
      } else {
        // If creator data isn't loaded yet, just navigate with ID
        navigate(`/creator-files/${creatorId}`);
      }
    }
  }, [isCreatorSelf, creatorId, creators, navigate]);

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

  // Filter creators based on user role
  let displayCreators = creators;
  
  // If user is a creator but not admin/VA, they should only see their own files
  // Note: We only need this as a fallback since we're redirecting creators directly
  if (isCreator && !["Admin", "VA", "Chatter"].some(role => userRole === role || userRoles.includes(role))) {
    displayCreators = creators.filter(creator => creator.id === creatorId);
  }

  // Pass searchQuery to filterCreators
  const filteredCreators = filterCreators({
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses,
    searchQuery,
  }, displayCreators);

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
      <SharedFilesHeader 
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

      <SharedFilesCreatorList 
        isLoading={isLoading}
        creators={filteredCreators}
        hasFilters={hasFilters}
        fileCountsMap={fileCountsMap}
      />
    </div>
  );
};

export default SharedFiles;

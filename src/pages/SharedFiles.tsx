
import React, { useState, useEffect } from "react";
import { useCreators } from '../context/creator';
import SharedFilesHeader from "../components/files/SharedFilesHeader";
import SharedFilesCreatorList from "../components/files/shared/SharedFilesCreatorList";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Local storage key for resumable uploads
const PENDING_UPLOADS_KEY = 'pendingUploads';

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
  const [hasPendingUploads, setHasPendingUploads] = useState(false);

  // Check for pending uploads on component mount
  useEffect(() => {
    const checkPendingUploads = () => {
      try {
        const pendingUploadsJson = localStorage.getItem(PENDING_UPLOADS_KEY);
        if (!pendingUploadsJson) {
          setHasPendingUploads(false);
          return;
        }
        
        const pendingUploads = JSON.parse(pendingUploadsJson);
        setHasPendingUploads(pendingUploads.length > 0);
      } catch (error) {
        console.error('Error checking pending uploads:', error);
        localStorage.removeItem(PENDING_UPLOADS_KEY);
        setHasPendingUploads(false);
      }
    };
    
    checkPendingUploads();
    
    // Set up an event listener for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === PENDING_UPLOADS_KEY) {
        checkPendingUploads();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
        // Count files in the media table for this creator
        const { count, error } = await supabase
          .from('media')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', creator.id);
          
        if (error) {
          console.error('Error counting files for creator:', error);
        }
        
        // Check for any pending uploads for this creator
        let uploadingCount = 0;
        try {
          const pendingUploadsJson = localStorage.getItem(PENDING_UPLOADS_KEY);
          if (pendingUploadsJson) {
            const pendingUploads = JSON.parse(pendingUploadsJson);
            uploadingCount = pendingUploads.filter(
              (upload: any) => upload.creatorId === creator.id
            ).length;
          }
        } catch (error) {
          console.error('Error parsing pending uploads:', error);
        }
        
        creatorCounts[creator.id] = {
          total: count || 0,
          uploading: uploadingCount
        };
      }
      
      return creatorCounts;
    },
    enabled: creators.length > 0
  });

  // Filter creators based on user role
  let displayCreators = creators;
  
  // If user is a creator but not admin/VA, they should only see their own files
  // Note: We only need this as a fallback since we're redirecting creators directly
  if (isCreator && !["Admin", "VA", "Chatter"].some(role => userRole === role || userRoles.includes(role))) {
    displayCreators = creators.filter(creator => creator.id === creatorId);
  }

  // Create filter options object
  const filterOptions = {
    gender: selectedGenders,
    team: selectedTeams,
    creatorType: selectedClasses,
    searchQuery,
  };

  // Pass the filter options to filterCreators
  const filteredCreators = filterCreators(filterOptions);

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
      {hasPendingUploads && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 rounded shadow">
          <p>You have pending uploads that will resume automatically.</p>
        </div>
      )}
      
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

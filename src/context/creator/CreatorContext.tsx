
import React, { createContext, useContext, useState, useEffect } from "react";
import { Creator } from "@/types";
import { useActivities } from "../ActivityContext";
import { CreatorContextType } from "./types";
import { useCreatorActions } from "./useCreatorActions";
import { useCreatorFilters } from "./useCreatorFilters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const CreatorContext = createContext<CreatorContextType>({
  creators: [],
  addCreator: async () => undefined,
  updateCreator: () => {},
  getCreator: () => undefined,
  getCreatorStats: () => undefined,
  filterCreators: () => [],
});

export const useCreators = () => useContext(CreatorContext);

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addActivity } = useActivities();
  const { toast } = useToast();
  
  const { addCreator, updateCreator } = useCreatorActions(creators, setCreators, addActivity);
  const { filterCreators } = useCreatorFilters(creators);

  // Load creators from Supabase
  useEffect(() => {
    const loadCreators = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching creators from Supabase...");
        
        // Fetch creators with all related data in one request
        const { data, error } = await supabase
          .from('creators')
          .select(`
            *,
            creator_social_links (*),
            creator_tags (tag)
          `);

        if (error) {
          throw error;
        }

        console.log("Raw creator data from Supabase:", data);
        
        if (!data || data.length === 0) {
          console.log("No creators found in database");
          setCreators([]);
          setIsLoading(false);
          return;
        }

        // Transform the data to match the Creator type
        const formattedCreators: Creator[] = data.map(creator => ({
          id: creator.id,
          name: creator.name,
          email: creator.email || '',
          profileImage: creator.profile_image || '',
          gender: creator.gender,
          team: creator.team,
          creatorType: creator.creator_type,
          socialLinks: creator.creator_social_links?.[0] || {},
          tags: creator.creator_tags?.map(t => t.tag) || [],
          assignedTeamMembers: [],
          needsReview: creator.needs_review || false,
          telegramUsername: creator.telegram_username || '',
          whatsappNumber: creator.whatsapp_number || '',
          notes: creator.notes || ''
        }));

        console.log("Formatted creators data:", formattedCreators);
        setCreators(formattedCreators);
      } catch (error) {
        console.error("Error loading creators:", error);
        toast({
          title: "Error loading creators",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCreators();
    
    // Subscribe to changes in the creators table
    const channel = supabase
      .channel('creators-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'creators' 
      }, (payload) => {
        console.log('Realtime update received:', payload);
        loadCreators(); // Reload all creators when any change occurs
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const getCreator = (id: string) => {
    return creators.find((creator) => creator.id === id);
  };

  const getCreatorStats = (id: string) => {
    // Note: Implement stats fetching from Supabase if needed
    return undefined;
  };

  return (
    <CreatorContext.Provider value={{
      creators,
      addCreator,
      updateCreator,
      getCreator,
      getCreatorStats,
      filterCreators,
    }}>
      {children}
    </CreatorContext.Provider>
  );
};

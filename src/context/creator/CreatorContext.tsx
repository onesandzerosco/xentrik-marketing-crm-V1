
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
      console.log("[CreatorContext] Loading creators from Supabase...");
      
      try {
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('creators')
          .select(`
            *,
            creator_social_links (*),
            creator_tags (tag),
            creator_team_members (team_member_id)
          `);

        if (creatorsError) {
          console.error('[CreatorContext] Error loading creators:', creatorsError);
          toast({
            title: "Failed to load creators",
            description: `Error: ${creatorsError.message}`,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        console.log("[CreatorContext] Raw creators data from Supabase:", creatorsData);

        if (!creatorsData || creatorsData.length === 0) {
          console.log("[CreatorContext] No creators found in database");
          setCreators([]);
          setIsLoading(false);
          return;
        }

        const formattedCreators: Creator[] = creatorsData.map(creator => ({
          id: creator.id,
          name: creator.name,
          email: creator.email,
          profileImage: creator.profile_image || "",
          gender: creator.gender,
          team: creator.team,
          creatorType: creator.creator_type,
          socialLinks: creator.creator_social_links?.[0] || {},
          tags: creator.creator_tags?.map(t => t.tag) || [],
          assignedTeamMembers: creator.creator_team_members?.map(tm => tm.team_member_id) || [],
          needsReview: creator.needs_review || false,
          telegramUsername: creator.telegram_username,
          whatsappNumber: creator.whatsapp_number,
          notes: creator.notes
        }));

        console.log("[CreatorContext] Formatted creators:", formattedCreators);
        setCreators(formattedCreators);
      } catch (error) {
        console.error("[CreatorContext] Error in loadCreators:", error);
        toast({
          title: "Failed to load creators",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCreators();
    
    // Subscribe to changes in the creators table
    const creatorsSubscription = supabase
      .channel('creators-channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'creators' 
      }, (payload) => {
        console.log('[CreatorContext] Realtime update received for creators:', payload);
        loadCreators(); // Reload creators when changes occur
      })
      .subscribe((status) => {
        console.log('[CreatorContext] Creators subscription status:', status);
      });

    return () => {
      supabase.removeChannel(creatorsSubscription);
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

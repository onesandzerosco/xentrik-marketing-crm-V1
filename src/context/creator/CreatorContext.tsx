
import React, { createContext, useContext, useState, useEffect } from "react";
import { Creator } from "@/types";
import { useActivities } from "../ActivityContext";
import { CreatorContextType } from "./types";
import { useCreatorActions } from "./useCreatorActions";
import { useCreatorFilters } from "./useCreatorFilters";
import { supabase } from "@/integrations/supabase/client";

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
  const { addActivity } = useActivities();
  
  const { addCreator, updateCreator } = useCreatorActions(creators, setCreators, addActivity);
  const { filterCreators } = useCreatorFilters(creators);

  // Load creators from Supabase
  useEffect(() => {
    const loadCreators = async () => {
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('creators')
        .select(`
          *,
          creator_social_links (*),
          creator_tags (tag),
          creator_team_members (team_member_id)
        `);

      if (creatorsError) {
        console.error('Error loading creators:', creatorsError);
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
        socialLinks: creator.creator_social_links || {},
        tags: creator.creator_tags?.map(t => t.tag) || [],
        assignedTeamMembers: creator.creator_team_members?.map(tm => tm.team_member_id) || [],
        needsReview: creator.needs_review || false,
        telegramUsername: creator.telegram_username,
        whatsappNumber: creator.whatsapp_number,
        notes: creator.notes
      }));

      setCreators(formattedCreators);
    };

    loadCreators();
  }, []);

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

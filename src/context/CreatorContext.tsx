
import React, { createContext, useContext, useState, useEffect } from "react";
import { Creator, EngagementStats } from "../types";
import { useActivities } from "./ActivityContext";
import { CreatorContextType } from "./creator/types";
import { supabase } from "@/integrations/supabase/client";

const CreatorContext = createContext<CreatorContextType>({
  creators: [],
  addCreator: () => {},
  updateCreator: () => {},
  getCreator: () => undefined,
  getCreatorStats: () => undefined,
  filterCreators: () => [],
});

export const useCreators = () => useContext(CreatorContext);

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const { addActivity } = useActivities();

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

      const formattedCreators = creatorsData.map(creator => ({
        ...creator,
        socialLinks: creator.creator_social_links || {},
        tags: creator.creator_tags?.map(t => t.tag) || [],
        assignedTeamMembers: creator.creator_team_members?.map(tm => tm.team_member_id) || []
      }));

      setCreators(formattedCreators);
    };

    loadCreators();
  }, []);

  const addCreator = async (creator: Omit<Creator, "id">) => {
    const { data: newCreator, error: creatorError } = await supabase
      .from('creators')
      .insert({
        name: creator.name,
        profile_image: creator.profileImage,
        gender: creator.gender,
        team: creator.team,
        creator_type: creator.creatorType,
        needs_review: true,
      })
      .select()
      .single();

    if (creatorError || !newCreator) {
      console.error('Error creating creator:', creatorError);
      return;
    }

    if (creator.socialLinks) {
      const { error: socialError } = await supabase
        .from('creator_social_links')
        .insert({
          creator_id: newCreator.id,
          ...creator.socialLinks
        });

      if (socialError) console.error('Error adding social links:', socialError);
    }

    if (creator.tags?.length) {
      const { error: tagsError } = await supabase
        .from('creator_tags')
        .insert(
          creator.tags.map(tag => ({
            creator_id: newCreator.id,
            tag
          }))
        );

      if (tagsError) console.error('Error adding tags:', tagsError);
    }

    addActivity("create", `New creator onboarded: ${creator.name}`, newCreator.id);
  };

  const updateCreator = async (id: string, updates: Partial<Creator>) => {
    const { error: creatorError } = await supabase
      .from('creators')
      .update({
        name: updates.name,
        profile_image: updates.profileImage,
        gender: updates.gender,
        team: updates.team,
        creator_type: updates.creatorType,
        needs_review: updates.needsReview,
      })
      .eq('id', id);

    if (creatorError) {
      console.error('Error updating creator:', creatorError);
      return;
    }

    if (updates.socialLinks) {
      const { error: socialError } = await supabase
        .from('creator_social_links')
        .upsert({
          creator_id: id,
          ...updates.socialLinks
        });

      if (socialError) console.error('Error updating social links:', socialError);
    }

    // Update activity log
    const existingCreator = creators.find(c => c.id === id);
    if (existingCreator && updates.name) {
      addActivity("update", `Profile updated for: ${existingCreator.name}`, id);
    }
  };

  const getCreator = (id: string) => {
    return creators.find((creator) => creator.id === id);
  };

  const getCreatorStats = (id: string) => {
    // Note: Implement stats fetching from Supabase if needed
    return undefined;
  };

  const filterCreators = (filters: { gender?: string[]; team?: string[]; creatorType?: string[] }) => {
    return creators.filter((creator) => {
      let genderMatch = true;
      let teamMatch = true;
      let creatorTypeMatch = true;

      if (filters.gender && filters.gender.length > 0) {
        genderMatch = filters.gender.includes(creator.gender);
      }

      if (filters.team && filters.team.length > 0) {
        teamMatch = filters.team.includes(creator.team);
      }

      if (filters.creatorType && filters.creatorType.length > 0) {
        creatorTypeMatch = filters.creatorType.includes(creator.creatorType);
      }

      return genderMatch && teamMatch && creatorTypeMatch;
    });
  };

  return (
    <CreatorContext.Provider
      value={{
        creators,
        addCreator,
        updateCreator,
        getCreator,
        getCreatorStats,
        filterCreators,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
};

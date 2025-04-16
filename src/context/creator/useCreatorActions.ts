
import { useState, useCallback } from "react";
import { Creator } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useCreatorActions = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
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
        telegram_username: creator.telegramUsername,
        whatsapp_number: creator.whatsappNumber,
        notes: creator.notes
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
    
    // Add the new creator to the local state
    const newCreatorObject: Creator = {
      id: newCreator.id,
      name: creator.name,
      profileImage: creator.profileImage,
      gender: creator.gender,
      team: creator.team,
      creatorType: creator.creatorType,
      socialLinks: creator.socialLinks || {},
      tags: creator.tags || [],
      needsReview: true,
      telegramUsername: creator.telegramUsername,
      whatsappNumber: creator.whatsappNumber,
      notes: creator.notes
    };
    
    setCreators(prevCreators => [...prevCreators, newCreatorObject]);
    return newCreator.id;
  };

  const updateCreator = async (id: string, updates: Partial<Creator>) => {
    // Only send fields that exist in the creators table
    const { error: creatorError } = await supabase
      .from('creators')
      .update({
        name: updates.name,
        profile_image: updates.profileImage,
        gender: updates.gender,
        team: updates.team,
        creator_type: updates.creatorType,
        needs_review: updates.needsReview,
        telegram_username: updates.telegramUsername,
        whatsapp_number: updates.whatsappNumber,
        notes: updates.notes
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
    
    // Update the creator in the local state
    setCreators(prevCreators => 
      prevCreators.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    );
  };

  return {
    addCreator,
    updateCreator
  };
};

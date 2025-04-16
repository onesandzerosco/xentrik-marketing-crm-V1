
import { useState, useCallback } from "react";
import { Creator } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useCreatorActions = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
  const addCreator = async (creator: Omit<Creator, "id">) => {
    console.log("[useCreatorActions] Starting creator creation process:", creator);
    
    try {
      // Step 1: Insert the creator
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

      if (creatorError) {
        console.error('[useCreatorActions] Error creating creator:', creatorError);
        throw new Error(`Creator creation failed: ${creatorError.message}`);
      }

      if (!newCreator) {
        throw new Error('Creator was created but no data was returned');
      }

      console.log("[useCreatorActions] Creator created successfully:", newCreator);

      // Step 2: Add social links if available
      if (creator.socialLinks && Object.keys(creator.socialLinks).length > 0) {
        const socialLinksWithCreatorId = {
          creator_id: newCreator.id,
          ...creator.socialLinks
        };
        
        console.log("[useCreatorActions] Adding social links:", socialLinksWithCreatorId);
        
        const { error: socialLinksError } = await supabase
          .from('creator_social_links')
          .insert(socialLinksWithCreatorId);

        if (socialLinksError) {
          console.error('[useCreatorActions] Error adding social links:', socialLinksError);
          // We don't throw here as we want to continue with tags even if social links fail
        } else {
          console.log("[useCreatorActions] Social links added successfully");
        }
      }

      // Step 3: Add tags if available
      if (creator.tags?.length) {
        const tagsToInsert = creator.tags.map(tag => ({
          creator_id: newCreator.id,
          tag
        }));
        
        console.log("[useCreatorActions] Adding tags:", tagsToInsert);
        
        const { error: tagsError } = await supabase
          .from('creator_tags')
          .insert(tagsToInsert);

        if (tagsError) {
          console.error('[useCreatorActions] Error adding tags:', tagsError);
          // We don't throw here as tags are not critical
        } else {
          console.log("[useCreatorActions] Tags added successfully:", creator.tags);
        }
      }

      // Step 4: Add the activity log
      addActivity("create", `New creator onboarded: ${creator.name}`, newCreator.id);
      
      // Step 5: Update the local state with the new creator
      const newCreatorObject: Creator = {
        id: newCreator.id,
        name: creator.name,
        profileImage: creator.profileImage || "",
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
      
      console.log("[useCreatorActions] Adding creator to local state:", newCreatorObject);
      setCreators(prevCreators => {
        const updatedCreators = [...prevCreators, newCreatorObject];
        console.log("[useCreatorActions] Updated creators list:", updatedCreators);
        return updatedCreators;
      });
      
      return newCreator.id;
    } catch (error) {
      console.error("[useCreatorActions] Creator onboarding failed:", error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const updateCreator = async (id: string, updates: Partial<Creator>) => {
    try {
      console.log("[useCreatorActions] Updating creator:", id, updates);
      
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
        console.error('[useCreatorActions] Error updating creator:', creatorError);
        throw new Error(`Creator update failed: ${creatorError.message}`);
      }

      if (updates.socialLinks) {
        console.log("[useCreatorActions] Updating social links for creator:", id);
        
        const socialLinksData = {
          creator_id: id,
          ...updates.socialLinks
        };
        
        // First check if social links already exist
        const { data: existingLinks } = await supabase
          .from('creator_social_links')
          .select('*')
          .eq('creator_id', id);
          
        if (existingLinks && existingLinks.length > 0) {
          // Update existing links
          const { error: socialError } = await supabase
            .from('creator_social_links')
            .update(updates.socialLinks)
            .eq('creator_id', id);
            
          if (socialError) {
            console.error('[useCreatorActions] Error updating social links:', socialError);
          }
        } else {
          // Insert new links
          const { error: socialError } = await supabase
            .from('creator_social_links')
            .insert(socialLinksData);
            
          if (socialError) {
            console.error('[useCreatorActions] Error inserting social links:', socialError);
          }
        }
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
      
      console.log("[useCreatorActions] Creator updated successfully");
    } catch (error) {
      console.error("[useCreatorActions] Creator update failed:", error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  return {
    addCreator,
    updateCreator
  };
};


import { Creator } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useUpdateCreator = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
  const updateCreator = async (id: string, updates: Partial<Creator>) => {
    try {
      console.log("Updating creator:", id, updates);
      
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
        throw new Error(`Creator update failed: ${creatorError.message}`);
      }

      // Update social links if provided
      if (updates.socialLinks) {
        const socialLinksData = {
          ...updates.socialLinks,
          creator_id: id
        };
        
        // First check if links already exist
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
            console.error('Error updating social links:', socialError);
          }
        } else {
          // Insert new links
          const { error: socialError } = await supabase
            .from('creator_social_links')
            .insert(socialLinksData);
            
          if (socialError) {
            console.error('Error inserting social links:', socialError);
          }
        }
      }

      // Add activity log entry
      addActivity("update", `Updated creator: ${updates.name || 'Unknown'}`, id);
      
      return id;
    } catch (error) {
      console.error("Creator update failed:", error);
      throw error;
    }
  };

  return { updateCreator };
};

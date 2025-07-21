
import { Creator } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const useUpdateCreator = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
  const updateCreator = async (id: string, updates: Partial<Creator>) => {
    try {
      console.log("Updating creator:", id, updates);
      
      // Check if profileImage is a data URL or object URL (usually starts with blob: or data:)
      if (updates.profileImage && (updates.profileImage.startsWith('data:image') || updates.profileImage.startsWith('blob:'))) {
        try {
          // Convert URL to file and upload to Supabase
          const res = await fetch(updates.profileImage);
          const blob = await res.blob();
          const file = new File([blob], `profile_${id}_${Date.now()}.png`, { type: 'image/png' });
          
          // Generate a unique file path
          const safeName = updates.name?.replace(/\s+/g, '-').toLowerCase() || id;
          const filePath = `${safeName}/${uuidv4()}.png`;
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('profile_images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (!error && data) {
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('profile_images')
              .getPublicUrl(data.path);
              
            // Update the profileImage to use the Supabase URL
            updates.profileImage = publicUrl;
            console.log("Uploaded image URL:", publicUrl);
          } else {
            console.error("Error uploading data URL image:", error);
          }
        } catch (error) {
          console.error("Failed to convert and upload data URL:", error);
          // We'll keep the data URL as fallback
        }
      }

      console.log("Prepared updates for Supabase:", updates);

      // Only send fields that exist in the creators table
      const { error: creatorError } = await supabase
        .from('creators')
        .update({
          name: updates.name,
          model_name: updates.modelName, // Add model_name field
          email: updates.email, // Add email field
          profile_image: updates.profileImage,
          gender: updates.gender,
          team: updates.team,
          creator_type: updates.creatorType,
          marketing_strategy: updates.marketingStrategy, // Add marketing strategy array field
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
        console.log("Updating social links:", updates.socialLinks);
        
        const socialLinksData = {
          creator_id: id,
          instagram: updates.socialLinks.instagram || null,
          tiktok: updates.socialLinks.tiktok || null,
          twitter: updates.socialLinks.twitter || null,
          reddit: updates.socialLinks.reddit || null,
          chaturbate: updates.socialLinks.chaturbate || null,
          youtube: updates.socialLinks.youtube || null,
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
            .update(socialLinksData)
            .eq('creator_id', id);
            
          if (socialError) {
            console.error('Error updating social links:', socialError);
            throw new Error(`Social links update failed: ${socialError.message}`);
          }
        } else {
          // Insert new links
          const { error: socialError } = await supabase
            .from('creator_social_links')
            .insert(socialLinksData);
            
          if (socialError) {
            console.error('Error inserting social links:', socialError);
            throw new Error(`Social links insert failed: ${socialError.message}`);
          }
        }
      }

      // Add activity log entry
      addActivity("update", `Updated creator: ${updates.name || 'Unknown'}`, id);
      
      // Update local state
      setCreators(prevCreators => 
        prevCreators.map(creator => 
          creator.id === id ? { ...creator, ...updates } : creator
        )
      );
      
      console.log("Creator update complete, local state updated");
      
      return id;
    } catch (error) {
      console.error("Creator update failed:", error);
      throw error;
    }
  };

  return { updateCreator };
};

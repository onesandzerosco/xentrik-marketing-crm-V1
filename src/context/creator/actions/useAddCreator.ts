
import { Creator } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Function to generate a slug from creator name
const generateCreatorId = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
  
  // Add random suffix for uniqueness
  const randomString = uuidv4().substring(0, 8);
  return `${slug}-${randomString}`;
};

export const useAddCreator = (
  creators: Creator[],
  setCreators: React.Dispatch<React.SetStateAction<Creator[]>>,
  addActivity: (action: string, description: string, creatorId: string) => void
) => {
  const addCreator = async (creator: Omit<Creator, "id">) => {
    console.log("Starting creator creation process:", creator);
    
    try {
      // Generate ID based on creator's name
      const customId = generateCreatorId(creator.name);
      
      console.log("Generated creator ID:", customId);
      
      // Check if profileImage is a data URL
      let profileImageUrl = creator.profileImage;
      if (profileImageUrl && (profileImageUrl.startsWith('data:') || profileImageUrl.startsWith('blob:'))) {
        try {
          console.log("Uploading profile image to Supabase storage");
          // Convert data URL to file
          const res = await fetch(profileImageUrl);
          const blob = await res.blob();
          const file = new File([blob], `profile_${Date.now()}.png`, { type: 'image/png' });
          
          // Generate a unique file path
          const safeName = creator.name.replace(/\s+/g, '-').toLowerCase();
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
            profileImageUrl = publicUrl;
            console.log("Uploaded image URL:", publicUrl);
          } else {
            console.error("Error uploading profile image:", error);
          }
        } catch (error) {
          console.error("Failed to upload profile image:", error);
        }
      }
      
      // Step 1: Insert the creator basic info
      const { data: newCreator, error: creatorError } = await supabase
        .from('creators')
        .insert({
          id: customId,
          name: creator.name,
          profile_image: profileImageUrl,
          gender: creator.gender,
          team: creator.team,
          creator_type: creator.creatorType,
          needs_review: false,
          telegram_username: creator.telegramUsername,
          whatsapp_number: creator.whatsappNumber,
          notes: creator.notes
        })
        .select()
        .single();

      if (creatorError) {
        console.error('Error creating creator:', creatorError);
        throw new Error(`Creator creation failed: ${creatorError.message}`);
      }

      if (!newCreator) {
        throw new Error('Creator was created but no data was returned');
      }

      console.log("Creator created successfully:", newCreator);

      // Step 2: Add social links if available
      if (creator.socialLinks && Object.keys(creator.socialLinks).length > 0) {
        const socialLinksWithCreatorId = {
          creator_id: newCreator.id,
          ...Object.keys(creator.socialLinks).reduce((acc, key) => {
            // Only include non-empty values
            if (creator.socialLinks[key]) {
              acc[key] = creator.socialLinks[key];
            }
            return acc;
          }, {} as Record<string, string>)
        };
        
        console.log("Adding social links:", socialLinksWithCreatorId);
        
        if (Object.keys(socialLinksWithCreatorId).length > 1) { // > 1 because it always includes creator_id
          const { error: socialLinksError } = await supabase
            .from('creator_social_links')
            .insert(socialLinksWithCreatorId);

          if (socialLinksError) {
            console.error('Error adding social links:', socialLinksError);
          } else {
            console.log("Social links added successfully");
          }
        } else {
          console.log("No social links to add");
        }
      }

      // Step 3: Add tags
      if (creator.tags && creator.tags.length > 0) {
        const tagsToInsert = creator.tags.map(tag => ({
          creator_id: newCreator.id,
          tag
        }));
        
        console.log("Adding tags:", tagsToInsert);
        
        const { error: tagsError } = await supabase
          .from('creator_tags')
          .insert(tagsToInsert);

        if (tagsError) {
          console.error('Error adding tags:', tagsError);
        } else {
          console.log("Tags added successfully");
        }
      }

      // Step 4: Add the new creator to the local state immediately
      const formattedCreator: Creator = {
        id: newCreator.id,
        name: creator.name,
        email: '',
        profileImage: profileImageUrl || '',
        gender: creator.gender,
        team: creator.team,
        creatorType: creator.creatorType,
        socialLinks: creator.socialLinks || {},
        tags: creator.tags || [],
        assignedTeamMembers: [],
        needsReview: false,
        telegramUsername: creator.telegramUsername || '',
        whatsappNumber: creator.whatsappNumber || '',
        notes: creator.notes || ''
      };
      
      // Add to local state immediately
      setCreators(prevCreators => [...prevCreators, formattedCreator]);

      // Add to activity log
      addActivity("create", `New creator onboarded: ${creator.name}`, newCreator.id);
      
      return newCreator.id;
    } catch (error) {
      console.error("Creator onboarding failed:", error);
      throw error;
    }
  };

  return { addCreator };
};

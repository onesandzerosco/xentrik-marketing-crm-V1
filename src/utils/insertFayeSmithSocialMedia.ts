
import { supabase } from "@/integrations/supabase/client";

/**
 * One-time script to insert Faye Smith's social media handles
 * Based on her onboarding submission data
 */
export const insertFayeSmithSocialMedia = async () => {
  try {
    console.log("=== INSERTING FAYE SMITH'S SOCIAL MEDIA HANDLES ===");
    
    const creatorEmail = "melissalewisbet@hotmail.com";
    
    // Faye Smith's social media data from the onboarding submission
    const socialMediaData = {
      tiktok: "Faye19572",
      twitter: "",
      onlyfans: "X123fayex", 
      snapchat: "",
      instagram: "Fayesmith123x"
    };
    
    const socialMediaRecords = [];
    
    // Create records for all predefined platforms
    const predefinedPlatforms = ['tiktok', 'twitter', 'onlyfans', 'snapchat', 'instagram'];
    
    for (const platform of predefinedPlatforms) {
      const username = socialMediaData[platform as keyof typeof socialMediaData] || '';
      
      socialMediaRecords.push({
        creator_email: creatorEmail,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1), // Capitalize first letter
        username: username.trim(),
        password: '',
        notes: '',
        is_predefined: true
      });
    }
    
    console.log("Records to insert:", socialMediaRecords);
    
    // Insert all social media records
    const { data, error } = await supabase
      .from('social_media_logins')
      .insert(socialMediaRecords)
      .select();
    
    if (error) {
      console.error("Error inserting social media handles:", error);
      throw error;
    }
    
    console.log("Successfully inserted social media handles:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("Error in insertFayeSmithSocialMedia:", error);
    return { success: false, error };
  }
};

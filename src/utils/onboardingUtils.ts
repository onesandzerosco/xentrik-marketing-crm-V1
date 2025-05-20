
import { supabase } from "@/integrations/supabase/client";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";
import { v4 as uuidv4 } from "uuid";
import CreatorService from "@/services/creator";

/**
 * Save the creator onboarding data to Supabase database
 * and to creators table with model_profile
 * @param data The form data to save
 * @returns Success status and token or error message
 */
export const saveOnboardingData = async (data: CreatorOnboardingFormValues) => {
  try {
    console.log("Starting saveOnboardingData...");
    // Generate a unique token for the submission
    const token = uuidv4();
    
    // Extract basic info for the onboarding_submissions table
    const email = data.personalInfo?.email || '';
    const name = data.personalInfo?.fullName || 'Unknown';
    
    console.log("Saving to onboarding_submissions database...");
    // Insert into onboarding_submissions table
    const { error } = await supabase
      .from('onboarding_submissions')
      .insert({
        token,
        email,
        name,
        data: data,
        status: 'pending'
      });
    
    if (error) {
      console.error('Error saving onboarding data:', error);
      return { success: false, error: error.message };
    }
    
    console.log("Saving to creators table with pending status");
    
    // Save to creators table with model_profile
    // Don't expect a valid creator ID back yet - it will be pending approval
    await CreatorService.saveOnboardingData(token, data);
    
    console.log("Onboarding data saved successfully");
    return { success: true, token };
  } catch (error) {
    console.error('Error in saveOnboardingData:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * This function is no longer needed as we're using a database table
 * But keeping it here commented out for reference
 */
// export const ensureOnboardBucketExists = async (): Promise<boolean> => { ... }

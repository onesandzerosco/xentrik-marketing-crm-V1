
import { supabase } from "@/integrations/supabase/client";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";
import { v4 as uuidv4 } from "uuid";
import CreatorService from "@/services/creator";

/**
 * Save the creator onboarding data to the onboarding_submissions table
 * @param data The form data to save
 * @returns Success status and token or error message
 */
export const saveOnboardingData = async (data: CreatorOnboardingFormValues) => {
  try {
    console.log("Starting saveOnboardingData...");
    // Generate a unique token for the submission
    const token = uuidv4();
    
    console.log("Converting data to JSON...");
    
    console.log("Saving data to onboarding_submissions table...");
    // Save to onboarding_submissions table
    const submissionId = await CreatorService.saveOnboardingData(token, data);
    
    if (!submissionId) {
      console.error('Error saving submission data');
      return { success: false, error: "Failed to save submission" };
    }
    
    console.log("Submission successful with ID:", submissionId);
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
 * Ensure that the onboard_submissions bucket exists in Supabase Storage
 * @deprecated - We now use the onboarding_submissions table instead
 */
export const ensureOnboardBucketExists = async (): Promise<boolean> => {
  // This function is no longer needed but kept for backward compatibility
  return true;
};

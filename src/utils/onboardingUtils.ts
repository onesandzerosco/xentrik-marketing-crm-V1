
import { supabase } from "@/integrations/supabase/client";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";
import { v4 as uuidv4 } from "uuid";

/**
 * Save the creator onboarding data to Supabase storage
 * @param data The form data to save
 * @returns Success status and token or error message
 */
export const saveOnboardingData = async (data: CreatorOnboardingFormValues) => {
  try {
    // Generate a unique token for the submission
    const token = uuidv4();
    const fileName = `${token}.json`;
    
    // Ensure the onboard_submissions bucket exists
    await ensureOnboardBucketExists();
    
    // Convert the data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Upload the JSON file to the bucket
    const { error } = await supabase.storage
      .from('onboard_submissions')
      .upload(fileName, blob, { contentType: 'application/json' });
    
    if (error) {
      console.error('Error uploading form data:', error);
      return { success: false, error: error.message };
    }
    
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
 * Creates it if it doesn't exist using the Edge Function
 */
export const ensureOnboardBucketExists = async () => {
  try {
    // Check if bucket exists by trying to get bucket details
    const { data, error } = await supabase.storage.getBucket('onboard_submissions');

    // If the bucket doesn't exist, create it using our edge function
    if (error && error.message.includes('The resource was not found')) {
      const { error: funcError } = await supabase.functions.invoke('create-onboard-submissions-bucket');
      
      if (funcError) {
        console.error('Error creating bucket via edge function:', funcError);
        throw new Error(`Failed to create storage bucket: ${funcError.message}`);
      }
      
      console.log('Successfully created onboard_submissions bucket');
    } else if (error) {
      console.error('Error checking bucket existence:', error);
      throw new Error(`Error checking bucket existence: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in ensureOnboardBucketExists:', error);
    throw error;
  }
};

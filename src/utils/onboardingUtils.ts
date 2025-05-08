
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
    console.log("Starting saveOnboardingData...");
    // Generate a unique token for the submission
    const token = uuidv4();
    const fileName = `${token}.json`;
    
    console.log("Ensuring onboard bucket exists...");
    // Ensure the onboard_submissions bucket exists
    await ensureOnboardBucketExists();
    
    console.log("Converting data to JSON...");
    // Convert the data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    console.log("Uploading to onboard_submissions bucket:", fileName);
    // Upload the JSON file to the bucket
    const { data: uploadData, error } = await supabase.storage
      .from('onboard_submissions')
      .upload(fileName, blob, { contentType: 'application/json', upsert: true });
    
    if (error) {
      console.error('Error uploading form data:', error);
      return { success: false, error: error.message };
    }
    
    console.log("Upload successful:", uploadData);
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
export const ensureOnboardBucketExists = async (): Promise<boolean> => {
  try {
    // Check if bucket exists by trying to list files in it
    const { data, error } = await supabase.storage
      .from('onboard_submissions')
      .list('', { limit: 1 });
    
    // If we get an error that might indicate the bucket doesn't exist
    if (error) {
      console.log("Error checking bucket, may not exist:", error.message);
      
      // Call our edge function to create the bucket
      console.log("Invoking edge function to create it");
      const { error: funcError } = await supabase.functions.invoke('create-onboard-submissions-bucket');
      
      if (funcError) {
        console.error('Error creating bucket via edge function:', funcError);
        throw new Error(`Failed to create storage bucket: ${funcError.message}`);
      }
      
      console.log('Successfully created onboard_submissions bucket');
    } else {
      console.log('onboard_submissions bucket already exists');
    }

    return true;
  } catch (error) {
    console.error('Error in ensureOnboardBucketExists:', error);
    throw error;
  }
};

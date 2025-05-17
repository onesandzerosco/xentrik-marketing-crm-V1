
import { supabase } from '../integrations/supabase/client';

/**
 * Ensures that necessary storage buckets exist
 */
export const ensureStorageBucket = async () => {
  try {
    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return false;
    }
    
    // Create creator_files bucket if it doesn't exist
    const creatorFilesBucketExists = buckets?.some(bucket => bucket.name === 'creator_files');
    
    if (!creatorFilesBucketExists) {
      try {
        const { error: createError } = await supabase
          .storage
          .createBucket('creator_files', { public: false });
        
        if (createError) {
          // Log error but don't throw - this is likely an RLS policy error that we can't fix from the client
          console.error("Error creating creator_files bucket:", createError);
        } else {
          console.log('Created creator_files bucket');
        }
      } catch (err) {
        // Just log the error without crashing
        console.error("Failed to create creator_files bucket:", err);
      }
    }
    
    // Create raw_uploads bucket if it doesn't exist
    const rawUploadsBucketExists = buckets?.some(bucket => bucket.name === 'raw_uploads');
    
    if (!rawUploadsBucketExists) {
      try {
        const { error: createError } = await supabase
          .storage
          .createBucket('raw_uploads', { public: false });
        
        if (createError) {
          // Log error but don't throw
          console.error("Error creating raw_uploads bucket:", createError);
        } else {
          console.log('Created raw_uploads bucket');
        }
      } catch (err) {
        console.error("Failed to create raw_uploads bucket:", err);
      }
    }
    
    // Check if team bucket exists
    const teamBucketExists = buckets?.some(bucket => bucket.name === 'team');
    
    if (!teamBucketExists) {
      try {
        const { error: createTeamError } = await supabase
          .storage
          .createBucket('team', { public: true });
        
        if (createTeamError) {
          // Log error but don't throw
          console.error("Error creating team bucket:", createTeamError);
        } else {
          console.log('Created team bucket');
        }
      } catch (err) {
        console.error("Failed to create team bucket:", err);
      }
    }
    
    // Even if we couldn't create the buckets (due to permissions), return true
    // so the app can continue functioning with existing buckets
    return true;
  } catch (err) {
    console.error('Error in ensureStorageBucket:', err);
    return false;
  }
};

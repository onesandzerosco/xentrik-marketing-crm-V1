
import { supabase } from '../integrations/supabase/client';

/**
 * Ensures that necessary storage buckets exist
 */
export const ensureStorageBucket = async () => {
  try {
    // Check if creator_files bucket exists
    const { data: creatorBuckets, error: creatorBucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (creatorBucketsError) throw creatorBucketsError;
    
    // Create creator_files bucket if it doesn't exist
    const creatorFilesBucketExists = creatorBuckets?.some(bucket => bucket.name === 'creator_files');
    
    if (!creatorFilesBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket('creator_files', { public: false });
      
      if (createError) throw createError;
      
      console.log('Created creator_files bucket');
      
      // Set bucket policy (public access)
      const { error: policyError } = await supabase
        .storage
        .from('creator_files')
        .createSignedUrl('dummy.txt', 1);
      
      if (policyError && !policyError.message.includes('not found')) {
        throw policyError;
      }
    }
    
    // Check if team bucket exists
    const teamBucketExists = creatorBuckets?.some(bucket => bucket.name === 'team');
    
    if (!teamBucketExists) {
      const { error: createTeamError } = await supabase
        .storage
        .createBucket('team', { public: true });
      
      if (createTeamError) throw createTeamError;
      
      console.log('Created team bucket');
    }
    
    return true;
  } catch (err) {
    console.error('Error ensuring storage buckets:', err);
    return false;
  }
};

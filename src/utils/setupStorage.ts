
import { supabase } from "@/integrations/supabase/client";

export async function ensureStorageBucket(bucketName: string = 'profile_images') {
  try {
    // Check if bucket exists
    const { data: buckets, error: getBucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (getBucketsError) {
      console.error('Error listing buckets:', getBucketsError);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist, attempting to create it...`);
      // Try to create the bucket
      const { error: createBucketError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        
      if (createBucketError) {
        console.error(`Error creating ${bucketName} bucket:`, createBucketError);
        return false;
      }
      
      console.log(`${bucketName} bucket created successfully`);
    } else {
      console.log(`${bucketName} bucket already exists`);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    return false;
  }
}

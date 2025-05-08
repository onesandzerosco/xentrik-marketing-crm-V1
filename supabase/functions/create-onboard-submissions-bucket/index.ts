
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the service role key (has admin rights)
    const supabaseAdmin = createClient(
      // These env vars are automatically injected when deployed
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if the bucket already exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'onboard_submissions');
    
    if (bucketExists) {
      console.log("Bucket onboard_submissions already exists");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Bucket onboard_submissions already exists' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    // Create the bucket if it doesn't exist
    console.log("Creating onboard_submissions bucket...");
    const { data, error } = await supabaseAdmin.storage.createBucket('onboard_submissions', { 
      public: false,
      allowedMimeTypes: ['application/json'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      throw error;
    }
    
    console.log("Bucket created successfully");
    
    // Set up storage policy for the bucket
    const policyName = 'authenticated_can_upload';
    const { error: policyError } = await supabaseAdmin.rpc('create_storage_policy', {
      bucket_id: 'onboard_submissions',
      policy_name: policyName,
      definition: '(role() = \'authenticated\' OR role() = \'service_role\')',
      operation: 'INSERT'
    }).catch(err => {
      // Policy might already exist, or we failed in some other way
      console.error("Error setting policy:", err);
      return { error: err };
    });
    
    if (policyError) {
      console.warn("Could not set bucket policy, but proceeding:", policyError);
    } else {
      console.log("Bucket policy set successfully");
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bucket onboard_submissions created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error creating bucket:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create bucket' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

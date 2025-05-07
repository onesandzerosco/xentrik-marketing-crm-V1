
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Create Supabase admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if bucket exists
    const { data: existingBuckets } = await supabase
      .storage
      .listBuckets();
    
    const bucketName = "onboard_submissions";
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase
        .storage
        .createBucket(bucketName, {
          public: false, // Make it private since it contains personal information
          fileSizeLimit: 1024 * 1024, // 1MB limit for JSON files
        });
      
      if (error) {
        throw error;
      }
      
      console.log(`Bucket '${bucketName}' created successfully:`, data);
    } else {
      console.log(`Bucket '${bucketName}' already exists`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: bucketExists 
          ? `Bucket '${bucketName}' already exists` 
          : `Bucket '${bucketName}' created successfully`
      }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error: any) {
    console.error("Error creating bucket:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});

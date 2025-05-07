
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
    
    // Initialize supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'onboard_submissions');
    
    if (bucketExists) {
      console.log("Bucket onboard_submissions already exists");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Bucket onboard_submissions already exists",
          exists: true
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
          status: 200
        }
      );
    }
    
    // Create bucket if it doesn't exist
    const { data, error } = await supabase
      .storage
      .createBucket('onboard_submissions', {
        public: false,
        fileSizeLimit: 5242880, // 5MB limit
      });
    
    if (error) {
      console.error("Error creating bucket:", error);
      throw error;
    }
    
    console.log("Created onboard_submissions bucket successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Created onboard_submissions bucket successfully",
        data,
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 200
      }
    );
    
  } catch (error: any) {
    console.error("Request processing error:", error.message);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
        status: 500
      }
    );
  }
});

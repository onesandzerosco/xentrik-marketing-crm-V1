
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
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to create the bucket if it doesn't exist
    // Potential error will be handled in the catch block
    const { data, error } = await supabase
      .storage
      .createBucket('onboard_submissions', {
        public: false,
        allowedMimeTypes: ['application/json'],
        fileSizeLimit: 1024 * 1024, // 1MB
      });

    if (error && error.message !== 'The resource already exists') {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: error ? "Bucket already exists" : "Bucket created successfully",
        data
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
    console.error("Error creating bucket:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
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

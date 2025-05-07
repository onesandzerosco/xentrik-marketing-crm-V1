
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  email: string;
  stageName?: string;
  token: string;
  appUrl: string;
}

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
    
    // Parse request body
    const requestBody = await req.json();
    const { email, stageName, token, appUrl } = requestBody as EmailPayload;
    
    if (!email || !token || !appUrl) {
      throw new Error("Missing required fields");
    }
    
    // Format name for email greeting
    const nameToGreet = stageName || email.split('@')[0];
    
    console.log("Sending creator invitation email to:", email);
    console.log("With onboarding link:", `${appUrl}/onboard/${token}`);
    
    // Initialize supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Use Supabase's built-in email function (which uses the template set in Supabase Dashboard)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${appUrl}/onboard/${token}`,
      data: {
        stage_name: stageName || null,
        invite_type: 'creator',
        greeting_name: nameToGreet
      }
    });
    
    if (error) {
      console.error("Email sending error:", error);
      throw error;
    }
    
    console.log("Email sent successfully to:", email);
    
    // Email sent successfully
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        data: data
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

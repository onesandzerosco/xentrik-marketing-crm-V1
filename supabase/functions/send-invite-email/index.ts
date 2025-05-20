
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { email, stageName, token, appUrl } = await req.json() as EmailPayload;
    
    if (!email || !token || !appUrl) {
      throw new Error("Missing required fields");
    }
    
    console.log("Sending email to:", email);
    console.log("With onboarding link:", `${appUrl}/onboard/${token}`);
    
    // Format name for email greeting if needed
    const nameToGreet = stageName || email.split('@')[0];
    
    // Construct the onboarding link
    const onboardingLink = `${appUrl}/onboard/${token}`;
    
    // Use Supabase's built-in invite function to trigger the custom template
    // Making sure to explicitly use the "invite" template and pass all expected variables
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: onboardingLink,
      data: {
        // Include all potential template variables that might be in the custom template
        name: nameToGreet,
        stage_name: stageName || null,
        token: token,
        onboard_link: onboardingLink,
        agency_name: "Xentrik",
        invitation_link: onboardingLink,
        // Additional fields that might help template rendering
        template: "invite",
        template_type: "invite"
      }
    });
    
    if (error) {
      console.error("Error sending email via Supabase:", error);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
    
    console.log("Email sent successfully:", data);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in send-invite-email function:", error.message);
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

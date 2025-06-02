
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelName, stageName } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('creator_invitations')
      .insert({
        model_name: modelName,
        stage_name: stageName,
        status: 'pending'
      })
      .select()
      .single();
    
    if (inviteError) {
      throw inviteError;
    }
    
    // Detect the referring domain from the request or use default
    const getBaseUrl = () => {
      const environment = Deno.env.get("ENVIRONMENT");
      const referer = req.headers.get("referer");
      
      if (environment === "development") {
        return "http://localhost:8080";
      }
      
      // If called from Lovable domain, use Lovable
      if (referer && referer.includes("lovable.app")) {
        const url = new URL(referer);
        return url.origin;
      }
      
      // If called from Vercel domain, use Vercel
      if (referer && referer.includes("vercel.app")) {
        return "https://xentrik-marketing.vercel.app";
      }
      
      // Default to Vercel for production
      return "https://xentrik-marketing.vercel.app";
    };
    
    const baseUrl = getBaseUrl();
    const inviteUrl = `${baseUrl}/onboard/${invitation.token}`;
    
    console.log(`Invitation created for ${modelName} (${stageName}): ${inviteUrl}`);
    console.log(`Using base URL: ${baseUrl} (detected from referer: ${req.headers.get("referer")})`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        inviteUrl,
        token: invitation.token 
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
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

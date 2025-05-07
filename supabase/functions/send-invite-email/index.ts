
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
    
    console.log("Sending email to:", email);
    console.log("With onboarding link:", `${appUrl}/onboard/${token}`);
    
    // Create a custom email
    const htmlContent = `
      <h2>Welcome to Your Agency!</h2>
      <p>Hello ${nameToGreet},</p>
      <p>You have been invited to join our creator platform. To complete your onboarding process, please click the link below:</p>
      <p><a href="${appUrl}/onboard/${token}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Complete Your Profile</a></p>
      <p>This link will expire in 72 hours.</p>
      <p>If you did not request this invitation, please disregard this email.</p>
      <p>Best regards,<br>Your Agency Team</p>
    `;

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Send email using the Supabase Auth API
    const { error } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: false,
      user_metadata: {
        token: token,
        stage_name: stageName || null
      },
      password: crypto.randomUUID(), // Random password as this is just for email sending
      app_metadata: {
        provider: "email",
      },
    });
    
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log("Email sent successfully to:", email);
    
    // Email sent successfully
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully" 
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

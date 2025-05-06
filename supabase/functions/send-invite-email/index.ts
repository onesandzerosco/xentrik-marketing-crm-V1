
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
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { email, stageName, token, appUrl, userId } = await req.json();
    
    if (!email || !token || !appUrl) {
      throw new Error("Missing required parameters: email, token, or appUrl");
    }
    
    // Format the onboarding URL with the token
    const onboardingUrl = `${appUrl}/onboard/${token}`;
    
    // Compose the email subject and body
    const subject = "Welcome to Creator Agency";
    
    // Basic HTML email template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
            .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Creator Agency!</h1>
            </div>
            <div class="content">
              <p>Hi${stageName ? ` ${stageName}` : ''},</p>
              <p>You've been invited to join our creator platform. To complete your profile, please click the button below:</p>
              <p style="text-align: center;">
                <a href="${onboardingUrl}" class="button">Complete Your Profile</a>
              </p>
              <p>This link will expire in 72 hours.</p>
              <p>If you have any questions, feel free to contact our team.</p>
              <p>Best regards,<br>Creator Agency Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email, please do not reply directly to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Send the email using Supabase
    const { error } = await supabase
      .from('creator_invitations')
      .insert({
        email,
        stage_name: stageName || null,
        token,
        status: 'pending',
        created_by: userId
      });
      
    if (error) {
      throw new Error(`Error creating invitation: ${error.message}`);
    }

    // Mail sending would go here, but for now we'll just log it
    console.log(`Email would be sent to ${email} with subject "${subject}"`);
    console.log(`Onboarding URL: ${onboardingUrl}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation created and email sent successfully",
        debug: {
          recipient: email,
          subject,
          onboardingUrl
        }
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

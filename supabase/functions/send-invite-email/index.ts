
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
    
    // Format name for email greeting
    const nameToGreet = stageName || email.split('@')[0];
    
    console.log("Sending email to:", email);
    console.log("With onboarding link:", `${appUrl}/onboard/${token}`);
    
    // Create a custom PHP-style email template
    const emailSubject = "Welcome to Your Agency";
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            background: #f8f8f8;
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #ddd;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            padding: 10px 20px;
            margin: 20px 0;
            border-radius: 4px;
            font-weight: bold;
          }
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Welcome to Your Agency</h2>
        </div>
        <div class="content">
          <p>Hi ${nameToGreet},</p>
          <p>Thank you for joining Your Agency! To complete your profile setup, please click the button below:</p>
          <p style="text-align: center;">
            <a href="${appUrl}/onboard/${token}" class="button">Complete Your Profile</a>
          </p>
          <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${appUrl}/onboard/${token}</p>
          <p>This link will expire in 72 hours.</p>
          <p>Best regards,<br>Your Agency Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Your Agency. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
    
    // Send custom email using Supabase's email service
    const { error } = await supabase.auth.admin.sendEmail({
      email,
      subject: emailSubject,
      html: emailHtml
    });
    
    if (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
    
    console.log("Email sent successfully to:", email);
    
    return new Response(
      JSON.stringify({ success: true }),
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

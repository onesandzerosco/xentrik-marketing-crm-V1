
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      throw new Error("Invalid request body format");
    }
    
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

    // Use Supabase's email API directly with raw fetch for better control
    const emailApiResponse = await fetch(`${supabaseUrl}/auth/v1/admin/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email,
        subject: "Welcome to Your Agency",
        template: "invite",
        template_data: {
          action_url: `${appUrl}/onboard/${token}`,
          email_name: nameToGreet,
          invite_sender_name: "Your Agency Team",
          invite_site_title: "Creator Management",
          invite_site_url: appUrl,
          product_name: "Your Agency"
        },
        data: {
          user_metadata: {
            token: token,
            stage_name: stageName || null
          }
        },
        html: htmlContent // Fallback HTML content
      })
    });
    
    const status = emailApiResponse.status;
    console.log("Email API status:", status);
    
    let responseData = null;
    try {
      const text = await emailApiResponse.text();
      console.log("Response text:", text);
      if (text && text.length > 0) {
        try {
          responseData = JSON.parse(text);
        } catch (e) {
          console.log("Could not parse response as JSON");
          responseData = { raw: text };
        }
      }
    } catch (e) {
      console.error("Error getting response text:", e);
    }
    
    if (!emailApiResponse.ok) {
      throw new Error(`Failed to send email: Status ${status}`);
    }
    
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
    
  } catch (error) {
    console.error("Email sending error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
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


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
    
    // Prepare email content
    const emailSubject = "Welcome to Your Agency";
    const emailContent = `
      <html>
        <body>
          <h2>Welcome to Your Agency</h2>
          <p>Hi ${nameToGreet},</p>
          <p>You've been invited to join our platform. Click the link below to complete your profile:</p>
          <p><a href="${appUrl}/onboard/${token}">Complete Your Profile</a></p>
          <p>Or copy and paste this URL: ${appUrl}/onboard/${token}</p>
          <p>This link will expire in 72 hours.</p>
          <p>Best regards,<br>The Agency Team</p>
        </body>
      </html>
    `;
    
    // Use the Supabase Auth Admin API to send the email
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email,
        subject: emailSubject,
        template_name: "invite",
        template_data: {
          token,
          invite_url: `${appUrl}/onboard/${token}`,
          site_name: "Your Agency",
          name: nameToGreet,
          email_content: emailContent
        }
      })
    });
    
    console.log("Email API status:", response.status);
    
    // Get the response data
    let responseData;
    try {
      const responseText = await response.text();
      console.log("Raw email API response:", responseText);
      
      // Only try to parse as JSON if there's content
      responseData = responseText ? JSON.parse(responseText) : {};
      console.log("Parsed email API response:", responseData);
    } catch (e) {
      console.error("Error parsing response:", e);
      responseData = { error: "Failed to parse response" };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to send email: Status ${response.status}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully", 
        details: responseData 
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

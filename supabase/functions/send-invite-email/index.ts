
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
    
    // Format name for email greeting - use stage name or email username part
    const nameToGreet = stageName || email.split('@')[0];
    
    console.log("Sending email to:", email);
    console.log("With onboarding link:", `${appUrl}/onboard/${token}`);
    
    // Prepare email content
    const subject = "Welcome to Your Agency";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Your Agency</title>
        </head>
        <body>
          <p>Hi ${nameToGreet},</p>
          <p>Click the link below to complete your profile…</p>
          <p><a href="${appUrl}/onboard/${token}">${appUrl}/onboard/${token}</a></p>
        </body>
      </html>
    `;
    const textContent = `Hi ${nameToGreet}, click the link below to complete your profile... ${appUrl}/onboard/${token}`;
    
    // Use Supabase's built-in mailer with proper API endpoint and authentication
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        subject,
        html: htmlContent,
        text: textContent
      })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("Email API error details:", responseData);
      console.error("Email API status code:", response.status);
      console.error("Email API status text:", response.statusText);
      throw new Error(`Failed to send email: ${responseData.message || responseData.error || 'Unknown error'}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
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

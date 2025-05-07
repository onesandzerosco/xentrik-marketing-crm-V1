
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
    
    // Use Supabase's auth.admin.sendEmail API
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email,
        subject: "Welcome to Your Agency",
        template: "magiclink",
        data: {
          user_display_name: nameToGreet,
          site_url: appUrl,
          action_url: `${appUrl}/onboard/${token}`,
          token
        }
      })
    });
    
    console.log("Email API status:", response.status);
    
    // Get the response data
    let responseData;
    try {
      if (response.headers.get("content-type")?.includes("application/json")) {
        responseData = await response.json();
      } else {
        const responseText = await response.text();
        console.log("Raw email API response:", responseText);
        responseData = { message: responseText };
      }
    } catch (e) {
      console.error("Error parsing response:", e);
      responseData = { error: "Failed to parse response" };
    }
    
    console.log("Email API response data:", responseData);
    
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

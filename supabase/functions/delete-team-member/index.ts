
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Missing userId parameter",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Step 1: Delete all sales_tracker records for this user
    const { error: salesError } = await supabaseAdmin
      .from('sales_tracker')
      .delete()
      .eq('chatter_id', userId);

    if (salesError) {
      console.error("Error deleting sales_tracker records:", salesError);
      // Continue anyway, might not have sales records
    }

    // Step 2: Delete all attendance records for this user
    const { error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .delete()
      .eq('chatter_id', userId);

    if (attendanceError) {
      console.error("Error deleting attendance records:", attendanceError);
      // Continue anyway, might not have attendance records
    }

    // Step 3: Delete all generated_voice_clones for this user
    const { error: voiceError } = await supabaseAdmin
      .from('generated_voice_clones')
      .delete()
      .eq('generated_by', userId);

    if (voiceError) {
      console.error("Error deleting voice clones:", voiceError);
      // Continue anyway
    }

    // Step 4: Delete the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return new Response(
        JSON.stringify({
          error: `Failed to delete profile: ${profileError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 5: Finally delete the user from auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return new Response(
        JSON.stringify({
          error: `Failed to delete auth user: ${authError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: `An unexpected error occurred: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

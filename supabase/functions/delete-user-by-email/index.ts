import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // First, try to find profile by email (may not have auth account)
    const { data: profile, error: profileLookupError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileLookupError) {
      console.error("Error looking up profile:", profileLookupError);
      return new Response(
        JSON.stringify({ error: `Failed to find profile: ${profileLookupError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = profile.id;
    console.log(`Deleting user ${email} with ID: ${userId}`);

    // Check if there's an auth account
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users?.find(u => u.email === email);
    
    if (listError) {
      console.error("Warning: Error checking auth users:", listError);
    }

    // Delete all related records in order (foreign key constraints)
    
    // 1. Delete team_member_roles
    const { error: rolesError } = await supabaseAdmin
      .from('team_member_roles')
      .delete()
      .eq('profile_id', userId);
    if (rolesError) console.error("Error deleting team_member_roles:", rolesError);

    // 2. Delete team_assignments
    const { error: assignmentsError } = await supabaseAdmin
      .from('team_assignments')
      .delete()
      .eq('profile_id', userId);
    if (assignmentsError) console.error("Error deleting team_assignments:", assignmentsError);

    // 3. Delete creator_team_members (where this person is a team member)
    const { error: creatorTeamError } = await supabaseAdmin
      .from('creator_team_members')
      .delete()
      .eq('team_member_id', userId);
    if (creatorTeamError) console.error("Error deleting creator_team_members:", creatorTeamError);

    // 4. Delete creator_telegram_groups (where this person is a team member)
    const { error: telegramError } = await supabaseAdmin
      .from('creator_telegram_groups')
      .delete()
      .eq('team_member_id', userId);
    if (telegramError) console.error("Error deleting creator_telegram_groups:", telegramError);

    // 5. Delete model_announcements created by this user
    const { error: announcementsError } = await supabaseAdmin
      .from('model_announcements')
      .delete()
      .eq('created_by', userId);
    if (announcementsError) console.error("Error deleting model_announcements:", announcementsError);

    // 6. Delete sales_tracker records
    const { error: salesError } = await supabaseAdmin
      .from('sales_tracker')
      .delete()
      .eq('chatter_id', userId);
    if (salesError) console.error("Error deleting sales_tracker:", salesError);

    // 7. Delete attendance records
    const { error: attendanceError } = await supabaseAdmin
      .from('attendance')
      .delete()
      .eq('chatter_id', userId);
    if (attendanceError) console.error("Error deleting attendance:", attendanceError);

    // 8. Delete generated_voice_clones
    const { error: voiceError } = await supabaseAdmin
      .from('generated_voice_clones')
      .delete()
      .eq('generated_by', userId);
    if (voiceError) console.error("Error deleting voice clones:", voiceError);

    // 9. Delete the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return new Response(
        JSON.stringify({ error: `Failed to delete profile: ${profileError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Finally delete the auth user (if exists)
    if (authUser) {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (authError) {
        console.error("Error deleting auth user:", authError);
        return new Response(
          JSON.stringify({ error: `Failed to delete auth user: ${authError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log(`Deleted auth account for ${email}`);
    } else {
      console.log(`No auth account found for ${email}, skipping auth deletion`);
    }

    console.log(`Successfully deleted user ${email}`);
    return new Response(
      JSON.stringify({ success: true, message: `User ${email} deleted successfully` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: `An unexpected error occurred: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

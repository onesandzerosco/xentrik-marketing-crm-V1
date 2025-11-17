
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
    const { creatorId } = await req.json();

    if (!creatorId) {
      return new Response(
        JSON.stringify({
          error: "Missing creatorId parameter",
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

    console.log(`Deleting creator with ID: ${creatorId}`);

    // Delete all related records in order (foreign key constraints)
    
    // 1. Delete creator_tags
    const { error: tagsError } = await supabaseAdmin
      .from('creator_tags')
      .delete()
      .eq('creator_id', creatorId);
    if (tagsError) console.error("Error deleting creator_tags:", tagsError);

    // 2. Delete creator_social_links
    const { error: socialLinksError } = await supabaseAdmin
      .from('creator_social_links')
      .delete()
      .eq('creator_id', creatorId);
    if (socialLinksError) console.error("Error deleting creator_social_links:", socialLinksError);

    // 3. Delete creator_team_members
    const { error: teamMembersError } = await supabaseAdmin
      .from('creator_team_members')
      .delete()
      .eq('creator_id', creatorId);
    if (teamMembersError) console.error("Error deleting creator_team_members:", teamMembersError);

    // 4. Delete creator_telegram_groups
    const { error: telegramGroupsError } = await supabaseAdmin
      .from('creator_telegram_groups')
      .delete()
      .eq('creator_id', creatorId);
    if (telegramGroupsError) console.error("Error deleting creator_telegram_groups:", telegramGroupsError);

    // 5. Delete file_uploads
    const { error: filesError } = await supabaseAdmin
      .from('file_uploads')
      .delete()
      .eq('creator_id', creatorId);
    if (filesError) console.error("Error deleting file_uploads:", filesError);

    // 6. Delete model_announcements
    const { error: announcementsError } = await supabaseAdmin
      .from('model_announcements')
      .delete()
      .eq('creator_id', creatorId);
    if (announcementsError) console.error("Error deleting model_announcements:", announcementsError);

    // 7. Delete marketing_media
    const { error: marketingMediaError } = await supabaseAdmin
      .from('marketing_media')
      .delete()
      .eq('creator_id', creatorId);
    if (marketingMediaError) console.error("Error deleting marketing_media:", marketingMediaError);

    // 8. Delete media
    const { error: mediaError } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('creator_id', creatorId);
    if (mediaError) console.error("Error deleting media:", mediaError);

    // 9. Delete the creator record
    const { error: creatorError } = await supabaseAdmin
      .from('creators')
      .delete()
      .eq('id', creatorId);

    if (creatorError) {
      console.error("Error deleting creator:", creatorError);
      return new Response(
        JSON.stringify({
          error: `Failed to delete creator: ${creatorError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 10. Delete related profile and auth records (if creator has auth)
    // First check if there's a profile with this ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', creatorId)
      .maybeSingle();

    if (profile) {
      console.log(`Creator ${creatorId} has a profile, deleting related records...`);
      
      // Delete profile-related records
      await supabaseAdmin.from('team_member_roles').delete().eq('profile_id', creatorId);
      await supabaseAdmin.from('team_assignments').delete().eq('profile_id', creatorId);
      await supabaseAdmin.from('sales_tracker').delete().eq('chatter_id', creatorId);
      await supabaseAdmin.from('attendance').delete().eq('chatter_id', creatorId);
      await supabaseAdmin.from('generated_voice_clones').delete().eq('generated_by', creatorId);

      // Delete the profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', creatorId);
      
      if (profileError) {
        console.error("Error deleting profile:", profileError);
      }

      // Delete the auth user
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(creatorId);
      
      if (authError) {
        console.error("Error deleting auth user:", authError);
      }
    }

    console.log(`Successfully deleted creator ${creatorId}`);
    return new Response(
      JSON.stringify({ success: true, message: "Creator deleted successfully" }),
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

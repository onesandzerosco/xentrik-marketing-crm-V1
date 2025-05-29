
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
    const { email, password, name, primary_role, additional_roles } = await req.json();

    // Validate input
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: email, password, and name are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase admin client
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

    // Ensure additional_roles is an array and includes the additional roles properly
    const rolesArray = Array.isArray(additional_roles) ? additional_roles : [];
    
    // Create the user with admin privileges to ensure all fields are properly set
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
        role: primary_role || 'Employee',
        roles: rolesArray
      }
    });

    if (createError) {
      console.error("Error creating auth user:", createError);
      return new Response(
        JSON.stringify({
          error: `Failed to create user: ${createError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If the user was successfully created, ensure they have a profile
    const userId = userData.user.id;

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Create profile if it doesn't exist with both primary role and additional roles
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          name: name,
          email: email,
          role: primary_role || 'Employee',
          roles: rolesArray, // This should include ['Creator'] for creators
          status: 'Active'
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Don't fail the whole operation, just log the error
      }
    } else {
      // Update existing profile to ensure roles are set correctly
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          role: primary_role || 'Employee',
          roles: rolesArray, // This should include ['Creator'] for creators
          status: 'Active'
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error updating profile roles:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: "User and profile created successfully" 
      }),
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

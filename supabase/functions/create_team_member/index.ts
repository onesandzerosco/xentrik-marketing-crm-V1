
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, name, primary_role, additional_roles, geographic_restrictions } = await req.json()

    console.log('Creating team member with:', { email, name, primary_role, additional_roles, geographic_restrictions })

    let userId: string | undefined;

    // First check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      userId = existingUser.id
      
      // Update existing user's metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            name,
            role: primary_role,
            roles: additional_roles || [],
            geographic_restrictions: geographic_restrictions || []
          }
        }
      )
      
      if (updateError) {
        console.error('Error updating existing user:', updateError)
      }
    } else {
      // Create the user in auth
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: primary_role,
          roles: additional_roles || [],
          geographic_restrictions: geographic_restrictions || []
        }
      })

      if (userError) {
        console.error('Error creating user:', userError)
        throw userError
      }

      userId = userData.user?.id
      console.log('User created:', userId)
    }

    if (!userId) {
      throw new Error('Failed to get user ID')
    }

    // Wait a moment for trigger to create profile, then update it
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Upsert the profile with all the role information
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        role: primary_role,
        roles: additional_roles || [],
        geographic_restrictions: geographic_restrictions || [],
        status: 'Active'
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    console.log('Profile updated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { id: userId }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create_team_member function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const newPassword = 'XentrikBananas'

    // List all users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (listError) throw listError

    const results = []
    for (const user of users) {
      const { error } = await supabaseAdmin.auth.admin.updateUser(user.id, { password: newPassword })
      results.push({ email: user.email, success: !error, error: error?.message })
    }

    return new Response(JSON.stringify({ total: users.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

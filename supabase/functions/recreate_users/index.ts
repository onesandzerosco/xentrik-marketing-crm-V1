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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { users } = await req.json()
    // users: [{ name, email, role, password }]

    const results = []

    for (const u of users) {
      try {
        // 1. Delete from profiles first
        await supabaseAdmin.from('profiles').delete().eq('email', u.email)

        // 2. Find and delete from auth.users via REST
        const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1000`, {
          headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
        })
        const listData = await listRes.json()
        const allUsers = listData.users || listData
        const existing = allUsers.find((au: any) => au.email === u.email)
        
        if (existing) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${serviceRoleKey}`, 'apikey': serviceRoleKey }
          })
        }

        // 3. Create fresh user via GoTrue admin API
        const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name, role: u.role, roles: u.additionalRoles || [] }
          })
        })

        const createData = await createRes.json()
        if (!createRes.ok) throw new Error(createData.message || createData.msg || 'Failed to create user')

        // 4. Upsert profile
        const { error: profileErr } = await supabaseAdmin.from('profiles').upsert({
          id: createData.id,
          name: u.name,
          email: u.email,
          role: u.role,
          roles: u.additionalRoles || [],
          status: 'Active'
        }, { onConflict: 'id' })

        if (profileErr) throw profileErr

        results.push({ email: u.email, success: true, id: createData.id })
      } catch (err) {
        results.push({ email: u.email, success: false, error: err.message })
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify the caller's JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', detail: userErr?.message }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check caller is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { teacherId } = await req.json()
    if (!teacherId) {
      return new Response(JSON.stringify({ error: 'Missing teacherId' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Find the auth user linked to this teacher
    const { data: teacherProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('teacher_id', teacherId)
      .single()

    if (!teacherProfile) {
      // No account linked — nothing to delete
      return new Response(JSON.stringify({ success: true, deleted: false }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Delete the auth user (cascades to profiles row)
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(teacherProfile.id)
    if (deleteErr) {
      return new Response(JSON.stringify({ error: deleteErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, deleted: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

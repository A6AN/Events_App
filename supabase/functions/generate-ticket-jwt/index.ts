import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const { ticket_id } = await req.json()
    if (!ticket_id) throw new Error('ticket_id required')

    // Verify ownership
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, event_id, user_id, status')
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) throw new Error('Ticket not found or not owned by user')
    if (ticket.status === 'cancelled' || ticket.status === 'refunded') throw new Error('Ticket is not active')

    const signingKey = Deno.env.get('TICKET_SIGNING_KEY')
    if (!signingKey) throw new Error('Signing key not configured')

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    const jwt = await create(
      { alg: 'HS256', typ: 'JWT' },
      {
        ticket_id: ticket.id,
        event_id: ticket.event_id,
        user_id: ticket.user_id,
        exp: getNumericDate(60 * 60 * 24), // 24 hours
      },
      key
    )

    return new Response(JSON.stringify({ jwt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

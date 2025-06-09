import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { agent_id, delta } = await req.json()
    if (!agent_id || typeof delta !== 'number') {
      throw new Error('Missing agent_id or delta')
    }

    const { data: agent } = await supabaseClient
      .from('agents')
      .select('trust_score')
      .eq('id', agent_id)
      .single()

    const currentScore = agent?.trust_score ?? 0
    const newScore = Math.max(0, Math.min(100, currentScore + delta))

    const { error: updateError } = await supabaseClient
      .from('agents')
      .update({ trust_score: newScore, updated_at: new Date().toISOString() })
      .eq('id', agent_id)

    if (updateError) {
      throw updateError
    }

    // Log policy reevaluation result
    await supabaseClient
      .from('audit_logs')
      .insert({
        agent_id,
        action_type: 'policy_reeval',
        resource: 'trust_update',
        payload: { delta, new_score: newScore }
      })

    return new Response(
      JSON.stringify({ agent_id, new_score: newScore }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

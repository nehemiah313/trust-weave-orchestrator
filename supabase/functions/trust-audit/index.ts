import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_THRESHOLD = 70
const WINDOW_HOURS = 24

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    let body = {}
    try {
      body = await req.json()
    } catch {
      /* ignore body parse errors */
    }
    const threshold = typeof body["threshold"] === 'number' ? body.threshold : DEFAULT_THRESHOLD

    const since = new Date()
    since.setHours(since.getHours() - WINDOW_HOURS)

    const { data: agents, error: agentsError } = await supabaseClient
      .from('agents')
      .select('id, name, trust_score')

    if (agentsError) throw agentsError

    const flagged: { agent_id: string; agent_name: string; occurrences: number; current_score: number }[] = []

    for (const agent of agents) {
      const { data: events, error: eventsError } = await supabaseClient
        .from('trust_events')
        .select('delta, created_at')
        .eq('agent_id', agent.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })

      if (eventsError) throw eventsError

      let currentScore = agent.trust_score
      let count = 0
      for (const event of events) {
        const finalScore = currentScore
        const previousScore = finalScore - event.delta
        if (finalScore < threshold && event.delta < 0) {
          count++
        }
        currentScore = previousScore
      }

      if (count > 2) {
        flagged.push({
          agent_id: agent.id,
          agent_name: agent.name,
          occurrences: count,
          current_score: agent.trust_score
        })
      }
    }

    return new Response(
      JSON.stringify({ flagged_agents: flagged, threshold }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})

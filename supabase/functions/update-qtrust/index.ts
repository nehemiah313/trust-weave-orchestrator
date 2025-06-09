import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALPHA = 0.3; // learning rate
const DECAY_RATE = 0.99; // daily decay factor

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { agent_id, action, success } = await req.json();

    // Fetch existing Q-value for this agent-action pair
    const { data: existing } = await supabaseClient
      .from('agent_action_qvalues')
      .select('*')
      .eq('agent_id', agent_id)
      .eq('action', action)
      .maybeSingle();

    let qValue = existing?.q_value ?? 0;
    const reward = success ? 1 : -1;
    qValue = (1 - ALPHA) * qValue + ALPHA * reward;

    // Upsert the updated Q-value
    const { error: upsertError } = await supabaseClient
      .from('agent_action_qvalues')
      .upsert({
        agent_id,
        action,
        q_value: qValue,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'agent_id,action',
      });

    if (upsertError) {
      throw upsertError;
    }

    // Decay unused Q-values for this agent
    const { data: allPairs, error: allError } = await supabaseClient
      .from('agent_action_qvalues')
      .select('*')
      .eq('agent_id', agent_id);

    if (allError) {
      throw allError;
    }

    const decayUpdates: {
      agent_id: string;
      action: string;
      q_value: number;
      last_updated: string;
    }[] = [];
    const now = Date.now();

    for (const row of allPairs) {
      if (row.action === action) continue;
      const last = new Date(row.last_updated).getTime();
      const daysDiff = (now - last) / (1000 * 60 * 60 * 24);
      if (daysDiff <= 0) continue;
      const decayed = row.q_value * Math.pow(DECAY_RATE, daysDiff);
      decayUpdates.push({
        agent_id: row.agent_id,
        action: row.action,
        q_value: decayed,
        last_updated: row.last_updated,
      });
    }

    if (decayUpdates.length > 0) {
      const { error: decayError } = await supabaseClient
        .from('agent_action_qvalues')
        .upsert(decayUpdates, { onConflict: 'agent_id,action' });
      if (decayError) throw decayError;
    }

    return new Response(
      JSON.stringify({ agent_id, action, q_value: qValue }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

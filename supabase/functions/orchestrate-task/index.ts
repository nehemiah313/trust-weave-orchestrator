import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { task_id } = await req.json();

    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select('id, agent_id, protocol, status, assigned_at')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      throw new Error('Task not found');
    }

    if (task.status === 'completed') {
      return new Response(
        JSON.stringify({ task_id, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const now = Date.now();
    const assigned = task.assigned_at ? new Date(task.assigned_at).getTime() : 0;
    const latency = now - assigned;

    let shouldReassign = latency > 5000; // latency > 5s
    let reason = shouldReassign ? 'latency_exceeded' : '';

    // Check trust drop since assignment
    const { data: events } = await supabaseClient
      .from('trust_events')
      .select('delta')
      .eq('agent_id', task.agent_id)
      .gte('created_at', task.assigned_at);

    if (events) {
      const totalDelta = events.reduce((sum, e) => sum + (e.delta ?? 0), 0);
      if (totalDelta <= -15) {
        shouldReassign = true;
        reason = 'trust_drop';
      }
    }

    if (!shouldReassign) {
      return new Response(
        JSON.stringify({ task_id, status: 'no_reassignment' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Find next trusted agent
    const { data: agents, error: agentsError } = await supabaseClient
      .from('agents')
      .select('*')
      .eq('protocol', task.protocol)
      .eq('is_active', true)
      .order('trust_score', { ascending: false });

    if (agentsError || !agents || agents.length === 0) {
      throw new Error('No available agents for reassignment');
    }

    const currentIndex = agents.findIndex(a => a.id === task.agent_id);
    const nextAgent = agents.find((_, idx) => idx > currentIndex) || agents[0];

    await supabaseClient
      .from('tasks')
      .update({
        agent_id: nextAgent.id,
        assigned_at: new Date().toISOString(),
        status: 'assigned',
      })
      .eq('id', task_id);

    await supabaseClient
      .from('audit_logs')
      .insert({
        agent_id: nextAgent.id,
        task_id: task_id,
        action_type: 'delegate',
        resource: 'task_reassignment',
        payload: { from_agent: task.agent_id, to_agent: nextAgent.id, reason },
      });

    return new Response(
      JSON.stringify({ task_id, new_agent: nextAgent, status: 'reassigned', reason }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});


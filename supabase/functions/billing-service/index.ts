import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASE_FEES: Record<string, number> = {
  nlp_processing: 0.05,
  data_analysis: 0.07,
  coordination: 0.04,
  verification: 0.06,
  custom: 0.05,
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
      .select('id, agent_id, task_type, user_id')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      throw new Error('Task not found');
    }

    const { data: trustEvents } = await supabaseClient
      .from('trust_events')
      .select('delta')
      .eq('agent_id', task.agent_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const volatility = trustEvents && trustEvents.length > 0
      ? trustEvents.reduce((sum, e) => sum + Math.abs(e.delta), 0) / trustEvents.length
      : 0;

    const { data: reassignmentLogs } = await supabaseClient
      .from('audit_logs')
      .select('id')
      .eq('task_id', task_id)
      .eq('action_type', 'delegate');

    const reassignmentCount = Math.max(0, (reassignmentLogs?.length || 0) - 1);

    let amount = BASE_FEES[task.task_type as keyof typeof BASE_FEES] ?? 0.05;
    amount *= 1 + Math.min(volatility / 10, 0.5);
    amount *= 1 + reassignmentCount * 0.1;

    const { error: billingError } = await supabaseClient
      .from('billing_events')
      .insert({
        task_id,
        user_id: task.user_id,
        agent_id: task.agent_id,
        fee_type: 'per_task',
        amount,
        currency: 'USD',
        metadata: {
          volatility,
          reassignment_count: reassignmentCount,
          task_type: task.task_type,
        },
      });

    if (billingError) {
      throw billingError;
    }

    return new Response(
      JSON.stringify({
        task_id,
        amount,
        currency: 'USD',
        volatility,
        reassignment_count: reassignmentCount,
        task_type: task.task_type,
      }),
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

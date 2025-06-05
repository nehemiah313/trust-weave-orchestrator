
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

    const { protocol, input_data, task_type, user_id } = await req.json()

    // Find the best agent based on protocol, trust score, and availability
    const { data: agents, error: agentsError } = await supabaseClient
      .from('agents')
      .select('*')
      .eq('protocol', protocol)
      .eq('is_active', true)
      .order('trust_score', { ascending: false })
      .limit(3)

    if (agentsError || !agents || agents.length === 0) {
      throw new Error('No available agents found for protocol: ' + protocol)
    }

    // Select the best agent (highest trust score)
    const selectedAgent = agents[0]

    // Create the task
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .insert({
        agent_id: selectedAgent.id,
        user_id,
        task_type,
        input_data,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .select()
      .single()

    if (taskError) {
      throw taskError
    }

    // Log the assignment in audit logs
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id,
        agent_id: selectedAgent.id,
        task_id: task.id,
        action_type: 'delegate',
        resource: 'task_assignment',
        payload: { protocol, task_type, agent_name: selectedAgent.name }
      })

    return new Response(
      JSON.stringify({ 
        task_id: task.id, 
        agent: selectedAgent,
        status: 'assigned'
      }),
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


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

    const { agent_id } = await req.json()

    // Get recent tasks for this agent (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('status, assigned_at, completed_at, trust_score_delta')
      .eq('agent_id', agent_id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (tasksError) {
      throw tasksError
    }

    // Calculate metrics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const failedTasks = tasks.filter(t => t.status === 'failed').length
    const avgCompletionTime = tasks
      .filter(t => t.completed_at && t.assigned_at)
      .reduce((acc, t) => {
        const duration = new Date(t.completed_at).getTime() - new Date(t.assigned_at).getTime()
        return acc + duration
      }, 0) / completedTasks || 0

    // Calculate trust score components
    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 50
    const reliabilityScore = totalTasks > 0 ? Math.max(0, 100 - (failedTasks / totalTasks) * 100) : 50
    const speedScore = avgCompletionTime > 0 ? Math.max(0, 100 - (avgCompletionTime / (1000 * 60 * 5))) : 50 // Penalize if > 5 minutes

    // Weighted average
    const newTrustScore = Math.min(100, Math.max(0, 
      successRate * 0.5 + reliabilityScore * 0.3 + speedScore * 0.2
    ))

    // Update agent's trust score
    const { error: updateError } = await supabaseClient
      .from('agents')
      .update({ 
        trust_score: newTrustScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', agent_id)

    if (updateError) {
      throw updateError
    }

    // Create trust event
    const { data: currentAgent } = await supabaseClient
      .from('agents')
      .select('trust_score')
      .eq('id', agent_id)
      .single()

    const delta = newTrustScore - (currentAgent?.trust_score || 50)

    await supabaseClient
      .from('trust_events')
      .insert({
        agent_id,
        event_type: 'performance',
        delta,
        reason: `Recalculated based on ${totalTasks} recent tasks`,
        metadata: { 
          success_rate: successRate,
          reliability_score: reliabilityScore,
          speed_score: speedScore,
          avg_completion_time: avgCompletionTime
        }
      })

    return new Response(
      JSON.stringify({ 
        trust_score: newTrustScore,
        metrics: {
          total_tasks: totalTasks,
          success_rate: successRate,
          reliability_score: reliabilityScore,
          speed_score: speedScore
        }
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

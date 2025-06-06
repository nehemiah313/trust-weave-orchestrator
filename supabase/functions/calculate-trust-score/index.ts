
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
      .select('status, assigned_at, completed_at, trust_score_delta, created_at')
      .eq('agent_id', agent_id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (tasksError) {
      throw tasksError
    }

    // Get recent trust events for drift detection
    const { data: trustEvents, error: trustEventsError } = await supabaseClient
      .from('trust_events')
      .select('*')
      .eq('agent_id', agent_id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (trustEventsError) {
      throw trustEventsError
    }

    // Calculate advanced trust metrics
    const trustMetrics = calculateAdvancedTrustMetrics(tasks, trustEvents)
    
    // Apply trust triggers
    const trustAdjustments = applyTrustTriggers(tasks, agent_id)
    
    // Calculate final trust score
    const newTrustScore = calculateFinalTrustScore(trustMetrics, trustAdjustments)

    // Get current agent trust score
    const { data: currentAgent } = await supabaseClient
      .from('agents')
      .select('trust_score')
      .eq('id', agent_id)
      .single()

    const previousScore = currentAgent?.trust_score || 50
    const finalScore = Math.min(100, Math.max(0, newTrustScore))
    const delta = finalScore - previousScore

    // Update agent's trust score
    const { error: updateError } = await supabaseClient
      .from('agents')
      .update({ 
        trust_score: finalScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', agent_id)

    if (updateError) {
      throw updateError
    }

    // Create trust event with detailed reasoning
    const eventType = delta > 0 ? 'performance' : delta < 0 ? 'error' : 'performance'
    const reason = generateTrustEventReason(trustMetrics, trustAdjustments, delta)

    await supabaseClient
      .from('trust_events')
      .insert({
        agent_id,
        event_type: eventType,
        delta,
        reason,
        metadata: { 
          ...trustMetrics,
          adjustments: trustAdjustments,
          calculation_timestamp: new Date().toISOString()
        }
      })

    console.log(`Trust score updated for agent ${agent_id}: ${previousScore} -> ${finalScore} (Δ${delta.toFixed(2)})`)

    return new Response(
      JSON.stringify({ 
        trust_score: finalScore,
        delta,
        metrics: trustMetrics,
        adjustments: trustAdjustments,
        reason
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Trust calculation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function calculateAdvancedTrustMetrics(tasks: any[], trustEvents: any[]) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const failedTasks = tasks.filter(t => t.status === 'failed')
  
  // 1. Latency Analysis
  const completionTimes = completedTasks
    .filter(t => t.completed_at && t.assigned_at)
    .map(t => {
      const assigned = new Date(t.assigned_at).getTime()
      const completed = new Date(t.completed_at).getTime()
      return completed - assigned
    })

  const avgLatency = completionTimes.length > 0 
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
    : 0

  // Define SLA threshold (5 minutes = 300,000ms)
  const SLA_THRESHOLD = 5 * 60 * 1000
  const withinSLA = completionTimes.filter(time => time <= SLA_THRESHOLD).length
  const delayedTasks = completionTimes.filter(time => time > SLA_THRESHOLD).length

  // 2. Task Completion Rate
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 50
  const failureRate = totalTasks > 0 ? (failedTasks.length / totalTasks) * 100 : 0

  // 3. Agent Drift Detection (consistency in performance)
  const recentPerformance = tasks.slice(0, 10) // Last 10 tasks
  const olderPerformance = tasks.slice(10, 20) // Previous 10 tasks
  
  const recentSuccessRate = recentPerformance.length > 0 
    ? (recentPerformance.filter(t => t.status === 'completed').length / recentPerformance.length) * 100 
    : 50
  const olderSuccessRate = olderPerformance.length > 0 
    ? (olderPerformance.filter(t => t.status === 'completed').length / olderPerformance.length) * 100 
    : 50

  const performanceDrift = Math.abs(recentSuccessRate - olderSuccessRate)

  // 4. Impersonation Anomaly Detection (unusual pattern detection)
  const trustEventFrequency = trustEvents.length
  const rapidTrustChanges = trustEvents.filter(event => 
    Math.abs(event.delta) > 10 // Large trust changes
  ).length

  const anomalyScore = (rapidTrustChanges / Math.max(trustEventFrequency, 1)) * 100

  return {
    total_tasks: totalTasks,
    completion_rate: completionRate,
    failure_rate: failureRate,
    avg_latency_ms: avgLatency,
    within_sla_count: withinSLA,
    delayed_tasks_count: delayedTasks,
    performance_drift: performanceDrift,
    anomaly_score: anomalyScore,
    recent_success_rate: recentSuccessRate,
    sla_compliance: completedTasks.length > 0
      ? (withinSLA / completedTasks.length) * 100
      : undefined
  }
}

function applyTrustTriggers(tasks: any[], agentId: string) {
  const fiveMinutesAgo = new Date()
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

  // Get tasks from last 5 minutes
  const recentTasks = tasks.filter(task => 
    new Date(task.created_at) >= fiveMinutesAgo
  )

  const adjustments = {
    delayed_penalty: 0,
    sla_bonus: 0,
    trigger_applied: []
  }

  // Trigger 1: Trust ↓ if 3+ delayed tasks in 5 min
  const recentDelayedTasks = recentTasks.filter(task => {
    if (!task.completed_at || !task.assigned_at) return false
    const latency = new Date(task.completed_at).getTime() - new Date(task.assigned_at).getTime()
    return latency > (5 * 60 * 1000) // More than 5 minutes
  })

  if (recentDelayedTasks.length >= 3) {
    adjustments.delayed_penalty = -15 // Significant penalty
    adjustments.trigger_applied.push('delayed_tasks_penalty')
    console.log(`Applied delayed tasks penalty for agent ${agentId}: ${recentDelayedTasks.length} delayed tasks`)
  }

  // Trigger 2: Trust ↑ if 5 verified completions within SLA
  const recentCompletedWithinSLA = recentTasks.filter(task => {
    if (task.status !== 'completed' || !task.completed_at || !task.assigned_at) return false
    const latency = new Date(task.completed_at).getTime() - new Date(task.assigned_at).getTime()
    return latency <= (5 * 60 * 1000) // Within 5 minutes SLA
  })

  if (recentCompletedWithinSLA.length >= 5) {
    adjustments.sla_bonus = 10 // Reward for excellent performance
    adjustments.trigger_applied.push('sla_compliance_bonus')
    console.log(`Applied SLA compliance bonus for agent ${agentId}: ${recentCompletedWithinSLA.length} tasks within SLA`)
  }

  return adjustments
}

function calculateFinalTrustScore(metrics: any, adjustments: any) {
  // Base score calculation with weighted factors
  const latencyScore = Math.max(0, 100 - (metrics.avg_latency_ms / (5 * 60 * 1000)) * 50) // Penalize latency
  const completionScore = metrics.completion_rate
  const consistencyScore = Math.max(0, 100 - metrics.performance_drift * 2) // Penalize drift
  const anomalyScore = Math.max(0, 100 - metrics.anomaly_score) // Penalize anomalies
  const slaScore = metrics.sla_compliance ?? 100

  // Weighted average of all factors
  const baseScore = (
    latencyScore * 0.25 +      // Latency weight: 25%
    completionScore * 0.30 +   // Completion rate weight: 30%
    consistencyScore * 0.20 +  // Consistency weight: 20%
    anomalyScore * 0.15 +      // Anomaly detection weight: 15%
    slaScore * 0.10            // SLA compliance weight: 10%
  )

  // Apply trigger adjustments
  const adjustedScore = baseScore + adjustments.delayed_penalty + adjustments.sla_bonus

  const finalScore = Math.min(100, Math.max(0, adjustedScore))
  console.log('[TRUST] Recalculated score:', finalScore)
  return finalScore
}

function generateTrustEventReason(metrics: any, adjustments: any, delta: number) {
  const reasons = []
  
  if (adjustments.trigger_applied.includes('delayed_tasks_penalty')) {
    reasons.push(`Applied penalty for ${metrics.delayed_tasks_count} delayed tasks`)
  }
  
  if (adjustments.trigger_applied.includes('sla_compliance_bonus')) {
    reasons.push(`Rewarded for ${metrics.within_sla_count} tasks completed within SLA`)
  }
  
  if (metrics.performance_drift > 20) {
    reasons.push(`Detected performance drift: ${metrics.performance_drift.toFixed(1)}%`)
  }
  
  if (metrics.anomaly_score > 30) {
    reasons.push(`Anomaly detected: score ${metrics.anomaly_score.toFixed(1)}`)
  }
  
  if (reasons.length === 0) {
    reasons.push(`Routine recalculation based on ${metrics.total_tasks} recent tasks`)
  }
  
  return reasons.join('; ')
}

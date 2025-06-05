
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pricing configuration
const PRICING = {
  per_task: { nlweb: 0.05, mcp: 0.08, a2a: 0.12 },
  compliance: 0.02,
  routing: 0.01,
  verification: 0.03,
  premium: 0.15
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

    const { task_id, fee_types = ['per_task'] } = await req.json()

    // Get task and agent details
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select(`
        *,
        agents (protocol, trust_score),
        users (role)
      `)
      .eq('id', task_id)
      .single()

    if (taskError || !task) {
      throw new Error('Task not found')
    }

    const totalCharges = []

    for (const feeType of fee_types) {
      let amount = 0

      switch (feeType) {
        case 'per_task':
          amount = PRICING.per_task[task.agents.protocol] || 0.05
          break
        case 'compliance':
          amount = PRICING.compliance
          break
        case 'routing':
          amount = PRICING.routing
          break
        case 'verification':
          amount = PRICING.verification
          break
        case 'premium':
          amount = task.users.role === 'enterprise' ? PRICING.premium : 0
          break
      }

      // Apply trust score discount (higher trust = lower fees)
      if (task.agents.trust_score > 90) {
        amount *= 0.9 // 10% discount
      } else if (task.agents.trust_score > 80) {
        amount *= 0.95 // 5% discount
      }

      // Record billing event
      const { error: billingError } = await supabaseClient
        .from('billing_events')
        .insert({
          task_id,
          user_id: task.user_id,
          agent_id: task.agent_id,
          fee_type: feeType,
          amount,
          currency: 'USD',
          metadata: {
            protocol: task.agents.protocol,
            trust_score: task.agents.trust_score,
            task_type: task.task_type
          }
        })

      if (billingError) {
        throw billingError
      }

      totalCharges.push({ fee_type: feeType, amount })
    }

    const totalAmount = totalCharges.reduce((sum, charge) => sum + charge.amount, 0)

    return new Response(
      JSON.stringify({ 
        task_id,
        charges: totalCharges,
        total_amount: totalAmount,
        currency: 'USD'
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

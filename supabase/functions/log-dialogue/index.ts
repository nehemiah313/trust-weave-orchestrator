
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

    const { task_id, source_agent_id, target_agent_id, message } = await req.json()

    // Insert dialogue record
    const { data: dialogue, error: dialogueError } = await supabaseClient
      .from('agent_dialogues')
      .insert({
        task_id,
        source_agent_id,
        target_agent_id,
        message,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (dialogueError) {
      throw dialogueError
    }

    // Log in audit trail
    await supabaseClient
      .from('audit_logs')
      .insert({
        agent_id: source_agent_id,
        task_id,
        action_type: 'execute',
        resource: 'agent_dialogue',
        payload: { 
          target_agent_id, 
          message_type: message.type || 'communication',
          message_size: JSON.stringify(message).length
        }
      })

    return new Response(
      JSON.stringify({ 
        dialogue_id: dialogue.id,
        status: 'logged'
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

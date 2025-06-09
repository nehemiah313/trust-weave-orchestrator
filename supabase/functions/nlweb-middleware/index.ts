import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MCP_BASE_URL = Deno.env.get('MCP_BASE_URL') ?? ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { agent_id, payload, signature } = await req.json()

    if (!agent_id || !payload || !signature) {
      throw new Error('Missing required fields')
    }

    const { data: agent, error: agentError } = await supabaseClient
      .from('agents')
      .select('metadata')
      .eq('id', agent_id)
      .single()

    if (agentError || !agent) {
      throw new Error('Agent not found')
    }

    const publicKeyPem = agent.metadata?.public_key
    if (!publicKeyPem) {
      throw new Error('Agent public key not available')
    }

    const valid = await verifySignature(JSON.stringify(payload), signature, publicKeyPem)
    if (!valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 },
      )
    }

    const namespace = payload.namespace ?? 'default'

    const mcpRes = await fetch(`${MCP_BASE_URL}/${namespace}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id, payload }),
    })

    if (!mcpRes.ok) {
      const text = await mcpRes.text()
      throw new Error(`MCP error: ${text}`)
    }

    const result = await mcpRes.json()

    return new Response(
      JSON.stringify({ status: 'routed', result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})

function decodeBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function pemToArrayBuffer(pem: string): Uint8Array {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '')
  return decodeBase64(b64)
}

async function verifySignature(data: string, signatureB64: string, publicKeyPem: string) {
  const keyData = pemToArrayBuffer(publicKeyPem)
  const key = await crypto.subtle.importKey(
    'spki',
    keyData,
    { name: 'RSA-PSS', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const signature = decodeBase64(signatureB64)
  const encoder = new TextEncoder()
  return crypto.subtle.verify(
    { name: 'RSA-PSS', saltLength: 32 },
    key,
    signature,
    encoder.encode(data),
  )
}

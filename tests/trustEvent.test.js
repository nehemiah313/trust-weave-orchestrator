import test from 'node:test';
import assert from 'node:assert/strict';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cunjmhluheowropvlksg.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bmptaGx1aGVvd3JvcHZsa3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwOTIwNzgsImV4cCI6MjA2NDY2ODA3OH0.5TkMnR0hKekhCP0hbHGQv2sisFO5WY3Sppbl8ecOL9E';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function submitTask() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/assign-agent-task`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      protocol: 'nlweb',
      task_type: 'nlp_processing',
      input_data: { description: 'test task' },
      user_id: 'test-user'
    })
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

async function calculateTrustScore(agentId) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/calculate-trust-score`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ agent_id: agentId })
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

async function fetchLatestTrustEvent(agentId) {
  const restUrl = `${SUPABASE_URL}/rest/v1/trust_events?agent_id=eq.${agentId}&order=created_at.desc&limit=1`;
  const response = await fetch(restUrl, { headers: HEADERS });
  const data = await response.json();
  return { ok: response.ok, event: data[0] };
}

test('trust event includes patent claim IDs for each rule fired', async () => {
  const taskRes = await submitTask();
  assert.ok(taskRes.ok, `Task creation failed: ${JSON.stringify(taskRes.data)}`);
  assert.ok(taskRes.data.task_id, 'No task ID returned');

  const agentId = taskRes.data.agent.id;
  const trustRes = await calculateTrustScore(agentId);
  assert.ok(trustRes.ok, `Trust score calc failed: ${JSON.stringify(trustRes.data)}`);

  const eventRes = await fetchLatestTrustEvent(agentId);
  assert.ok(eventRes.ok, 'Fetching trust event failed');
  assert.ok(eventRes.event, 'No trust event returned');

  const firedRules = eventRes.event.metadata?.fired_rules || [];
  for (const rule of firedRules) {
    assert.ok(rule.patent_claim_id, 'Missing patent_claim_id on rule');
  }
});

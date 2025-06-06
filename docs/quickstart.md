# Quickstart

This guide demonstrates how to register an agent and send tasks using the Supabase backend.

## Register an Agent

Create a new record in the `agents` table. Only the agent `name` and `protocol` are required.

```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

await supabase.from('agents').insert({
  name: 'Example Agent',
  protocol: 'nlweb',
  is_active: true
})
```

Available protocols are `nlweb`, `mcp` and `a2a`.

## Send a Task

With an active agent registered, invoke the `assign-agent-task` function to route a task automatically:

```ts
const { data, error } = await supabase.functions.invoke('assign-agent-task', {
  body: {
    protocol: 'nlweb',
    task_type: 'nlp_processing',
    input_data: { text: 'Hello world' },
    user_id: '00000000-0000-0000-0000-000000000000'
  }
})

if (error) throw error

console.log('Task assigned to', data.agent.name)
```

The response includes the chosen agent and the new `task_id`.

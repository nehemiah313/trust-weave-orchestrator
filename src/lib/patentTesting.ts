export interface Task {
  created_at: string;
  assigned_at?: string | null;
  completed_at?: string | null;
  status: string;
}

export interface BillingContext {
  protocol: 'nlweb' | 'mcp' | 'a2a';
  trust_score: number;
  user_role: string;
  task_type: string;
}

export function applyTrustTriggers(tasks: Task[], agentId: string) {
  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  const recentTasks = tasks.filter(t => new Date(t.created_at) >= fiveMinutesAgo);

  const adjustments = {
    delayed_penalty: 0,
    sla_bonus: 0,
    trigger_applied: [] as string[],
  };

  const recentDelayed = recentTasks.filter(t => {
    if (!t.completed_at || !t.assigned_at) return false;
    const latency = new Date(t.completed_at).getTime() - new Date(t.assigned_at).getTime();
    return latency > 5 * 60 * 1000;
  });

  if (recentDelayed.length >= 3) {
    adjustments.delayed_penalty = -15;
    adjustments.trigger_applied.push('delayed_tasks_penalty');
  }

  const recentSla = recentTasks.filter(t => {
    if (t.status !== 'completed' || !t.completed_at || !t.assigned_at) return false;
    const latency = new Date(t.completed_at).getTime() - new Date(t.assigned_at).getTime();
    return latency <= 5 * 60 * 1000;
  });

  if (recentSla.length >= 5) {
    adjustments.sla_bonus = 10;
    adjustments.trigger_applied.push('sla_compliance_bonus');
  }

  return adjustments;
}

export function shouldReassignAgent(trustScore: number, threshold = 70) {
  return trustScore < threshold;
}

const PRICING = {
  per_task: { nlweb: 0.05, mcp: 0.08, a2a: 0.12 },
  compliance: 0.02,
  routing: 0.01,
  verification: 0.03,
  premium: 0.15,
};

export function calculateBillingCharges(context: BillingContext, feeTypes: string[]) {
  const charges: { fee_type: string; amount: number }[] = [];

  for (const fee of feeTypes) {
    let amount = 0;
    switch (fee) {
      case 'per_task':
        amount = PRICING.per_task[context.protocol] || 0.05;
        break;
      case 'compliance':
        amount = PRICING.compliance;
        break;
      case 'routing':
        amount = PRICING.routing;
        break;
      case 'verification':
        amount = PRICING.verification;
        break;
      case 'premium':
        amount = context.user_role === 'enterprise' ? PRICING.premium : 0;
        break;
    }
    if (context.trust_score > 90) amount *= 0.9;
    else if (context.trust_score > 80) amount *= 0.95;
    charges.push({ fee_type: fee, amount });
  }

  const total = charges.reduce((sum, c) => sum + c.amount, 0);
  return { charges, total };
}

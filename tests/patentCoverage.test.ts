import { describe, it, expect } from 'vitest';
import { applyTrustTriggers, shouldReassignAgent, calculateBillingCharges, Task, BillingContext } from '../src/lib/patentTesting';

describe('patent claim coverage', () => {
  it('triggers agent reassignment when trust drops below 70', () => {
    const trustScore = 65;
    expect(shouldReassignAgent(trustScore)).toBe(true);
  });

  it('applies delayed_tasks_penalty when 3 tasks exceed SLA', () => {
    const now = Date.now();
    const tasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
      created_at: new Date(now - i * 60000).toISOString(),
      assigned_at: new Date(now - (i + 6) * 60000).toISOString(),
      completed_at: new Date(now - i * 60000).toISOString(),
      status: 'completed',
    }));
    const adjustments = applyTrustTriggers(tasks, 'agent1');
    expect(adjustments.delayed_penalty).toBe(-15);
    expect(adjustments.trigger_applied).toContain('delayed_tasks_penalty');
  });

  it('calculates billing with trust discount', () => {
    const context: BillingContext = {
      protocol: 'mcp',
      trust_score: 92,
      user_role: 'enterprise',
      task_type: 'verification',
    };
    const result = calculateBillingCharges(context, ['per_task', 'premium']);
    const perTask = 0.08 * 0.9; // 10% discount
    const premium = 0.15 * 0.9;
    expect(result.charges[0].amount).toBeCloseTo(perTask, 5);
    expect(result.charges[1].amount).toBeCloseTo(premium, 5);
    expect(result.total).toBeCloseTo(perTask + premium, 5);
  });
});

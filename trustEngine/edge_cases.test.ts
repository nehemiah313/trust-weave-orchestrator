import { describe, it, expect } from '@jest/globals'
import { calculateFinalTrustScore } from '../supabase/functions/calculate-trust-score/score'

/**
 * Helper to build metrics for tests
 */
function buildMetrics({ successes = 0, failures = 0, latency = 0, drift = 0, anomaly = 0, sla = 100 }) {
  return {
    avg_latency_ms: latency,
    completion_rate: successes + failures > 0 ? (successes / (successes + failures)) * 100 : 0,
    performance_drift: drift,
    anomaly_score: anomaly,
    sla_compliance: sla,
  }
}

describe('calculateFinalTrustScore edge matrix', () => {
  // TC-001 Base case with normal trust events
  it('TC-001: healthy baseline', () => {
    const metrics = buildMetrics({ successes: 5, failures: 0, latency: 50, sla: 100 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    expect(score).toBeCloseTo(100, 1)
  })

  // TC-002 50% failure rate
  it('TC-002: penalize unreliability', () => {
    const metrics = buildMetrics({ successes: 5, failures: 5, latency: 120, sla: 100 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    expect(score).toBeLessThan(90)
  })

  // TC-003 High latency, no failures
  it('TC-003: degrade due to performance', () => {
    const metrics = buildMetrics({ successes: 10, failures: 0, latency: 800, sla: 50 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: -20, sla_bonus: 0 })
    expect(score).toBeGreaterThan(70)
    expect(score).toBeLessThan(80)
  })

  // TC-004 Zero events
  it('TC-004: handle zero events', () => {
    const metrics = buildMetrics({ successes: 0, failures: 0, latency: 0, sla: 0 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  // TC-005 Only failure events
  it('TC-005: complete failure case', () => {
    const metrics = buildMetrics({ successes: 0, failures: 10, latency: 200, sla: 0 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: -60, sla_bonus: 0 })
    expect(score).toBe(0)
  })

  // TC-006 Negative latency input
  it('TC-006: negative latency sanitized', () => {
    const metrics = buildMetrics({ successes: 3, failures: 1, latency: -50 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  // TC-007 Outlier latency spike
  it('TC-007: outlier latency spike', () => {
    const metrics = buildMetrics({ successes: 4, failures: 1, latency: 10000, sla: 50 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: -30, sla_bonus: 0 })
    expect(score).toBeLessThan(70)
  })

  // TC-008 Recovery over time
  it('TC-008: recovery over time', () => {
    const metrics = buildMetrics({ successes: 10, failures: 5, latency: 300, drift: 10 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 5 })
    expect(score).toBeGreaterThan(60)
  })

  // TC-009 Mixed protocol agents
  it('TC-009: mixed protocol normalization', () => {
    const metrics = buildMetrics({ successes: 8, failures: 2, latency: 200, anomaly: 10 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    expect(score).toBeGreaterThan(80)
  })

  // TC-010 Rapid task retry
  it('TC-010: rapid task retry penalty', () => {
    const metrics = buildMetrics({ successes: 4, failures: 0, latency: 100, anomaly: 30 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: -10, sla_bonus: 0 })
    expect(score).toBeLessThan(90)
  })

  // TC-011 Drift edge detection
  it('TC-011: behavioral drift detection', () => {
    const metrics = buildMetrics({ successes: 6, failures: 0, latency: 300, drift: 25 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    expect(score).toBeLessThan(90)
    expect(score).toBeGreaterThan(70)
  })

  // TC-012 Trust override flag
  it('TC-012: respect trust override', () => {
    const metrics = buildMetrics({ successes: 5, failures: 0, latency: 100 })
    const score = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 50 })
    expect(score).toBeGreaterThan(100 - 1)
  })
})

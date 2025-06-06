import { describe, it, expect, vi } from 'vitest'
import { calculateFinalTrustScore } from '../calculate-trust-score/score'

describe('calculateFinalTrustScore edge cases', () => {
  it('applies delayed penalty for negative trust events', () => {
    const metrics = {
      avg_latency_ms: 8 * 60 * 1000,
      completion_rate: 60,
      performance_drift: 10,
      anomaly_score: 5,
      sla_compliance: 70,
    }
    const adjustments = { delayed_penalty: -15, sla_bonus: 0 }
    const score = calculateFinalTrustScore(metrics, adjustments)
    expect(score).toBeCloseTo(45.25, 2)
  })

  it('handles outlier latency', () => {
    const metrics = {
      avg_latency_ms: 20 * 60 * 1000,
      completion_rate: 90,
      performance_drift: 2,
      anomaly_score: 0,
      sla_compliance: 50,
    }
    const adjustments = { delayed_penalty: 0, sla_bonus: 0 }
    const score = calculateFinalTrustScore(metrics, adjustments)
    expect(score).toBeCloseTo(66.2, 2)
  })

  it('handles agents with no events', () => {
    const metrics = {
      avg_latency_ms: 0,
      completion_rate: 0,
      performance_drift: 0,
      anomaly_score: 0,
      sla_compliance: 0,
    }
    const adjustments = { delayed_penalty: 0, sla_bonus: 0 }
    const score = calculateFinalTrustScore(metrics, adjustments)
    expect(score).toBeCloseTo(60, 2)
  })

  it('penalizes heavy drift and anomaly', () => {
    const metrics = {
      avg_latency_ms: 2000,
      completion_rate: 100,
      performance_drift: 50,
      anomaly_score: 50,
      sla_compliance: 100,
    }
    const adjustments = { delayed_penalty: -5, sla_bonus: 0 }
    const score = calculateFinalTrustScore(metrics, adjustments)
    expect(score).toBeCloseTo(67.42, 2)
  })

  it('rewards recovery from low trust via adjustments', () => {
    const metrics = {
      avg_latency_ms: 2 * 60 * 1000,
      completion_rate: 40,
      performance_drift: 80,
      anomaly_score: 20,
      sla_compliance: 20,
    }
    const adjustments = { delayed_penalty: 0, sla_bonus: 10 }
    const score = calculateFinalTrustScore(metrics, adjustments)
    expect(score).toBeCloseTo(56, 2)
  })

  it('logs recalculated score and handles trust event anomalies', () => {
    const trustEvents = [
      { delta: -12 },
      { delta: 5 },
      { delta: 15 },
      { delta: -1 },
    ]

    const anomalyScore =
      (trustEvents.filter(e => Math.abs(e.delta) > 10).length /
        Math.max(trustEvents.length, 1)) *
      100

    const metrics = {
      avg_latency_ms: 2 * 60 * 1000,
      completion_rate: 80,
      performance_drift: 5,
      anomaly_score: anomalyScore,
      sla_compliance: 90,
    }
    const adjustments = { delayed_penalty: 0, sla_bonus: 0 }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const score = calculateFinalTrustScore(metrics, adjustments)

    expect(score).toBeCloseTo(78.5, 1)
    expect(logSpy).toHaveBeenCalledWith(
      '[TRUST] Recalculated score:',
      expect.any(Number),
    )
    expect(logSpy.mock.calls[0][1]).toBeCloseTo(78.5, 1)

    logSpy.mockRestore()
  })
})

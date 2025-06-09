import { describe, it, expect } from 'vitest'
import { calculateFinalTrustScore } from '../calculate-trust-score/index'

describe('calculateFinalTrustScore', () => {
  it('computes basic score with typical metrics', () => {
    const metrics = {
      avg_latency_ms: 120000, // 2 minutes
      completion_rate: 80,
      performance_drift: 5,
      anomaly_score: 2,
      sla_compliance: 95,
    }
    const adjustments = { delayed_penalty: 0, sla_bonus: 0 }

    const result = calculateFinalTrustScore(metrics, adjustments)

    const latencyScore = Math.max(0, 100 - (metrics.avg_latency_ms / (5 * 60 * 1000)) * 50)
    const completionScore = metrics.completion_rate
    const consistencyScore = Math.max(0, 100 - metrics.performance_drift * 2)
    const anomalyScore = Math.max(0, 100 - metrics.anomaly_score)
    const slaScore = metrics.sla_compliance

    const expected = (
      latencyScore * 0.25 +
      completionScore * 0.30 +
      consistencyScore * 0.20 +
      anomalyScore * 0.15 +
      slaScore * 0.10
    )

    expect(result).toBeCloseTo(expected, 5)
  })

  it('applies adjustments to alter the final score', () => {
    const metrics = {
      avg_latency_ms: 120000,
      completion_rate: 80,
      performance_drift: 5,
      anomaly_score: 2,
      sla_compliance: 95,
    }
    const adjustments = { delayed_penalty: -10, sla_bonus: 5 }

    const baseResult = calculateFinalTrustScore(metrics, { delayed_penalty: 0, sla_bonus: 0 })
    const adjustedResult = calculateFinalTrustScore(metrics, adjustments)

    expect(adjustedResult).toBeCloseTo(baseResult - 5, 5)
  })

  it('handles edge cases with zero metrics', () => {
    const metrics = {
      avg_latency_ms: 0,
      completion_rate: 0,
      performance_drift: 0,
      anomaly_score: 0,
      sla_compliance: 0,
    }
    const adjustments = { delayed_penalty: 0, sla_bonus: 0 }

    const result = calculateFinalTrustScore(metrics, adjustments)

    const latencyScore = 100
    const completionScore = 0
    const consistencyScore = 100
    const anomalyScore = 100
    const slaScore = 0

    const expected = (
      latencyScore * 0.25 +
      completionScore * 0.30 +
      consistencyScore * 0.20 +
      anomalyScore * 0.15 +
      slaScore * 0.10
    )

    expect(result).toBeCloseTo(expected, 5)
  })
})

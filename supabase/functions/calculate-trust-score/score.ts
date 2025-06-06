export function calculateFinalTrustScore(metrics: any, adjustments: any) {
  const latencyScore = Math.max(0, 100 - (metrics.avg_latency_ms / (5 * 60 * 1000)) * 50)
  const completionScore = metrics.completion_rate
  const consistencyScore = Math.max(0, 100 - metrics.performance_drift * 2)
  const anomalyScore = Math.max(0, 100 - metrics.anomaly_score)
  const slaScore = metrics.sla_compliance ?? 100

  const baseScore = (
    latencyScore * 0.25 +
    completionScore * 0.30 +
    consistencyScore * 0.20 +
    anomalyScore * 0.15 +
    slaScore * 0.10
  )

  const adjustedScore = baseScore + adjustments.delayed_penalty + adjustments.sla_bonus

  const finalScore = Math.min(100, Math.max(0, adjustedScore))
  console.log('[TRUST] Recalculated score:', finalScore)
  return finalScore
}

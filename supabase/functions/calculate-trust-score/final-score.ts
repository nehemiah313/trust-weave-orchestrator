
export function calculateFinalTrustScore(metrics: any, adjustments: any) {
  // Base score calculation with weighted factors
  const latencyScore = Math.max(0, 100 - (metrics.avg_latency_ms / (5 * 60 * 1000)) * 50) // Penalize latency
  const completionScore = metrics.completion_rate
  const consistencyScore = Math.max(0, 100 - metrics.performance_drift * 2) // Penalize drift
  const anomalyScore = Math.max(0, 100 - metrics.anomaly_score) // Penalize anomalies
  const slaScore = metrics.sla_compliance

  // Weighted average of all factors
  const baseScore = (
    latencyScore * 0.25 +      // Latency weight: 25%
    completionScore * 0.30 +   // Completion rate weight: 30%
    consistencyScore * 0.20 +  // Consistency weight: 20%
    anomalyScore * 0.15 +      // Anomaly detection weight: 15%
    slaScore * 0.10            // SLA compliance weight: 10%
  )

  // Apply trigger adjustments
  const adjustedScore = baseScore + adjustments.delayed_penalty + adjustments.sla_bonus

  return Math.min(100, Math.max(0, adjustedScore))
}


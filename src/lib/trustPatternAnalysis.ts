export interface TrustDataPoint {
  timestamp: string | Date
  value: number
}

export interface DecompositionResult {
  windowStart: string | Date
  windowEnd: string | Date
  trend: number[]
  seasonal: number[]
  residual: number[]
}

/**
 * Perform sliding window seasonal decomposition on agent trust history.
 * Uses a naive additive decomposition with moving averages.
 */
export function slidingWindowDecompose(
  history: TrustDataPoint[],
  freq: number,
  windowSize: number
): DecompositionResult[] {
  if (windowSize <= 0 || freq <= 0) return []
  if (history.length < windowSize) return []

  const sorted = history
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const results: DecompositionResult[] = []

  for (let start = 0; start <= sorted.length - windowSize; start++) {
    const window = sorted.slice(start, start + windowSize)
    const values = window.map(p => p.value)

    // Trend via simple moving average
    const trend: number[] = []
    for (let i = 0; i < values.length; i++) {
      const begin = Math.max(0, i - freq + 1)
      const slice = values.slice(begin, i + 1)
      trend.push(slice.reduce((a, b) => a + b, 0) / slice.length)
    }

    // Seasonal component per cycle
    const seasonal = new Array(values.length).fill(0)
    for (let i = 0; i < freq; i++) {
      const diffs: number[] = []
      for (let j = i; j < values.length; j += freq) {
        diffs.push(values[j] - trend[j])
      }
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
      for (let j = i; j < values.length; j += freq) {
        seasonal[j] = avg
      }
    }

    const residual = values.map((v, idx) => v - trend[idx] - seasonal[idx])

    results.push({
      windowStart: window[0].timestamp,
      windowEnd: window[window.length - 1].timestamp,
      trend,
      seasonal,
      residual,
    })
  }

  return results
}

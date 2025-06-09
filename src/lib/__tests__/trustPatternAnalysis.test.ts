import { describe, it, expect } from 'vitest'
import { slidingWindowDecompose, TrustDataPoint } from '../trustPatternAnalysis'

describe('slidingWindowDecompose', () => {
  const baseData: TrustDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
    timestamp: new Date(2024, 0, i + 1).toISOString(),
    value: 10 + (i % 4),
  }))

  it('returns decomposition results for each window', () => {
    const results = slidingWindowDecompose(baseData, 4, 6)
    expect(results.length).toBe(baseData.length - 6 + 1)
    for (const res of results) {
      expect(res.trend.length).toBe(6)
      expect(res.seasonal.length).toBe(6)
      expect(res.residual.length).toBe(6)
    }
  })

  it('returns empty array when history shorter than window', () => {
    const results = slidingWindowDecompose(baseData.slice(0, 4), 4, 6)
    expect(results.length).toBe(0)
  })
})

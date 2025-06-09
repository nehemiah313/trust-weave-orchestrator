export interface TrustEvent {
  delta: number;
  created_at: string;
}

export function rollingMetrics(currentTrust: number, events: TrustEvent[]) {
  if (events.length === 0) {
    return { movingAverage: currentTrust, volatility: 0 };
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const totalDelta = sorted.reduce((sum, e) => sum + e.delta, 0);
  const base = currentTrust - totalDelta;

  let score = base;
  const scores: number[] = [];
  for (const e of sorted) {
    score += e.delta;
    scores.push(score);
  }

  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  const variance = scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length;

  return { movingAverage: avg, volatility: Math.sqrt(variance) };
}

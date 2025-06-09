export interface Policy {
  threshold: number
}

interface QTable {
  [state: string]: number[]
}

const actions = ['decrease', 'maintain', 'increase']

function getState(volatility: number): string {
  if (volatility < 5) return 'low'
  if (volatility < 15) return 'medium'
  return 'high'
}

export function runPolicyMutation(timeSeries: number[], policy: Policy, episodes = 50) {
  const q: QTable = { low: [0,0,0], medium: [0,0,0], high: [0,0,0] }
  const alpha = 0.1
  const gamma = 0.9

  for (let i = 1; i < timeSeries.length; i++) {
    const slice = timeSeries.slice(Math.max(0, i-5), i)
    const avg = slice.reduce((a,b)=>a+b,0)/slice.length
    const variance = slice.reduce((a,b)=>a+(b-avg)**2,0)/slice.length
    const volatility = Math.sqrt(variance)
    const state = getState(volatility)

    const qs = q[state]
    const actionIndex = qs.indexOf(Math.max(...qs))
    const action = actions[actionIndex]

    if (action === 'increase') policy.threshold += 1
    if (action === 'decrease') policy.threshold = Math.max(0, policy.threshold - 1)

    const reward = -volatility
    const nextState = getState(volatility)
    const nextMax = Math.max(...q[nextState])
    q[state][actionIndex] += alpha * (reward + gamma * nextMax - q[state][actionIndex])
  }

  return policy
}

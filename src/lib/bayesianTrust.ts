import { jStat } from 'jstat'

export interface BayesianTrustState {
  alpha: number
  beta: number
}

export class BayesianTrustEstimator {
  private state: BayesianTrustState

  constructor(alpha = 1, betaVal = 1) {
    this.state = { alpha, beta: betaVal }
  }

  /**
   * Update the trust estimator with the result of a task.
   * @param success - true if task succeeded, false otherwise
   * @returns updated state
   */
  update(success: boolean): BayesianTrustState {
    if (success) {
      this.state.alpha += 1
    } else {
      this.state.beta += 1
    }
    return this.state
  }

  /**
   * Mean of the Beta distribution representing expected trust.
   */
  get mean(): number {
    const { alpha, beta: b } = this.state
    return alpha / (alpha + b)
  }

  /**
   * Compute a confidence interval for the trust level.
   * @param level - confidence level (0-1), default 0.95
   */
  confidenceInterval(level = 0.95): { lower: number; upper: number } {
    const { alpha, beta: b } = this.state
    const lower = jStat.beta.inv((1 - level) / 2, alpha, b)
    const upper = jStat.beta.inv(1 - (1 - level) / 2, alpha, b)
    return { lower, upper }
  }

  /** Get current alpha/beta parameters */
  get parameters(): BayesianTrustState {
    return { ...this.state }
  }
}

export default BayesianTrustEstimator

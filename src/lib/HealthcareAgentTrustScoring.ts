export interface TrustFactors {
  clinicalAccuracy: number; // 0-100
  hipaaCompliance: number; // 0-100
  dataMinimization: number; // 0-100
  auditCompliance: number; // 0-100
  peerReview: number; // 0-100
}

export interface AgentProfile {
  clinicalArea?: string;
  certifications?: string[];
  patientPopulation?: string[];
}

export class HealthcareAgentTrustScoring {
  private factors: TrustFactors;
  private profile?: AgentProfile;

  private static WEIGHTS = {
    clinicalAccuracy: 0.3,
    hipaaCompliance: 0.25,
    dataMinimization: 0.2,
    auditCompliance: 0.15,
    peerReview: 0.1
  } as const;

  constructor(factors: TrustFactors, profile?: AgentProfile) {
    this.factors = factors;
    this.profile = profile;
  }

  private calculateBaseScore(): number {
    const w = HealthcareAgentTrustScoring.WEIGHTS;
    const f = this.factors;
    const score =
      f.clinicalAccuracy * w.clinicalAccuracy +
      f.hipaaCompliance * w.hipaaCompliance +
      f.dataMinimization * w.dataMinimization +
      f.auditCompliance * w.auditCompliance +
      f.peerReview * w.peerReview;
    return score;
  }

  private applyAdjustments(base: number): number {
    if (!this.profile) return base;
    let score = base;

    // Example adjustments based on clinical area sensitivity
    if (this.profile.clinicalArea) {
      const area = this.profile.clinicalArea.toLowerCase();
      if (['oncology', 'cardiology', 'neurology'].includes(area)) {
        score += 5; // higher expectations for critical areas
      }
    }

    // Certifications can boost trust
    if (this.profile.certifications && this.profile.certifications.length > 0) {
      score += Math.min(10, this.profile.certifications.length * 2);
    }

    // Patient population considerations
    if (this.profile.patientPopulation) {
      if (this.profile.patientPopulation.includes('pediatric')) {
        // stricter compliance expected
        score -= 5;
      }
      if (this.profile.patientPopulation.includes('geriatric')) {
        score += 2;
      }
    }

    return score;
  }

  public getTrustScore(): number {
    const base = this.calculateBaseScore();
    const adjusted = this.applyAdjustments(base);
    return Math.min(100, Math.max(0, adjusted));
  }
}

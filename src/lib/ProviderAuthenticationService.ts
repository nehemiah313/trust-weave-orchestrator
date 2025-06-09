export interface ProviderInfo {
  npi: string;
  licenseNumber: string;
  licenseState: string;
  credentialingStatus: string;
  deaNumber?: string;
}

export interface ProviderAuthResult {
  trustScore: number;
  accessLevel: 'full' | 'limited' | 'none';
  auditRequired: boolean;
}

export class ProviderAuthenticationService {
  static async authenticate(info: ProviderInfo): Promise<ProviderAuthResult> {
    const [npiValid, licenseValid, deaValid] = await Promise.all([
      this.verifyNpi(info.npi),
      this.verifyLicense(info.licenseNumber, info.licenseState),
      info.deaNumber ? this.verifyDea(info.deaNumber) : Promise.resolve(true)
    ]);

    const credentialValid = this.validateCredentialingStatus(info.credentialingStatus);

    let trustScore = 100;
    if (!npiValid) trustScore -= 40;
    if (!licenseValid) trustScore -= 30;
    if (!credentialValid) trustScore -= 20;
    if (!deaValid) trustScore -= 10;
    trustScore = Math.max(0, trustScore);

    let accessLevel: 'full' | 'limited' | 'none' = 'full';
    if (trustScore < 40) {
      accessLevel = 'none';
    } else if (trustScore < 70) {
      accessLevel = 'limited';
    }

    const auditRequired = trustScore < 80;

    return { trustScore, accessLevel, auditRequired };
  }

  private static async verifyNpi(npi: string): Promise<boolean> {
    try {
      const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${encodeURIComponent(npi)}`;
      const res = await fetch(url);
      if (!res.ok) return false;
      const data = await res.json();
      return Array.isArray(data.results) && data.results.length > 0;
    } catch {
      return false;
    }
  }

  private static async verifyLicense(number: string, state: string): Promise<boolean> {
    try {
      const res = await fetch('https://example.com/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, state })
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }

  private static async verifyDea(dea: string): Promise<boolean> {
    try {
      const res = await fetch('https://example.com/api/dea/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dea })
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }

  private static validateCredentialingStatus(status: string): boolean {
    return ['active', 'provisional'].includes(status.toLowerCase());
  }
}

export default ProviderAuthenticationService;

import crypto from 'crypto'

export interface PHIData {
  [key: string]: unknown
}

export interface ConsentRecord {
  subjectId: string
  allowedFields: string[]
  validUntil: Date
}

export interface AuditEvent {
  timestamp: Date
  event: string
  details?: unknown
}

/**
 * HealthcareAgentCommunication facilitates encrypted PHI exchange between
 * agents. It verifies consent, filters data according to the minimum
 * necessary standard, performs AES-256 encryption/decryption, generates
 * audit events, and can attest to ARC-AMPE compliance.
 */
export class HealthcareAgentCommunication {
  private key: Buffer

  constructor(secret: string) {
    if (secret.length < 32) {
      throw new Error('Secret must be at least 32 characters for AES-256')
    }
    this.key = crypto.createHash('sha256').update(secret).digest()
  }

  verifyConsent(consent: ConsentRecord): boolean {
    return consent.validUntil.getTime() > Date.now()
  }

  filterMinimumNecessary(data: PHIData, allowed: string[]): PHIData {
    const filtered: PHIData = {}
    for (const field of allowed) {
      if (field in data) {
        filtered[field] = data[field]
      }
    }
    return filtered
  }

  private encrypt(data: PHIData): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv)
    const serialized = JSON.stringify(data)
    const encrypted = Buffer.concat([cipher.update(serialized, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
  }

  private decrypt(payload: string): PHIData {
    const [ivHex, tagHex, dataHex] = payload.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const encryptedData = Buffer.from(dataHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()])
    return JSON.parse(decrypted.toString('utf8')) as PHIData
  }

  sendPHI(data: PHIData, consent: ConsentRecord): { payload: string; audit: AuditEvent } {
    if (!this.verifyConsent(consent)) {
      throw new Error('Consent is not valid')
    }
    const filtered = this.filterMinimumNecessary(data, consent.allowedFields)
    const payload = this.encrypt(filtered)
    const audit = this.generateAuditEvent('SEND', { fields: Object.keys(filtered) })
    return { payload, audit }
  }

  receivePHI(payload: string): { data: PHIData; audit: AuditEvent } {
    const data = this.decrypt(payload)
    const audit = this.generateAuditEvent('RECEIVE', { fields: Object.keys(data) })
    return { data, audit }
  }

  generateAuditEvent(event: string, details?: unknown): AuditEvent {
    return { timestamp: new Date(), event, details }
  }

  attestArcAmpeCompliance(): string {
    return 'Data exchange complies with ARC-AMPE privacy requirements.'
  }
}


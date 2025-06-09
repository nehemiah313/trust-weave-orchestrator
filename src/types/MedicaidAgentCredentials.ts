export interface AuditEntry {
  /** ISO timestamp of the event */
  timestamp: string
  /** description of the event */
  action: string
  /** agent or system that performed the action */
  performedBy: string
}

/**
 * Credential definition for Medicaid-integrated agents.
 * Explicitly scopes access to the minimum data necessary as
 * required by HIPAA's "minimum necessary" standard.
 */
export interface MedicaidAgentCredentials {
  /** Unique system identifier for the agent */
  agentId: string
  /** NPI or Medicaid provider identifier */
  providerId: string
  /** PEM encoded x509 certificate */
  x509Certificate: string
  /** HIPAA role determining allowed operations */
  hipaaRole: string
  /** State issuing the credential */
  stateJurisdiction: string
  /** Level of access granted (e.g., read, write, admin) */
  accessLevel: string
  /** Categories of data this agent may access */
  dataCategories: string[]
  /** Audit log entries recording credential usage */
  auditTrail: AuditEntry[]
}

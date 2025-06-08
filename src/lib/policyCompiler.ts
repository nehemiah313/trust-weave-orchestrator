export interface PolicyInput {
  agentId?: string
  trustLevel?: number
  roles?: string[]
  conditions?: Record<string, unknown>
}

export interface PolicyValidationResult {
  isValid: boolean
  errors: string[]
}

export function compilePolicy(input: PolicyInput): PolicyValidationResult {
  const errors: string[] = []

  if (!input.agentId || input.agentId.trim() === "") {
    errors.push("Missing agentId")
  }

  if (input.trustLevel === undefined || input.trustLevel === null) {
    errors.push("Missing trustLevel")
  } else if (typeof input.trustLevel !== "number" || input.trustLevel < 0 || input.trustLevel > 100) {
    errors.push("trustLevel must be a number between 0 and 100")
  }

  if (!input.conditions || Object.keys(input.conditions).length === 0) {
    errors.push("Missing conditions")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

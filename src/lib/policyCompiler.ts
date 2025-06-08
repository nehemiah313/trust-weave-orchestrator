export interface PolicyInput {
  agentId: string;
  trustLevel: number;
  roles: string[];
  conditions: string[];
}

export interface CompilationResult {
  isValid: boolean;
  errors?: string[];
}

export function compilePolicy(input: PolicyInput): CompilationResult {
  const errors: string[] = [];

  if (!input.agentId) errors.push("Missing agentId");
  if (input.trustLevel < 0 || input.trustLevel > 100)
    errors.push("Invalid trust level");
  if (input.conditions.length === 0)
    errors.push("No policy conditions defined");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

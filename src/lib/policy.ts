export interface Policy {
  id: string;
  name: string;
  trustLevel: number; // 0-100
  conditions?: Record<string, unknown>;
}

export interface CompiledPolicy {
  id: string;
  level: number;
  compiledConditions: Record<string, unknown>;
}

/**
 * Simple policy "compiler" that validates the input and returns a compiled policy object.
 * Throws an error if any field is invalid.
 */
export function compilePolicy(input: Partial<Policy>): CompiledPolicy {
  if (typeof input.id !== 'string' || input.id.length === 0) {
    throw new Error('Invalid id');
  }
  if (typeof input.name !== 'string' || input.name.length === 0) {
    throw new Error('Invalid name');
  }
  if (typeof input.trustLevel !== 'number' || !Number.isFinite(input.trustLevel)) {
    throw new Error('Invalid trust level type');
  }
  if (input.trustLevel < 0 || input.trustLevel > 100) {
    throw new Error('Trust level out of bounds');
  }
  const conditions = input.conditions ?? {};
  if (typeof conditions !== 'object' || Array.isArray(conditions)) {
    throw new Error('Invalid conditions');
  }
  return {
    id: input.id,
    level: input.trustLevel,
    compiledConditions: conditions,
  };
}

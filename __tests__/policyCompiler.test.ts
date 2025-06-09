import { compilePolicy } from '../src/lib/policyCompiler';

describe('compilePolicy failure scenarios', () => {
  it('throws error for invalid trustLevel', () => {
    const policy: any = {
      name: 'Invalid Level',
      trustLevel: 'super',
      conditions: []
    };
    expect(() => compilePolicy(policy)).toThrow(/trustLevel/i);
  });

  it('throws error when required fields are missing', () => {
    const policy: any = {
      trustLevel: 'high'
    };
    expect(() => compilePolicy(policy)).toThrow(/missing/i);
  });

  it('throws error for malformed conditions', () => {
    const policy: any = {
      name: 'Malformed Conditions',
      trustLevel: 'medium',
      conditions: [{ field: 'score' }] // operator/value missing
    };
    expect(() => compilePolicy(policy)).toThrow(/conditions/i);
  });
});

import { writeFileSync } from 'fs';
import { compilePolicy, Policy } from '../src/lib/policy.ts';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString() {
  return Math.random().toString(36).substring(2, 8);
}

function mutatePolicy(base: Policy): any {
  const mutated: any = { ...base };
  const fields = ['id', 'name', 'trustLevel', 'conditions'];
  const mutationCount = randomInt(1, fields.length);
  for (let i = 0; i < mutationCount; i++) {
    const field = fields[randomInt(0, fields.length - 1)];
    switch (field) {
      case 'id':
        mutated.id = Math.random() < 0.5 ? randomInt(1, 1000) as any : undefined;
        break;
      case 'name':
        mutated.name = Math.random() < 0.5 ? { obj: true } as any : undefined;
        break;
      case 'trustLevel':
        mutated.trustLevel = Math.random() < 0.5 ? randomString() as any : randomInt(-50, 150);
        break;
      case 'conditions':
        mutated.conditions = Math.random() < 0.5 ? 'invalid' as any : undefined;
        break;
    }
  }
  return mutated;
}

const iterations = 1000;
let crashCount = 0;
const failures: any[] = [];

const basePolicy: Policy = {
  id: 'base',
  name: 'Base Policy',
  trustLevel: 50,
  conditions: { allow: true },
};

for (let i = 0; i < iterations; i++) {
  const testInput = mutatePolicy(basePolicy);
  try {
    compilePolicy(testInput);
  } catch (err) {
    crashCount++;
    failures.push({ case: i, input: testInput, error: (err as Error).message });
  }
}

const percent = ((crashCount / iterations) * 100).toFixed(2);
console.log(`Fuzzed ${iterations} cases, crashes: ${crashCount} (${percent}%)`);
writeFileSync('fuzz_failures.log', failures.map(f => JSON.stringify(f)).join('\n'));

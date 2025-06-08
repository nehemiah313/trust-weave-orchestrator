const Ajv = require('ajv');
const ajv = new Ajv();

const policySchema = {
  type: 'object',
  required: ['policyId', 'trustContext', 'roles'],
  additionalProperties: false,
  properties: {
    policyId: { type: 'string' },
    trustContext: { type: 'string' },
    roles: {
      type: 'array',
      items: { type: 'string', enum: ['admin', 'editor', 'viewer'] },
    },
  },
};

const validate = ajv.compile(policySchema);

function validatePolicy(policy) {
  const valid = validate(policy);
  return { valid, errors: validate.errors };
}

const testCases = [
  {
    name: 'Valid policy',
    policy: {
      policyId: 'pol-1',
      trustContext: 'default',
      roles: ['admin', 'viewer'],
    },
    expected: true,
  },
  // Invalid cases
  {
    name: 'Missing policyId',
    policy: {
      trustContext: 'default',
      roles: ['admin'],
    },
    expected: false,
  },
  {
    name: 'Extra property',
    policy: {
      policyId: 'pol-2',
      trustContext: 'default',
      roles: ['editor'],
      extra: true,
    },
    expected: false,
  },
  {
    name: 'Roles not array',
    policy: {
      policyId: 'pol-3',
      trustContext: 'default',
      roles: 'admin',
    },
    expected: false,
  },
  // Edge cases
  {
    name: 'Missing trustContext',
    policy: {
      policyId: 'edge-1',
      roles: ['viewer'],
    },
    expected: false,
  },
  {
    name: 'Unexpected role',
    policy: {
      policyId: 'edge-2',
      trustContext: 'default',
      roles: ['admin', 'superuser'],
    },
    expected: false,
  },
];

let passed = 0;

for (const { name, policy, expected } of testCases) {
  const result = validatePolicy(policy);
  const success = result.valid === expected;
  if (success) passed++;
  console.log(`${name}: ${success ? 'PASS' : 'FAIL'}`);
  if (!result.valid) {
    console.log('  Errors:', result.errors);
  }
}

console.log(`\nSummary: ${passed}/${testCases.length} tests passed.`);

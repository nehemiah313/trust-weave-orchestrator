import { performance } from 'node:perf_hooks';

function randomTrust() {
  return Math.round(Math.random()); // 0 or 1
}

function majorityValue(values) {
  const counts = values.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
  if (counts[0] >= 4) return 0;
  if (counts[1] >= 4) return 1;
  return null;
}

async function runConsensusRound() {
  const start = performance.now();
  let values = Array.from({ length: 5 }, randomTrust);
  let consensus = majorityValue(values);
  let rounds = 0;

  while (consensus === null && rounds < 10) {
    // adopt the majority or default to 0 on tie
    const zeros = values.filter((v) => v === 0).length;
    const ones = values.length - zeros;
    const next = zeros >= ones ? 0 : 1;
    values = Array(values.length).fill(next);
    rounds += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    consensus = majorityValue(values);
  }

  const end = performance.now();
  return end - start;
}

async function runBenchmark(iterations = 20) {
  const times = [];
  for (let i = 0; i < iterations; i++) {
    times.push(await runConsensusRound());
  }
  const average = times.reduce((sum, t) => sum + t, 0) / times.length;
  console.log(`Average finality time: ${average.toFixed(2)} ms over ${iterations} runs.`);
  if (average > 500) {
    console.log('WARNING: Average exceeds 500ms.');
  }
}

runBenchmark().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import http from 'node:http';

let server: http.Server;
let port: number;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/message') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: body }));
        }, 1);
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      if (typeof address === 'object' && address) {
        port = address.port;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function sendMessage(msg: string) {
  const res = await fetch(`http://localhost:${port}/message`, {
    method: 'POST',
    body: msg,
  });
  return res.json();
}

describe('supabase edge function latency', () => {
  it('measures round-trip under 100ms', async () => {
    const runs = 50;
    const latencies: number[] = [];
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      await sendMessage('ping');
      const end = performance.now();
      latencies.push(end - start);
    }
    const sum = latencies.reduce((a, b) => a + b, 0);
    const avg = sum / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    console.log(`Latency stats over ${runs} runs: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
    expect(avg).toBeLessThan(100);
  });
});

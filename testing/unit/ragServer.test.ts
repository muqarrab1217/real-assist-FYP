import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Ensure env vars don't break initialization
process.env.GEMINI_API_KEY = 'test-key';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => 'response text',
        },
      }),
    }),
  })),
}));

// Mock fs to avoid real file writes
vi.mock('fs', () => {
  const mem: Record<string, string> = {};
  return {
    promises: {
      mkdir: vi.fn(async () => {}),
      readFile: vi.fn(async (p: string) => mem[p] || ''),
      writeFile: vi.fn(async (p: string, c: string) => {
        mem[p] = c;
      }),
    },
  };
});

// Mock multer storage side effects lightly
vi.mock('multer', () => {
  return () => ({
    array: () => (_req: any, _res: any, next: any) => next(),
  });
});

describe('ragBot server', () => {
  it('responds to health check', async () => {
    const app = require('../../ragBot/server/index.cjs');
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('health endpoint returns correct response body', async () => {
    const app = require('../../ragBot/server/index.cjs');
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('status');
    expect(typeof res.body.status).toBe('string');
  });

  it('handles invalid endpoints gracefully', async () => {
    const app = require('../../ragBot/server/index.cjs');
    const res = await request(app).get('/invalid-endpoint');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('health check response is consistent', async () => {
    const app = require('../../ragBot/server/index.cjs');
    const res1 = await request(app).get('/api/health');
    const res2 = await request(app).get('/api/health');
    expect(res1.body.status).toBe(res2.body.status);
    expect(res1.status).toBe(res2.status);
  });

  it('server endpoint responds with json', async () => {
    const app = require('../../ragBot/server/index.cjs');
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});



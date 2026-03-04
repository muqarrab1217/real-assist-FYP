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

const app = require('../../ragBot/server/index.js');

describe('ragBot server', () => {
  it('responds to health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});


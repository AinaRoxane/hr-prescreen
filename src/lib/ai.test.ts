import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screenCandidate } from './ai';

const originalFetch = global.fetch;

function mockFetchOnce(res: Response): void {
  vi.mocked(global.fetch).mockResolvedValueOnce(res);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

beforeEach(() => {
  process.env.CF_ACCOUNT_ID = 'test-account';
  process.env.CF_GATEWAY_ID = 'test-gateway';
  process.env.CF_API_TOKEN = 'test-api-token';
  process.env.CF_AIG_TOKEN = 'test-aig-token';
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  delete process.env.CF_ACCOUNT_ID;
  delete process.env.CF_GATEWAY_ID;
  delete process.env.CF_API_TOKEN;
  delete process.env.CF_AIG_TOKEN;
  vi.unstubAllGlobals();
  global.fetch = originalFetch;
});

describe('screenCandidate', () => {
  it('returns a valid model result', async () => {
    mockFetchOnce(jsonResponse({ result: { response: JSON.stringify({ score: 80, summary: 'ok', strengths: ['a'], gaps: [], questions: ['q'] }) } }));
    const result = await screenCandidate('offre', 'cv');
    expect(result.score).toBe(80);
  });

  it('parses JSON wrapped in markdown code fences', async () => {
    mockFetchOnce(jsonResponse({ result: { response: '```json\n{"score": 70,"summary":"ok","strengths":["a"],"gaps":[],"questions":["q"]}\n```' } }));
    const result = await screenCandidate('offre', 'cv');
    expect(result.score).toBe(70);
  });

  it('retries on invalid JSON then succeeds', async () => {
    mockFetchOnce(jsonResponse({ result: { response: 'not json' } }));
    mockFetchOnce(jsonResponse({ result: { response: JSON.stringify({ score: 60, summary: 'ok', strengths: ['a'], gaps: [], questions: ['q'] }) } }));
    const result = await screenCandidate('offre', 'cv');
    expect(result.score).toBe(60);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 401', async () => {
    mockFetchOnce(jsonResponse({ error: 'unauthorized' }, 401));
    await expect(screenCandidate('offre', 'cv')).rejects.toThrow('AI gateway error 401');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
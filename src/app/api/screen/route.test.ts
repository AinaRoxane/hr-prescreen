import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/ai', () => ({ screenCandidate: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: vi.fn() }));
vi.mock('@/lib/rateLimit', () => ({ allow: vi.fn(() => true) }));

import { screenCandidate } from '@/lib/ai';
import { supabaseAdmin } from '@/lib/supabase';
import { allow } from '@/lib/rateLimit';

function request(body: unknown, ip = '1.2.3.4'): Request {
  return new Request('http://localhost/api/screen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

function dbSuccess() {
  (supabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'abc' }, error: null }),
        }),
      }),
    }),
  });
}

function dbFailure() {
  (supabaseAdmin as ReturnType<typeof vi.fn>).mockReturnValue({
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'permission denied' } }),
        }),
      }),
    }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  (screenCandidate as ReturnType<typeof vi.fn>).mockResolvedValue({
    score: 80,
    summary: 'ok',
    strengths: ['a'],
    gaps: [],
    questions: ['q'],
  });
  (allow as ReturnType<typeof vi.fn>).mockReturnValue(true);
  dbSuccess();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/screen', () => {
  it('returns 400 for input that is too short', async () => {
    const res = await POST(request({ jobAd: 'x', cv: 'x' }));
    expect(res.status).toBe(400);
  });

  it('returns 200 with saved true on success', async () => {
    const res = await POST(request({ jobAd: 'offre'.repeat(10), cv: 'cv'.repeat(25) }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.saved).toBe(true);
    expect(data.result.score).toBe(80);
  });

  it('returns 200 with saved false when the DB insert fails', async () => {
    dbFailure();
    const res = await POST(request({ jobAd: 'offre'.repeat(10), cv: 'cv'.repeat(25) }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.saved).toBe(false);
    expect(data.result.score).toBe(80);
  });

  it('returns 429 when rate limited', async () => {
    (allow as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    const res = await POST(request({ jobAd: 'offre'.repeat(10), cv: 'cv'.repeat(25) }, '5.6.7.8'));
    expect(res.status).toBe(429);
  });
});
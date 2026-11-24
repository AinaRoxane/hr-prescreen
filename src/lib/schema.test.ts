import { describe, it, expect } from 'vitest';
import { ScreeningInputSchema, ScreeningResultSchema } from './schema';

describe('ScreeningInputSchema', () => {
  it('rejects texts that are too short', () => {
    expect(ScreeningInputSchema.safeParse({ jobAd: 'court', cv: 'court' }).success).toBe(false);
  });

  it('accepts valid input', () => {
    const text = 'x'.repeat(60);
    expect(ScreeningInputSchema.safeParse({ jobAd: text, cv: text }).success).toBe(true);
  });
});

describe('ScreeningResultSchema', () => {
  const valid = { score: 70, summary: 'ok', strengths: ['a'], gaps: [], questions: ['q'] };

  it('accepts a valid result', () => {
    expect(ScreeningResultSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a score above 100', () => {
    expect(ScreeningResultSchema.safeParse({ ...valid, score: 150 }).success).toBe(false);
  });

  it('rejects a score given as text', () => {
    expect(ScreeningResultSchema.safeParse({ ...valid, score: 'high' }).success).toBe(false);
  });
});

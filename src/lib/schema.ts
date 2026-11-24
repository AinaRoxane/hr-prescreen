import { z } from 'zod';

export const ScreeningInputSchema = z.object({
  jobAd: z.string().trim().min(50).max(8000),
  cv: z.string().trim().min(50).max(8000),
});

export const ScreeningResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(600),
  strengths: z.array(z.string()).min(1).max(6),
  gaps: z.array(z.string()).max(6),
  questions: z.array(z.string()).min(1).max(6),
});

export type ScreeningResult = z.infer<typeof ScreeningResultSchema>;

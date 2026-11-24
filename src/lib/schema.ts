import { z } from 'zod';

export const ScreeningInputSchema = z.object({
  jobAd: z.string().trim().min(50).max(8000),
  cv: z.string().trim().min(50).max(8000),
});

export const RequirementSchema = z.object({
  requirement: z.string().min(1).max(200),
  essential: z.boolean(),
  status: z.enum(['confirmed', 'partial', 'training', 'missing']),
  evidence: z.string().max(300),
});

export const ModelOutputSchema = z.object({
  requirements: z.array(RequirementSchema).min(1).max(15),
  summary: z.string().min(1).max(600),
  questions: z.array(z.string()).min(1).max(6),
});

export const ScreeningResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(600),
  strengths: z.array(z.string()).max(15),
  gaps: z.array(z.string()).max(15),
  questions: z.array(z.string()).min(1).max(6),
  requirements: z.array(RequirementSchema).optional(),
});

export type Requirement = z.infer<typeof RequirementSchema>;
export type ScreeningResult = z.infer<typeof ScreeningResultSchema>;
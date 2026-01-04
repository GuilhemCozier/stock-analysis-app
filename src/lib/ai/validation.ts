/**
 * Validation utilities for AI function inputs
 * Uses Zod for schema validation
 */

import { z } from 'zod';

/**
 * Schema for sector research parameters
 */
export const sectorResearchSchema = z.object({
  sectorName: z.string().min(1, 'Sector name is required').max(200),
});

export type SectorResearchInput = z.infer<typeof sectorResearchSchema>;

/**
 * Schema for stock analysis parameters
 */
export const stockAnalysisSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  ticker: z.string().nullable(),
  subSectorName: z.string().min(1, 'Sub-sector name is required').max(200),
  attemptNumber: z.number().int().min(1).max(3).default(1),
});

export type StockAnalysisInput = z.infer<typeof stockAnalysisSchema>;

/**
 * Schema for judge review parameters
 */
export const judgeReviewSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  attemptNumber: z.number().int().min(1).max(3),
  rawAnalysis: z.string().min(100, 'Analysis must be at least 100 characters'),
});

export type JudgeReviewInput = z.infer<typeof judgeReviewSchema>;

/**
 * Schema for format insights parameters
 */
export const formatInsightsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  approvedAnalysis: z.string().min(100, 'Analysis must be at least 100 characters'),
  judgeReview: z.string().min(10, 'Judge review must be at least 10 characters'),
});

export type FormatInsightsInput = z.infer<typeof formatInsightsSchema>;

/**
 * Helper function to validate input and return typed errors
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}

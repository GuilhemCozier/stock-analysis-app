/**
 * API Request Validation Schemas
 *
 * Zod schemas for validating API request payloads
 */

import { z } from 'zod';

/**
 * Schema for POST /api/analysis/start
 * Validates sector name input
 */
export const startAnalysisSchema = z.object({
  sectorName: z
    .string()
    .min(1, 'Sector name is required')
    .max(100, 'Sector name must be less than 100 characters')
    .trim(),
});

export type StartAnalysisInput = z.infer<typeof startAnalysisSchema>;

/**
 * API Request Validation Schemas
 *
 * Zod schemas for validating API request payloads
 */

import { z } from 'zod';

/**
 * Schema for POST /api/sector/start
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

/**
 * Schema for POST /api/subsector/[id]/approve
 * Allows optionally specifying which stocks (max 5) to analyze.
 */
export const approveSubSectorSchema = z.object({
  selectedStockIds: z.array(z.string().min(1)).max(5).optional(),
});

export type ApproveSubSectorInput = z.infer<typeof approveSubSectorSchema>;

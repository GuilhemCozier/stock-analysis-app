/**
 * ResearchStatus - Displays research progress with stage and metadata
 * States: initiating, in-progress (writing), complete, audit, error
 * Used in: Analysis detail/progress pages
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ResearchStatusProps {
  stage: string; // e.g., "Initiating Research", "Research Complete", "Error: A problem has occurred"
  sourcesCount?: number; // Number of sources analyzed (optional, only shown if > 0)
  duration: string; // Duration string, e.g., "7m 56s" or "30s"
}

/**
 * ResearchStatus component - Status indicator for AI research progress
 * 
 * Displays:
 * - Research stage text (e.g., "Initiating Research", "Research Complete")
 * - Optional sources count and duration metadata
 * - Error styling for error states
 * 
 * States:
 * - Initiating: Shows stage only, with just duration (e.g., "30s")
 * - In Progress: Shows stage with sources count and duration (e.g., "455 sources · 7m 56s")
 * - Complete: Shows "Research complete" with final metadata
 * - Error: Shows "Error: [message]" with error styling
 * 
 * Layout:
 * - Vertical stack (flex-col) with border border-neutral-200 rounded-lg
 * - Padding: p-4
 * - Stage text: font-sans text-base font-semibold text-neutral-900 (or text-error for errors)
 * - Metadata text: font-sans text-xs text-neutral-500
 * - Spacing: gap-2 between elements
 */
export function ResearchStatus({
  stage,
  sourcesCount,
  duration,
}: ResearchStatusProps) {
  const isError = stage.startsWith('Error:');
  const hasSources = sourcesCount !== undefined && sourcesCount > 0;

  return (
    <div
      className={cn(
        'flex flex-col',
        'border border-neutral-200 rounded-lg',
        'p-4',
        'gap-2'
      )}
    >
      <span
        className={cn(
          'font-sans text-base font-semibold',
          isError ? 'text-error' : 'text-neutral-900'
        )}
      >
        {stage}
      </span>
      <span className="font-sans text-xs text-neutral-500">
        {hasSources ? `${sourcesCount} sources · ${duration}` : duration}
      </span>
    </div>
  );
}

/**
 * SubSectorLauncher - Displays sub-sector metadata with research workflow trigger
 * States: Prepare Research → Research Initiated → Analysing (with progress) → Writing Report → Auditing Report → Research Completed
 * Used in: Sector analysis page, sub-sector grid
 */

'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface SubSectorLauncherProps {
  rank: number;                    // Sub-sector ranking (e.g., 1, 2, 3)
  name: string;                    // Sub-sector name (e.g., "Artificial Intelligence in Cybersecurity")
  stockCount: number;              // Number of stocks in this sub-sector
  description: string;             // One-liner description (truncated if too long)
  onReadMore?: () => void;         // Handler for "Read more..." button
  state: 'prepare' | 'initiated' | 'analysing' | 'writing' | 'auditing' | 'completed';
  progress?: {                     // Required when state is 'analysing'
    current: number;               // Current stock being analyzed
    total: number;                 // Total stocks to analyze
  };
  onLaunch?: () => void;           // Handler for main action button
}

/**
 * SubSectorLauncher component - Horizontal container with sub-sector info and action button
 * 
 * Layout:
 * - Horizontal flex container with space-between
 * - Left side: Rank, name, stock count, and description with "Read more..." button
 * - Right side: State-dependent action button
 * 
 * Button States:
 * - prepare: "Prepare Research" with ChevronRight icon, enabled
 * - initiated: "Research Initiated...", disabled
 * - analysing: "Analysing... (X/Y)", disabled
 * - writing: "Writing Report", disabled
 * - auditing: "Auditing Report...", disabled
 * - completed: "Research Completed", disabled
 */
export function SubSectorLauncher({
  rank,
  name,
  stockCount,
  description,
  onReadMore,
  state,
  progress,
  onLaunch,
}: SubSectorLauncherProps) {
  // Determine button text based on state
  const getButtonText = (): string => {
    switch (state) {
      case 'prepare':
        return 'Prepare Research';
      case 'initiated':
        return 'Research Initiated...';
      case 'analysing':
        if (progress) {
          return `Analysing... (${progress.current}/${progress.total})`;
        }
        return 'Analysing...';
      case 'writing':
        return 'Writing Report';
      case 'auditing':
        return 'Auditing Report...';
      case 'completed':
        return 'Research Completed';
      default:
        return 'Prepare Research';
    }
  };

  // Button is only enabled when state is 'prepare'
  const isButtonEnabled = state === 'prepare';

  return (
    <div className="flex items-start justify-between gap-6">
      {/* Left side: Sub-sector information */}
      <div className="flex-1 space-y-2 min-w-0">
        {/* Title: Rank, name, and stock count */}
        <div className="font-sans text-base font-medium text-neutral-900">
          #{rank} {name}{' '}
          <span className="font-semibold">·</span> {stockCount} Stocks
        </div>

        {/* Description row with "Read more..." button */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm text-neutral-600 truncate line-clamp-1 flex-1">
            {description}
          </span>
          {onReadMore && (
            <Button
              variant="ghost"
              onClick={onReadMore}
              className="flex-shrink-0 px-2 py-1 text-sm"
            >
              Read more...
            </Button>
          )}
        </div>
      </div>

      {/* Right side: Action button */}
      <div className="flex-shrink-0">
        <Button
          variant="outline"
          disabled={!isButtonEnabled}
          onClick={isButtonEnabled ? onLaunch : undefined}
          rightIcon={state === 'prepare' ? <ChevronRight className="size-5" /> : undefined}
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
}

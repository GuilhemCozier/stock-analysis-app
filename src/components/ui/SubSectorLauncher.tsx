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
  description: string;             // Description headline (one-line)
  longDescription?: string;        // Full description text (shown when expanded)
  onReadMore?: () => void;         // Handler for "Read more..." button (deprecated, using internal toggle)
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
  longDescription,
  onReadMore,
  state,
  progress,
  onLaunch,
}: SubSectorLauncherProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

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

  // Toggle expand/collapse
  const handleToggleDescription = () => {
    setIsExpanded(!isExpanded);
    // Call onReadMore if provided (for backwards compatibility)
    if (onReadMore && !isExpanded) {
      onReadMore();
    }
  };

  // Only show toggle button if longDescription exists
  const showToggle = longDescription && longDescription.trim().length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-6">
        {/* Left side: Sub-sector information */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title: Rank, name, and stock count */}
          <div className="font-sans text-base font-medium text-neutral-900">
            #{rank} {name}{' '}
            <span className="font-semibold">·</span> {stockCount} Stocks
          </div>

          {/* Description headline row with "Show more/less" button */}
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-neutral-600">
              {description}
            </span>
            {showToggle && (
              <Button
                variant="ghost"
                onClick={handleToggleDescription}
                className="flex-shrink-0 px-2 py-1 text-sm h-auto"
                rightIcon={
                  <ChevronRight
                    className={cn(
                      'size-4 transition-transform duration-200',
                      isExpanded && 'rotate-[-90deg]'
                    )}
                  />
                }
              >
                {isExpanded ? 'Show less' : 'Show more'}
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

      {/* Long description (shown when expanded) - spans full width */}
      {isExpanded && longDescription && (
        <div className="font-sans text-sm leading-relaxed text-neutral-600">
          {longDescription}
        </div>
      )}
    </div>
  );
}

/**
 * Displays sector analysis report summary with title, overview text, and sub-sector actions
 * Used in: Main analysis page after sector analysis completes
 */

'use client';

import * as React from 'react';
import { Button } from './Button';
import { SubSectorLauncher } from './SubSectorLauncher';

export interface SectorReportSummaryProps {
  title: string;
  summary: string;
  onReadFullReport: () => void;
  subSectors: Array<{
    id: string;
    rank: number;
    name: string;
    stockCount: number;
    description: string;
    status: 'pending' | 'initiated' | 'analyzing' | 'writing' | 'auditing' | 'completed';
    progress?: number;
  }>;
}

/**
 * SectorReportSummary component - Vertical stack container for sector report overview
 * 
 * Layout:
 * - Vertical stack with consistent spacing between elements
 * - Title at top
 * - Summary text below title
 * - Ghost button below summary
 * - List of SubSectorLauncher components at bottom
 */
export function SectorReportSummary({
  title,
  summary,
  onReadFullReport,
  subSectors,
}: SectorReportSummaryProps) {
  // Map status to SubSectorLauncher state
  const mapStatusToState = (
    status: 'pending' | 'initiated' | 'analyzing' | 'writing' | 'auditing' | 'completed'
  ): 'prepare' | 'initiated' | 'analysing' | 'writing' | 'auditing' | 'completed' => {
    switch (status) {
      case 'pending':
        return 'prepare';
      case 'initiated':
        return 'initiated';
      case 'analyzing':
        return 'analysing';
      case 'writing':
        return 'writing';
      case 'auditing':
        return 'auditing';
      case 'completed':
        return 'completed';
      default:
        return 'prepare';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="font-serif text-2xl font-semibold leading-tight text-neutral-900">
        {title}
      </h2>

      {/* Summary text */}
      <div className="font-serif text-md leading-relaxed text-neutral-900">
        {summary}
      </div>

      {/* Read Full Report button */}
      <Button variant="ghost" onClick={onReadFullReport}>
        Read Full Report
      </Button>

      {/* Sub-sector launchers list */}
      <div className="space-y-4">
        {subSectors.map((subSector) => (
          <SubSectorLauncher
            key={subSector.id}
            rank={subSector.rank}
            name={subSector.name}
            stockCount={subSector.stockCount}
            description={subSector.description}
            state={mapStatusToState(subSector.status)}
            progress={
              subSector.progress !== undefined && subSector.status === 'analyzing'
                ? {
                    // If progress is provided as a number, assume it's current stock index
                    // Total is stockCount, current is progress (or we could derive differently)
                    // For now, if progress is 0-1, treat as percentage; otherwise as current index
                    current:
                      subSector.progress <= 1
                        ? Math.round(subSector.progress * subSector.stockCount)
                        : subSector.progress,
                    total: subSector.stockCount,
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

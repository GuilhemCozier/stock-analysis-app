/**
 * Displays stock analysis summary with ranking, company name, key metrics, and report access.
 * Shows 5-year conservative ROI percentage, current price action recommendation, research status, and read report button.
 * Used in: Stock analysis results page
 */

'use client';

import * as React from 'react';
import { Button } from './Button';
import { ResearchStatus } from './ResearchStatus';

export interface StockReportSummaryProps {
  rank: number;                     // Stock ranking position (e.g., 1, 2, 3)
  companyName: string;              // Name of the company (e.g., "Microsoft")
  conservative5yTarget: number;     // 5-year conservative target price
  priceAtAnalysis: number;          // Stock price at time of analysis
  actionAtAnalysis: string;         // Current recommendation (e.g., "Accumulate", "Hold", "Reduce")
  researchStatus: string;           // Research completion status (e.g., "Research complete")
  sourcesCount: number;             // Number of sources analyzed
  duration: string;                 // Time taken for analysis (e.g., "7m 56s")
  onReadReport: () => void;         // Callback when "Read Full Report" is clicked
}

/**
 * StockReportSummary component - Comprehensive stock analysis summary
 * 
 * Displays:
 * - Title with rank and company name
 * - Key financial metrics (5-year conservative ROI and current price action)
 * - Research completion status
 * - Button to access full report
 * 
 * Layout:
 * - Vertical stack with consistent spacing (space-y-6)
 * - Responsive grid for metrics (stacked on mobile, side-by-side on desktop)
 * - Full-width button on mobile, auto width on desktop
 */
export function StockReportSummary({
  rank,
  companyName,
  conservative5yTarget,
  priceAtAnalysis,
  actionAtAnalysis,
  researchStatus,
  sourcesCount,
  duration,
  onReadReport,
}: StockReportSummaryProps) {
  // Calculate 5-year conservative ROI percentage
  const roiPercentage = Math.round(
    ((conservative5yTarget - priceAtAnalysis) / priceAtAnalysis) * 100
  );

  return (
    <div className="space-y-6">
      {/* Title section */}
      <h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900">
        #{rank} {companyName}
      </h1>

      {/* Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 5 Year Conservative ROI box */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 md:p-6">
          <div className="font-sans text-sm font-medium text-neutral-600 text-center">
            5 Year Conservative ROI
          </div>
          <div className="font-serif text-3xl font-semibold leading-tight text-neutral-900 text-center mt-2">
            {roiPercentage}%
          </div>
        </div>

        {/* Current Price Action box */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 md:p-6">
          <div className="font-sans text-sm font-medium text-neutral-600 text-center">
            Current Price Action
          </div>
          <div className="font-serif text-3xl font-semibold leading-tight text-neutral-900 text-center mt-2">
            {actionAtAnalysis}
          </div>
        </div>
      </div>

      {/* ResearchStatus component */}
      <ResearchStatus
        stage={researchStatus}
        sourcesCount={sourcesCount}
        duration={duration}
      />

      {/* Read Full Report button */}
      <Button
        variant="outline"
        onClick={onReadReport}
        className="w-full md:w-auto"
      >
        Read Full Report
      </Button>
    </div>
  );
}

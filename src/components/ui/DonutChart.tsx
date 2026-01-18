/**
 * Small circular progress indicator (donut chart).
 * Displays a value on a 0-10 scale as a filled circular progress ring.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DonutChartProps {
  value: number; // 0-10 scale
  size?: number; // diameter in pixels, default 24
}

/**
 * DonutChart component - Small circular progress indicator
 * 
 * Uses SVG circle with stroke-dasharray to create a progress ring.
 * The circle is filled based on value/10 percentage.
 * Colors: neutral-200 for background ring, neutral-900 for filled portion.
 */
export function DonutChart({ value, size = 24 }: DonutChartProps) {
  // Clamp value between 0 and 10
  const clampedValue = Math.max(0, Math.min(10, value));
  
  // Calculate percentage (0-100)
  const percentage = (clampedValue / 10) * 100;
  
  // SVG circle properties
  const radius = (size - 4) / 2; // Account for stroke width (2px on each side)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
      aria-hidden="true"
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-neutral-200"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="text-neutral-900 transition-all duration-300"
      />
    </svg>
  );
}

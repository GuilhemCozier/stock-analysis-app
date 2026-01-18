/**
 * Table data cell component with multiple variants for displaying different types of content.
 * Optimized with React.memo for performance when rendering many instances simultaneously.
 */

'use client';

import * as React from 'react';
import { Tag, TagProps } from './Tag';
import { DonutChart } from './DonutChart';
import { cn } from '@/lib/utils';

export type DatabaseCellVariant = 'text' | 'number' | 'select';

export interface DatabaseCellProps {
  variant: DatabaseCellVariant;
  // For text/number variants:
  content?: string;
  // For number variant:
  showDonutChart?: boolean;
  donutValue?: number; // 0-10 scale
  // For select variant:
  tags?: Array<{ label: string; variant: TagProps['variant'] }>;
}

/**
 * DatabaseCell component - Table data cell with variants
 * 
 * Variants:
 * - text: Content aligned left, text-base text-neutral-900
 * - number: Content aligned right, font-mono, with optional DonutChart
 * - select: Multiple Tag components in flex row with gap-2, flex-wrap enabled
 * 
 * Layout:
 * - Always has border-b border-r border-neutral-200
 * - Padding: px-4 py-3
 * - Background: white
 * 
 * Performance: Uses React.memo for optimization when rendering many instances.
 */
export const DatabaseCell = React.memo<DatabaseCellProps>(function DatabaseCell({
  variant,
  content,
  showDonutChart = false,
  donutValue,
  tags,
}) {
  // Text variant
  if (variant === 'text') {
    return (
      <div
        className={cn(
          'px-4 py-3',
          'bg-white',
          'border-b border-r border-neutral-200',
          'flex items-center justify-start'
        )}
      >
        <span className="text-base text-neutral-900 font-sans">
          {content || ''}
        </span>
      </div>
    );
  }

  // Number variant
  if (variant === 'number') {
    return (
      <div
        className={cn(
          'px-4 py-3',
          'bg-white',
          'border-b border-r border-neutral-200',
          'flex items-center justify-end gap-2'
        )}
      >
        <span className="font-mono text-base font-medium text-neutral-900">
          {content || ''}
        </span>
        {showDonutChart && donutValue !== undefined && (
          <DonutChart value={donutValue} size={24} />
        )}
      </div>
    );
  }

  // Select variant
  if (variant === 'select') {
    return (
      <div
        className={cn(
          'px-4 py-3',
          'bg-white',
          'border-b border-r border-neutral-200',
          'flex items-center justify-start gap-2',
          'flex-wrap'
        )}
      >
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => (
            <Tag key={index} label={tag.label} variant={tag.variant} />
          ))
        ) : (
          <span className="text-base text-neutral-400 font-sans">—</span>
        )}
      </div>
    );
  }

  return null;
});

DatabaseCell.displayName = 'DatabaseCell';

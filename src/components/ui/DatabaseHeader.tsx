/**
 * Table header cell component for database tables.
 * Displays an icon and text label with consistent styling.
 */

'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatabaseHeaderProps {
  leftIcon: LucideIcon; // From lucide-react
  leftText: string;
  showRightBorder?: boolean;
}

/**
 * DatabaseHeader component - Table header cell
 * 
 * Layout:
 * - Flex row with items-center, gap between icon and text
 * - Icon size: size-4 (16px) in neutral-600
 * - Text: text-sm font-medium text-neutral-600
 * - Padding: px-4 py-3
 * - Border bottom: border-b border-neutral-200 (always)
 * - Border right: border-r border-neutral-200 (conditional)
 * - Background: white
 */
export function DatabaseHeader({
  leftIcon: LeftIcon,
  leftText,
  showRightBorder = false,
}: DatabaseHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'px-4 py-3',
        'bg-white',
        'border-b border-neutral-200',
        showRightBorder && 'border-r border-neutral-200'
      )}
    >
      <LeftIcon className="size-4 text-neutral-600 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium text-neutral-600 font-sans">
        {leftText}
      </span>
    </div>
  );
}

/**
 * Colored pill-shaped label component for categorizing content.
 * Used in database tables to display tags with semantic color variants.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TagProps {
  label: string;
  variant: 'tech' | 'finance' | 'cybersecurity' | 'defense' | 'luxury' | 'default';
}

/**
 * Tag component - Colored pill-shaped label
 * 
 * Variants:
 * - tech: Blue background with blue-700 text
 * - finance: Green background with green-700 text
 * - cybersecurity: Purple background with purple-700 text
 * - defense: Red/pink background with red-700 text
 * - luxury: Purple/violet background with purple-700 text
 * - default: Neutral background with neutral-700 text
 */
export function Tag({ label, variant }: TagProps) {
  const variantStyles = {
    tech: 'bg-blue-100 text-blue-700',
    finance: 'bg-green-100 text-green-700',
    cybersecurity: 'bg-purple-100 text-purple-700',
    defense: 'bg-red-100 text-red-700',
    luxury: 'bg-violet-100 text-violet-700',
    default: 'bg-neutral-100 text-neutral-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'px-3 py-1',
        'rounded-full',
        'text-sm font-medium',
        'font-sans',
        variantStyles[variant]
      )}
    >
      {label}
    </span>
  );
}

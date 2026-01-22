/**
 * Horizontal container with left and right button groups.
 * Buttons are mapped on-demand based on props configuration.
 * Used in: Page headers, toolbars
 */

'use client';

import * as React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ButtonConfig {
  id: string;                                // Unique identifier for the button
  children?: React.ReactNode;                // Button text
  leftIcon?: React.ReactNode;                // Icon from lucide-react
  rightIcon?: React.ReactNode;               // Icon from lucide-react
  variant?: 'primary' | 'subtle' | 'outline' | 'ghost' | 'disabled';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  'aria-label'?: string;
}

export interface TopBarProps {
  leftButtons?: ButtonConfig[];              // Array of button configs for left side
  rightButtons?: ButtonConfig[];             // Array of button configs for right side
  className?: string;                        // Additional Tailwind classes
}

/**
 * TopBar component - Horizontal container with left and right button groups
 * 
 * Layout:
 * - Full-width horizontal container with two sections (left and right)
 * - Maps Button components dynamically from leftButtons and rightButtons arrays
 * - Buttons maintain consistent spacing within their groups
 * - Left and right sections are aligned to opposite ends using flexbox
 * 
 * Styling:
 * - Container: border border-neutral-200 bg-white px-4 py-3 md:px-6 md:py-4 rounded-lg
 * - Left section: flex items-center gap-2
 * - Right section: flex items-center gap-2
 * - Outer container: flex items-center justify-between
 */
export function TopBar({
  leftButtons = [],
  rightButtons = [],
  className,
}: TopBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'border border-neutral-200 bg-white',
        'px-4 py-3 md:px-6 md:py-4',
        'rounded-lg',
        className
      )}
    >
      {/* Left button group */}
      <div className="flex items-center gap-2">
        {leftButtons.map((config) => (
          <Button key={config.id} {...config} />
        ))}
      </div>

      {/* Right button group */}
      <div className="flex items-center gap-2">
        {rightButtons.map((config) => (
          <Button key={config.id} {...config} />
        ))}
      </div>
    </div>
  );
}

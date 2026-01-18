/**
 * MenuItem component - Flexible horizontal button layout for menu items
 * Supports optional left icon, left text, right text, and right icon
 * States: default, hover, selected, disabled
 */

'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  // Content
  leftIcon?: LucideIcon;
  leftText?: string;
  rightText?: string;
  rightIcon?: LucideIcon;
  
  // States
  disabled?: boolean;
  selected?: boolean;
  
  // Interaction
  onClick?: () => void;
  
  // Styling
  paddingX?: 'sm' | 'md' | 'lg'; // Maps to px-3, px-4, px-5
  className?: string;
}

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    {
      leftIcon: LeftIcon,
      leftText,
      rightText,
      rightIcon: RightIcon,
      disabled = false,
      selected = false,
      onClick,
      paddingX = 'md',
      className,
    },
    ref
  ) => {
    // Padding variants mapping
    const paddingVariants = {
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-5',
    };

    // Handle click - prevent if disabled
    const handleClick = () => {
      if (disabled) return;
      onClick?.();
    };

    // Handle keyboard events (Enter/Space)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    };

    // Base styles
    const baseStyles = cn(
      'w-full', // Full width
      'flex justify-between items-center', // Layout structure
      'py-2.5', // Height: 40px total with padding
      paddingVariants[paddingX], // Horizontal padding
      'rounded-md', // Border radius
      'transition-colors duration-150', // Transitions
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', // Focus state
      // Default state
      !selected && !disabled && 'bg-transparent text-neutral-700',
      // Hover state (only when not disabled and not selected)
      !selected && !disabled && 'hover:bg-neutral-100 hover:text-neutral-900',
      // Selected state
      selected && !disabled && 'bg-primary/10 text-primary',
      // Disabled state
      disabled && 'cursor-not-allowed opacity-50',
      className
    );

    return (
      <button
        ref={ref}
        type="button"
        className={baseStyles}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {/* Left Group - flex items-center gap-3 */}
        <div className="flex items-center gap-3">
          {LeftIcon && (
            <LeftIcon 
              className="size-5"
              aria-hidden="true" 
            />
          )}
          {leftText && (
            <span className="font-sans text-base">
              {leftText}
            </span>
          )}
        </div>

        {/* Right Group - flex items-center gap-2 */}
        <div className="flex items-center gap-2">
          {rightText && (
            <span className="font-sans text-sm">
              {rightText}
            </span>
          )}
          {RightIcon && (
            <RightIcon 
              className="size-5"
              aria-hidden="true" 
            />
          )}
        </div>
      </button>
    );
  }
);

MenuItem.displayName = 'MenuItem';

export default MenuItem;

/**
 * MenuItem component - Flexible horizontal button layout for menu items
 * Supports optional left icon, left text, right text, and right icon
 * States: default, hover, selected, disabled
 * Variants: default, MenuHeader (for collapsible menu sections)
 */

'use client';

import * as React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  // Content
  leftIcon?: LucideIcon;
  leftText?: string;
  rightText?: string;
  rightIcon?: LucideIcon;
  
  // Variant
  variant?: 'default' | 'MenuHeader';
  
  // States
  disabled?: boolean;
  selected?: boolean;
  expanded?: boolean; // For MenuHeader variant - controls chevron rotation
  
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
      variant = 'default',
      disabled = false,
      selected = false,
      expanded = false,
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

    // For MenuHeader variant: use ChevronRight as default right icon if none provided
    const isMenuHeader = variant === 'MenuHeader';
    const effectiveRightIcon: LucideIcon | undefined = isMenuHeader && !RightIcon ? ChevronRight : RightIcon;
    const showRightIcon = effectiveRightIcon !== undefined;
    
    // Use capitalized name for JSX component rendering
    const RightIconComponent = effectiveRightIcon;

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
      // Add group class for MenuHeader variant to enable group-hover on child icon
      isMenuHeader && 'group',
      // Default state - MenuHeader variant uses dimmer color
      !selected && !disabled && !isMenuHeader && 'bg-transparent text-neutral-700',
      !selected && !disabled && isMenuHeader && 'bg-transparent text-neutral-500',
      // Hover state (only when not disabled and not selected)
      !selected && !disabled && !isMenuHeader && 'hover:bg-neutral-100 hover:text-neutral-900',
      !selected && !disabled && isMenuHeader && 'hover:bg-neutral-100 hover:text-neutral-700',
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
            <span className={cn(
              'font-sans',
              isMenuHeader ? 'text-sm' : 'text-base'
            )}>
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
          {showRightIcon && RightIconComponent && (
            <RightIconComponent 
              className={cn(
                'size-5',
                // MenuHeader variant: opacity and rotation transitions
                isMenuHeader && [
                  'opacity-0 transition-[transform,opacity] duration-200',
                  'group-hover:opacity-100',
                  !expanded && '-rotate-90',
                  expanded && 'rotate-0'
                ],
                // Default variant: only rotation transition if needed
                !isMenuHeader && 'transition-transform duration-200'
              )}
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

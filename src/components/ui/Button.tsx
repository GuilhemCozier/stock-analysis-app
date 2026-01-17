/**
 * Flexible button component with optional left icon, text, and right icon.
 * Variants: primary, subtle, outline, ghost, disabled
 * States: default, hover, loading (with spinner)
 * Renders as <button> or <a> depending on href prop
 */

'use client';

import * as React from 'react';
import { Loader2, Download, Search, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  // Content
  children?: React.ReactNode;           // Button text (optional)
  leftIcon?: React.ReactNode;           // Left icon from lucide-react (optional)
  rightIcon?: React.ReactNode;          // Right icon from lucide-react (optional)
  
  // Variants
  variant?: 'primary' | 'subtle' | 'outline' | 'ghost' | 'disabled';
  
  // States
  loading?: boolean;                    // Shows spinner, disables interaction
  disabled?: boolean;                   // Faded appearance, prevents interaction
  
  // Link behavior
  href?: string;                        // If provided, renders as <a> instead of <button>
  
  // Standard props
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset'; // Only applies when rendering as button
  className?: string;                   // Additional Tailwind classes
  'aria-label'?: string;                // Accessible label (required for icon-only buttons)
}

/**
 * Flexible Button component with support for icons, variants, loading states, and link behavior.
 * 
 * When href is provided, renders as an anchor element. Otherwise renders as a button element.
 * Loading state replaces rightIcon (or leftIcon if no rightIcon exists) with a spinner.
 */
export function Button({
  children,
  leftIcon,
  rightIcon,
  variant = 'primary',
  loading = false,
  disabled = false,
  href,
  onClick,
  type = 'button',
  className,
  'aria-label': ariaLabel,
}: ButtonProps) {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;
  
  // Determine which icon to replace with spinner
  const showLeftSpinner = loading && !rightIcon;
  const showRightSpinner = loading && rightIcon;
  
  // Base styles shared by all variants
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2',
    'px-5 py-3',
    'rounded-md',
    'font-medium text-base',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    // Disabled/loading state
    isDisabled && 'cursor-not-allowed',
    className
  );
  
  // Variant-specific styles
  const variantStyles = {
    primary: cn(
      'bg-primary text-white',
      !isDisabled && 'hover:bg-primary-hover active:bg-primary-pressed'
    ),
    subtle: cn(
      'bg-neutral-100 text-neutral-900',
      !isDisabled && 'hover:bg-neutral-200'
    ),
    outline: cn(
      'border border-neutral-200 bg-transparent text-neutral-900',
      !isDisabled && 'hover:bg-neutral-50'
    ),
    ghost: cn(
      'bg-transparent text-neutral-700',
      !isDisabled && 'hover:bg-neutral-100'
    ),
    disabled: cn(
      'bg-neutral-100 text-neutral-400 cursor-not-allowed'
    ),
  };
  
  const combinedStyles = cn(baseStyles, variantStyles[variant]);
  
  // Icon rendering helper
  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    if (position === 'left' && showLeftSpinner) {
      return <Loader2 className="size-5 animate-spin" aria-hidden="true" />;
    }
    if (position === 'right' && showRightSpinner) {
      return <Loader2 className="size-5 animate-spin" aria-hidden="true" />;
    }
    if (icon) {
      return <span aria-hidden="true">{icon}</span>;
    }
    return null;
  };
  
  // Determine if we need an aria-label (icon-only button)
  // Note: For icon-only buttons, aria-label should be provided by the user for accessibility
  
  // Shared content
  const content = (
    <>
      {renderIcon(leftIcon, 'left')}
      {children}
      {renderIcon(rightIcon, 'right')}
    </>
  );
  
  // Render as anchor if href is provided
  if (href) {
    return (
      <a
        href={isDisabled ? undefined : href}
        className={combinedStyles}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
            return;
          }
          onClick?.();
        }}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        tabIndex={isDisabled ? -1 : undefined}
      >
        {content}
      </a>
    );
  }
  
  // Render as button
  return (
    <button
      type={type}
      className={combinedStyles}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onClick?.();
      }}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}

/**
 * Preview component for Visual Editor
 * This default export allows Cursor's Visual Editor to render the component
 */
export default function ButtonPreview() {
  return (
    <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
      <div className="space-y-4">
        <h2 className="font-sans text-xl font-semibold text-neutral-900">Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="disabled">Disabled</Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="font-sans text-xl font-semibold text-neutral-900">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<Download className="size-5" />}>With Left Icon</Button>
          <Button rightIcon={<ChevronRight className="size-5" />}>With Right Icon</Button>
          <Button 
            leftIcon={<Search className="size-5" />}
            rightIcon={<ChevronRight className="size-5" />}
          >
            Both Icons
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="font-sans text-xl font-semibold text-neutral-900">States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
          <Button leftIcon={<Star className="size-5" />} loading>
            Loading with Icon
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="font-sans text-xl font-semibold text-neutral-900">Icon Only</h2>
        <div className="flex flex-wrap gap-4">
          <Button leftIcon={<Download className="size-5" />} variant="primary" aria-label="Download" />
          <Button leftIcon={<Search className="size-5" />} variant="outline" aria-label="Search" />
        </div>
      </div>
    </div>
  );
}

/*
 * USAGE EXAMPLES:
 * 
 * // Icon-only button
 * <Button leftIcon={<Download className="size-5" />} aria-label="Download report" />
 * 
 * // Text-only button
 * <Button>Generate Analysis</Button>
 * 
 * // Text with both icons
 * <Button 
 *   leftIcon={<Search className="size-5" />}
 *   rightIcon={<ChevronRight className="size-5" />}
 * >
 *   Search Stocks
 * </Button>
 * 
 * // Loading state
 * <Button loading>Processing...</Button>
 * 
 * // Link variant (with href)
 * <Button href="/analysis" variant="outline">
 *   View Analysis
 * </Button>
 * 
 * // Different variants
 * <Button variant="primary">Primary Action</Button>
 * <Button variant="subtle">Secondary Action</Button>
 * <Button variant="outline">Outline Action</Button>
 * <Button variant="ghost">Ghost Action</Button>
 * <Button variant="disabled">Disabled</Button>
 * 
 * // Disabled state
 * <Button disabled>Cannot Click</Button>
 * 
 * // Loading with icons
 * <Button 
 *   leftIcon={<Star className="size-5" />}
 *   loading
 * >
 *   Saving...
 * </Button>
 */
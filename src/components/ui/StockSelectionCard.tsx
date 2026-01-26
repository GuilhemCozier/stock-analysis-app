/**
 * Displays a selectable stock card with company name, symbol, and collapsible description
 * States: selected (with check icon), unselected
 * Used in: Stock selection page for choosing companies to analyze
 */

'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockSelectionCardProps {
  companyName: string;
  symbol: string;
  description: string;
  isSelected: boolean;
  onToggleSelection: () => void;
  statusLabel?: string;
  statusTone?: 'info' | 'neutral' | 'warning' | 'success' | 'error';
  showCheckbox?: boolean;
  disabled?: boolean;
}

export function StockSelectionCard({
  companyName,
  symbol,
  description,
  isSelected,
  onToggleSelection,
  statusLabel,
  statusTone = 'neutral',
  showCheckbox = true,
  disabled = false,
}: StockSelectionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleDescriptionClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <h3 className="font-sans text-xl font-semibold text-neutral-900">
        {companyName} ({symbol})
      </h3>

      {/* Description Container */}
      <div
        onClick={handleDescriptionClick}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDescriptionClick();
          }
        }}
        aria-expanded={isExpanded}
      >
        <p
          className={cn(
            'font-serif text-md leading-relaxed text-neutral-900',
            isExpanded ? 'line-clamp-10' : 'line-clamp-3'
          )}
        >
          {description}
        </p>
        <button
          type="button"
          className="mt-2 text-primary hover:text-primary-hover hover:underline transition-colors duration-150"
          onClick={(e) => {
            e.stopPropagation();
            handleDescriptionClick();
          }}
        >
          {isExpanded ? 'Read less...' : 'Read more...'}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Status Badge */}
        <span
          className={cn(
            'rounded-sm px-3 py-1 text-sm font-medium border',
            statusLabel
              ? {
                  info: 'bg-info-bg text-info border-info/20',
                  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
                  warning: 'bg-warning-bg text-warning border-warning/20',
                  success: 'bg-success-bg text-success border-success/20',
                  error: 'bg-error-bg text-error border-error/20',
                }[statusTone]
              : isSelected
                ? 'bg-info-bg text-info border-info/20'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
          )}
        >
          {statusLabel ?? (isSelected ? 'Selected' : 'Unselected')}
        </span>

        {/* Checkbox */}
        {showCheckbox ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={disabled ? undefined : onToggleSelection}
            className={cn(
              'rounded-md size-8 flex items-center justify-center transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              disabled && 'cursor-not-allowed opacity-60',
              isSelected
                ? 'bg-info text-white hover:bg-info/90'
                : 'bg-neutral-100 border border-neutral-200 hover:bg-neutral-200'
            )}
            aria-label={isSelected ? 'Deselect stock' : 'Select stock'}
            aria-disabled={disabled}
            disabled={disabled}
          >
            {isSelected && <Check className="size-5" aria-hidden="true" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

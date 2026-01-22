/**
 * ChatInputField - Vertical stack with textarea input and button row
 * States: Sector Analysis (default) or Stock Analysis mode
 * Used in: Main analysis input page
 */

'use client';

import * as React from 'react';
import { Factory, Store, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import MenuItem from './MenuItem';
import { cn } from '@/lib/utils';

interface ChatInputFieldProps {
  onLaunch?: (input: string, analysisType: 'sector' | 'stock') => void;
  defaultAnalysisType?: 'sector' | 'stock';
}

export function ChatInputField({
  onLaunch,
  defaultAnalysisType = 'sector',
}: ChatInputFieldProps) {
  const [analysisType, setAnalysisType] = React.useState<'sector' | 'stock'>(
    defaultAnalysisType
  );
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Click-outside detection to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Keyboard accessibility: Escape to close dropdown
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  // Handle analysis type selection
  const handleAnalysisTypeSelect = (type: 'sector' | 'stock') => {
    setAnalysisType(type);
    setIsDropdownOpen(false);
  };

  // Handle launch button click
  const handleLaunch = () => {
    if (inputValue.trim() && onLaunch) {
      onLaunch(inputValue.trim(), analysisType);
    }
  };

  // Handle Enter key in textarea (submit)
  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleLaunch();
    }
  };

  // Dynamic placeholder based on analysis type
  const placeholder =
    analysisType === 'sector'
      ? 'Type the name of a sector (e.g. "Cybersecurity")'
      : 'Type the name of a company (e.g. "Microsoft")';

  // Icon for analysis type button
  const AnalysisTypeIcon = analysisType === 'sector' ? Factory : Store;

  return (
    <div className="flex flex-col gap-4">
      {/* Textarea */}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleTextareaKeyDown}
        placeholder={placeholder}
        className={cn(
          'min-h-[120px]',
          'w-full',
          'rounded-md',
          'border border-neutral-200',
          'px-4 py-2.5',
          'text-base font-sans',
          'text-neutral-900',
          'placeholder:text-neutral-400',
          'bg-white',
          'transition-all duration-150',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'resize-none'
        )}
        aria-label={placeholder}
      />

      {/* Button Row */}
      <div className="flex items-center gap-3">
        {/* Analysis Type Button with Dropdown */}
        <div ref={containerRef} className="relative">
          <Button
            variant="outline"
            leftIcon={<AnalysisTypeIcon className="size-5" />}
            rightIcon={<ChevronDown className="size-5" />}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            aria-label={`Select analysis type. Currently: ${analysisType === 'sector' ? 'Sector Analysis' : 'Stock Analysis'}`}
          >
            {analysisType === 'sector' ? 'Sector Analysis' : 'Stock Analysis'}
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              role="menu"
              className={cn(
                'absolute',
                'top-full',
                'mt-2',
                'left-0',
                'z-10',
                'rounded-md',
                'shadow-lg',
                'border border-neutral-200',
                'bg-white',
                'min-w-[200px]',
                'py-1'
              )}
            >
              <MenuItem
                leftIcon={Factory}
                leftText="Sector Analysis"
                onClick={() => handleAnalysisTypeSelect('sector')}
                selected={analysisType === 'sector'}
                paddingX="md"
              />
              <MenuItem
                leftIcon={Store}
                leftText="Stock Analysis"
                onClick={() => handleAnalysisTypeSelect('stock')}
                selected={analysisType === 'stock'}
                paddingX="md"
              />
            </div>
          )}
        </div>

        {/* Launch Button */}
        <Button
          variant="primary"
          rightIcon={<ChevronRight className="size-5" />}
          onClick={handleLaunch}
          disabled={!inputValue.trim()}
        >
          Launch Research
        </Button>
      </div>
    </div>
  );
}

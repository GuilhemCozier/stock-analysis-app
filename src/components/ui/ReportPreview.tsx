/**
 * Full-page height report preview container (Claude Artifacts-style).
 * Features TopBar with copy/close actions and formatted markdown body.
 * Used in: Analysis report viewing
 */

'use client';

import * as React from 'react';
import { X, Copy } from 'lucide-react';
import { TopBar } from './TopBar';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

export interface ReportPreviewProps {
  content: string;              // Markdown content to render
  onCopy?: () => void;          // Optional custom handler for copy button click
  onClose?: () => void;         // Handler for close button click
  className?: string;           // Additional Tailwind classes
}

/**
 * ReportPreview component - Full-page height report preview container
 * 
 * Layout:
 * - Vertical flex container with full viewport height
 * - TopBar at top with Copy and Close buttons
 * - Scrollable body area below with markdown content
 * 
 * Styling:
 * - Container: flex flex-col h-screen
 * - Body: flex-1 overflow-y-auto scroll-smooth
 * - Content padding: px-6 py-8 md:px-8 md:py-10
 * - Typography follows design system patterns
 */
export function ReportPreview({
  content,
  onCopy,
  onClose,
  className,
}: ReportPreviewProps) {
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className={cn('flex flex-col h-screen', className)}>
      {/* TopBar with action buttons */}
      <TopBar
        rightButtons={[
          {
            id: 'copy',
            children: copySuccess ? 'Copied!' : 'Copy',
            leftIcon: <Copy className="size-5" />,
            variant: 'outline',
            onClick: handleCopy,
          },
          {
            id: 'close',
            children: <X className="size-5" />,
            variant: 'ghost',
            'aria-label': 'Close preview',
            onClick: onClose,
          },
        ]}
      />

      {/* Scrollable body with markdown content */}
      <div className="flex-1 overflow-y-auto scroll-smooth bg-white px-6 py-8 md:px-8 md:py-10">
        <div className="prose prose-neutral max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }: { children?: React.ReactNode }) => (
                <h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }: { children?: React.ReactNode }) => (
                <h2 className="font-serif text-2xl font-semibold leading-tight text-neutral-900 mt-8 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }: { children?: React.ReactNode }) => (
                <h3 className="font-sans text-xl font-semibold leading-snug text-neutral-900 mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }: { children?: React.ReactNode }) => (
                <p className="font-serif text-md leading-relaxed text-neutral-900 mb-4">
                  {children}
                </p>
              ),
              a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
                <a
                  href={href}
                  className="text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors"
                >
                  {children}
                </a>
              ),
              ul: ({ children }: { children?: React.ReactNode }) => (
                <ul className="list-disc list-inside space-y-2 mb-4 font-serif text-md">
                  {children}
                </ul>
              ),
              ol: ({ children }: { children?: React.ReactNode }) => (
                <ol className="list-decimal list-inside space-y-2 mb-4 font-serif text-md">
                  {children}
                </ol>
              ),
              li: ({ children }: { children?: React.ReactNode }) => (
                <li className="text-neutral-900">{children}</li>
              ),
              strong: ({ children }: { children?: React.ReactNode }) => (
                <strong className="font-semibold text-neutral-900">{children}</strong>
              ),
              em: ({ children }: { children?: React.ReactNode }) => (
                <em className="italic text-neutral-900">{children}</em>
              ),
              code: ({ children }: { children?: React.ReactNode }) => (
                <code className="font-mono text-sm bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-900">
                  {children}
                </code>
              ),
              blockquote: ({ children }: { children?: React.ReactNode }) => (
                <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-700 my-4">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="border-t border-neutral-200 my-6" />
              ),
              table: ({ children }: { children?: React.ReactNode }) => (
                <div className="overflow-hidden rounded-[6px] border border-neutral-200 my-4">
                  <table className="w-full border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }: { children?: React.ReactNode }) => (
                <thead className="bg-neutral-50">{children}</thead>
              ),
              tbody: ({ children }: { children?: React.ReactNode }) => (
                <tbody>{children}</tbody>
              ),
              tr: ({ children }: { children?: React.ReactNode }) => (
                <tr className="border-b border-neutral-200 last:border-b-0">{children}</tr>
              ),
              th: ({ children }: { children?: React.ReactNode }) => (
                <th className="px-4 py-2 text-left font-semibold text-neutral-900 border-b border-neutral-200">
                  {children}
                </th>
              ),
              td: ({ children }: { children?: React.ReactNode }) => (
                <td className="px-4 py-2 text-neutral-900 font-serif text-md">
                  {children}
                </td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/**
 * StockSelectionPreview - Right panel for selecting which stocks to analyze for a sub-sector.
 * Similar layout to ReportPreview, but renders tiered StockSelectionCard grids.
 */

'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { TopBar } from './TopBar';
import { StockSelectionCard } from './StockSelectionCard';
import { cn } from '@/lib/utils';

export interface StockForSelection {
  id: string;
  companyName: string;
  ticker: string | null;
  rank: number;
  preliminaryNotes?: string | null;
  analysisStatus?: string | null;
}

export interface StockSelectionPreviewProps {
  subSectorRank: number;
  subSectorName: string;
  stocks: StockForSelection[];
  maxSelectable?: number; // default: 5
  mode?: 'selection' | 'pending';
  onLaunch?: (selectedStockIds: string[]) => void | Promise<void>;
  onClose: () => void;
  className?: string;
}

type Tier = 1 | 2 | 3;

function getTierForRank(rank: number): Tier {
  if (rank <= 2) return 1;
  if (rank <= 4) return 2;
  return 3;
}

export function StockSelectionPreview({
  subSectorRank,
  subSectorName,
  stocks,
  maxSelectable = 5,
  mode = 'selection',
  onLaunch,
  onClose,
  className,
}: StockSelectionPreviewProps) {
  const isSelectionMode = mode === 'selection';
  const totalSelectable = isSelectionMode ? Math.min(maxSelectable, stocks.length) : 0;

  const initialSelected = React.useMemo(() => {
    if (!isSelectionMode) return new Set<string>();
    // Default selection: first N by rank asc (up to maxSelectable)
    const sorted = [...stocks].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    return new Set(sorted.slice(0, totalSelectable).map((s) => s.id));
  }, [isSelectionMode, stocks, totalSelectable]);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(initialSelected);
  const [isLaunching, setIsLaunching] = React.useState(false);

  // If the stock list changes (new subsector), reset default selection.
  React.useEffect(() => {
    setSelectedIds(new Set(initialSelected));
  }, [initialSelected]);

  const selectedCount = selectedIds.size;

  const stocksByTier = React.useMemo(() => {
    const byTier: Record<Tier, StockForSelection[]> = { 1: [], 2: [], 3: [] };
    for (const stock of stocks) {
      byTier[getTierForRank(stock.rank ?? 999)].push(stock);
    }
    // Keep stable ordering by rank asc within each tier
    ([1, 2, 3] as Tier[]).forEach((tier) => {
      byTier[tier].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
    });
    return byTier;
  }, [stocks]);

  const handleToggleSelection = (stockId: string) => {
    if (!isSelectionMode) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(stockId)) {
        next.delete(stockId);
        return next;
      }
      // Enforce selection cap
      if (next.size >= totalSelectable) return next;
      next.add(stockId);
      return next;
    });
  };

  const handleLaunch = async () => {
    if (!onLaunch) return;
    setIsLaunching(true);
    try {
      await onLaunch(Array.from(selectedIds));
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className={cn('flex h-screen flex-col', className)}>
      <TopBar
        leftButtons={
          isSelectionMode
            ? [
                {
                  id: 'launch',
                  children: isLaunching ? 'Launching…' : 'Launch Research',
                  variant: 'outline',
                  onClick: handleLaunch,
                  disabled: isLaunching || selectedCount === 0 || !onLaunch,
                },
                {
                  id: 'close',
                  children: <X className="size-5" />,
                  variant: 'ghost',
                  'aria-label': 'Close preview',
                  onClick: isLaunching ? undefined : onClose,
                  disabled: isLaunching,
                },
              ]
            : [
                {
                  id: 'close',
                  children: <X className="size-5" />,
                  variant: 'ghost',
                  'aria-label': 'Close preview',
                  onClick: onClose,
                },
              ]
        }
      />

      <div className="flex-1 overflow-y-auto scroll-smooth bg-white px-6 py-8 md:px-8 md:py-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900">
              #{subSectorRank} {subSectorName}
            </h1>
            <p className="font-sans text-base text-neutral-600">
              {isSelectionMode
                ? `${selectedCount}/${totalSelectable} stocks selected for research`
                : `${stocks.length} pending stocks`}
            </p>
          </div>

          {/* Separator */}
          <div className="h-px w-full bg-neutral-200" />

          {/* Tiered stock grids */}
          {stocks.length === 0 ? (
            <p className="font-sans text-sm text-neutral-600">No stocks available for selection.</p>
          ) : (
            <div className="space-y-10">
              {([1, 2, 3] as Tier[]).map((tier) => {
                const tierStocks = stocksByTier[tier];
                if (tierStocks.length === 0) return null;
                return (
                  <section key={tier} className="space-y-4">
                    <h2 className="font-sans text-xl font-semibold text-neutral-900">Tier {tier}</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {tierStocks.map((stock) => (
                        <StockSelectionCard
                          key={stock.id}
                          companyName={stock.companyName}
                          symbol={stock.ticker ?? '—'}
                          description={
                            stock.preliminaryNotes?.trim()
                              ? stock.preliminaryNotes
                              : `Preliminary notes for ${stock.companyName}.`
                          }
                          isSelected={isSelectionMode ? selectedIds.has(stock.id) : false}
                          onToggleSelection={() => handleToggleSelection(stock.id)}
                          showCheckbox={isSelectionMode}
                          disabled={!isSelectionMode}
                          statusLabel={
                            !isSelectionMode
                              ? stock.analysisStatus === 'analyzing'
                                ? 'In analysis'
                                : stock.analysisStatus === 'pending'
                                  ? 'Pending'
                                  : 'Pending'
                              : undefined
                          }
                          statusTone={
                            !isSelectionMode
                              ? stock.analysisStatus === 'analyzing'
                                ? 'warning'
                                : 'neutral'
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


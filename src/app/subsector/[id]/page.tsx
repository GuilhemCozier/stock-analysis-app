'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Download } from 'lucide-react';
import Sidebar from '@/components/ui/Sidebar';
import { TopBar, type ButtonConfig } from '@/components/ui/TopBar';
import { Button } from '@/components/ui/Button';
import { StockReportSummary } from '@/components/ui/StockReportSummary';
import { ReportPreview } from '@/components/ui/ReportPreview';
import {
  StockSelectionPreview,
  type StockForSelection,
} from '@/components/ui/StockSelectionPreview';
import { cn } from '@/lib/utils';

type DeepAnalysis = {
  id: string;
  status: string;
  rawAnalysis: string;
  insights: unknown;
  createdAt: string;
  updatedAt: string;
};

type Stock = {
  id: string;
  companyName: string;
  ticker: string | null;
  rank: number;
  preliminaryNotes: string;
  deepAnalysis: DeepAnalysis | null;
};

type SubSectorStocksResponse = {
  id: string;
  name: string;
  summary: string;
  status: string;
  subSectorRank: number;
  sector: { id: string; name: string };
  stocks: Stock[];
};

function formatDurationMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function getInsightsNumber(insights: unknown, key: string): number | null {
  if (!insights || typeof insights !== 'object') return null;
  const value = (insights as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function getInsightsString(insights: unknown, key: string): string | null {
  if (!insights || typeof insights !== 'object') return null;
  const value = (insights as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : null;
}

export default function SubSectorStockAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [subSectorId, setSubSectorId] = React.useState<string | null>(null);
  const [data, setData] = React.useState<SubSectorStocksResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [showPendingStocks, setShowPendingStocks] = React.useState(false);
  const [showReportPreview, setShowReportPreview] = React.useState(false);
  const [activeReportContent, setActiveReportContent] = React.useState<string>('');

  React.useEffect(() => {
    params.then((resolved) => setSubSectorId(resolved.id));
  }, [params]);

  React.useEffect(() => {
    if (!subSectorId) return;
    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/subsector/${subSectorId}/stocks`);
        const json = await res.json();
        if (!json?.success) {
          setError(json?.error || 'Failed to fetch sub-sector');
          setData(null);
          return;
        }
        setData(json.data as SubSectorStocksResponse);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch sub-sector');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [subSectorId]);

  const breadcrumbButtons: ButtonConfig[] = React.useMemo(() => {
    const crumbs = [
      { label: 'All Sectors', href: '/' },
      { label: data?.sector?.name ?? 'Loading...', href: data ? `/analysis/${data.sector.id}` : '/' },
      { label: `${data?.name ?? 'Sub-sector'} Report`, href: subSectorId ? `/subsector/${subSectorId}` : '/' },
    ];

    return crumbs.flatMap((crumb, index) => {
      const isLast = index === crumbs.length - 1;
      const buttons: ButtonConfig[] = [
        {
          id: `breadcrumb-${index}`,
          children: crumb.label,
          variant: 'ghost',
          onClick: isLast ? undefined : () => router.push(crumb.href),
          disabled: isLast,
          'aria-label': isLast ? 'Current page' : `Navigate to ${crumb.label}`,
        },
      ];

      if (!isLast) {
        buttons.push({
          id: `separator-${index}`,
          children: <ChevronRight className="size-4 text-neutral-400" aria-hidden="true" />,
          variant: 'ghost',
          disabled: true,
        });
      }
      return buttons;
    });
  }, [data, router, subSectorId]);

  const actionButtons: ButtonConfig[] = React.useMemo(() => {
    return [
      {
        id: 'export',
        children: 'Export Report',
        leftIcon: <Download className="size-5" />,
        variant: 'outline',
        onClick: () => console.log('Export report (todo)'),
      },
    ];
  }, []);

  const analysedStocks = React.useMemo(() => {
    const stocks = data?.stocks ?? [];
    return stocks
      .filter((s) => s.deepAnalysis?.status === 'completed')
      .sort((a, b) => a.rank - b.rank);
  }, [data?.stocks]);

  const inAnalysisCount = React.useMemo(() => {
    const stocks = data?.stocks ?? [];
    return stocks.filter((s) => {
      return s.deepAnalysis?.status === 'analyzing';
    }).length;
  }, [data?.stocks]);

  const analysedCount = analysedStocks.length;

  const pendingStocksForPanel = React.useMemo(() => {
    const stocks = data?.stocks ?? [];
    return stocks
      .filter((s) => {
        const st = s.deepAnalysis?.status ?? null;
        return st === null || st === 'pending' || st === 'analyzing';
      })
      .map(
        (s) =>
          ({
            id: s.id,
            companyName: s.companyName,
            ticker: s.ticker,
            rank: s.rank,
            preliminaryNotes: s.preliminaryNotes,
            analysisStatus: s.deepAnalysis?.status ?? null,
          }) satisfies StockForSelection
      )
      .sort((a, b) => a.rank - b.rank);
  }, [data?.stocks]);

  const handleOpenPendingStocks = () => {
    setShowReportPreview(false);
    setActiveReportContent('');
    setShowPendingStocks(true);
  };

  const handleClosePendingStocks = () => setShowPendingStocks(false);

  const handleReadStockReport = (stock: Stock) => {
    setShowPendingStocks(false);
    setActiveReportContent(stock.deepAnalysis?.rawAnalysis || 'No report available yet.');
    setShowReportPreview(true);
  };

  const handleCloseReportPreview = () => {
    setShowReportPreview(false);
    setActiveReportContent('');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar forceCollapsed={showPendingStocks || showReportPreview} />
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary" />
              <p className="font-sans text-base text-neutral-600">Loading sub-sector…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar forceCollapsed={showPendingStocks || showReportPreview} />
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <p className="font-sans text-lg font-semibold text-error">
                {error || 'Sub-sector not found'}
              </p>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Return to home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar forceCollapsed={showPendingStocks || showReportPreview} />

      <main className={cn('flex-1 px-4 py-8 md:px-8 md:py-12')}>
        <nav aria-label="Breadcrumb">
          <TopBar leftButtons={breadcrumbButtons} rightButtons={actionButtons} />
        </nav>

        <div className="mt-6 space-y-6">
          {/* 1) Title */}
          <h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900">
            #{data.subSectorRank} {data.name} Report
          </h1>

          {/* 2) Horizontal stack */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-sans text-base text-neutral-600">
              {analysedCount} analysed · {inAnalysisCount} in analysis{inAnalysisCount > 0 ? '…' : ''}
            </span>
            <Button
              variant="ghost"
              rightIcon={<ChevronRight className="size-5" />}
              onClick={handleOpenPendingStocks}
            >
              Pending stocks
            </Button>
          </div>

          {/* 3) StockReportSummary list */}
          <div className="space-y-10">
            {analysedStocks.map((stock) => {
              const insights = stock.deepAnalysis?.insights ?? null;
              const targetPrice = getInsightsNumber(insights, 'targetPrice') ?? 150;
              const recommendation = getInsightsString(insights, 'recommendation') ?? 'Hold';

              const createdAt = stock.deepAnalysis?.createdAt
                ? new Date(stock.deepAnalysis.createdAt)
                : null;
              const updatedAt = stock.deepAnalysis?.updatedAt
                ? new Date(stock.deepAnalysis.updatedAt)
                : null;
              const duration =
                createdAt && updatedAt
                  ? formatDurationMs(Math.max(0, updatedAt.getTime() - createdAt.getTime()))
                  : '—';

              const priceAtAnalysis = Math.max(1, Math.round(targetPrice / 1.5));

              return (
                <StockReportSummary
                  key={stock.id}
                  rank={stock.rank}
                  companyName={stock.companyName}
                  conservative5yTarget={targetPrice}
                  priceAtAnalysis={priceAtAnalysis}
                  actionAtAnalysis={recommendation}
                  researchStatus="Research complete"
                  sourcesCount={0}
                  duration={duration}
                  onReadReport={() => handleReadStockReport(stock)}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Pending stocks panel */}
      {showPendingStocks && (
        <div className="w-full flex-shrink-0 border-l border-neutral-200 md:w-1/2 lg:w-2/5">
          <StockSelectionPreview
            mode="pending"
            subSectorRank={data.subSectorRank}
            subSectorName={data.name}
            stocks={pendingStocksForPanel}
            onClose={handleClosePendingStocks}
          />
        </div>
      )}

      {/* Report preview panel */}
      {showReportPreview && (
        <div className="w-full flex-shrink-0 border-l border-neutral-200 md:w-1/2 lg:w-2/5">
          <ReportPreview content={activeReportContent} onClose={handleCloseReportPreview} />
        </div>
      )}
    </div>
  );
}


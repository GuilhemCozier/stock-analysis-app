'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Download } from 'lucide-react';
import Sidebar from '@/components/ui/Sidebar';
import { TopBar, type ButtonConfig } from '@/components/ui/TopBar';
import { ResearchStatus } from '@/components/ui/ResearchStatus';
import { SectorReportSummary } from '@/components/ui/SectorReportSummary';
import { ReportPreview } from '@/components/ui/ReportPreview';
import {
  StockSelectionPreview,
  type StockForSelection,
} from '@/components/ui/StockSelectionPreview';
import type { RecentAnalysis } from '@/components/ui/Sidebar';
import { mockSectorAnalysis, mockRecentAnalyses } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface SectorAnalysisData {
  id: string;
  sectorName: string;
  status: string;
  fullReport: string;
  subSectors: Array<{
    id: string;
    name: string;
    summary: string;
    longDescription?: string;
    status: string;
    stocks: Array<{
      id: string;
      companyName: string;
      ticker: string | null;
      rank: number;
      preliminaryNotes?: string | null;
    }>;
    createdAt: string;
  }>;
  jobs?: Array<{
    id: string;
    jobType: string;
    status: string;
    progress: number;
    errorMessage: string | null;
    relatedId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function SectorAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [analysisId, setAnalysisId] = React.useState<string | null>(null);
  const [analysisData, setAnalysisData] = React.useState<SectorAnalysisData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = React.useState<RecentAnalysis[]>([]);
  const [showReportPreview, setShowReportPreview] = React.useState(false);
  const [showStockSelectionPreview, setShowStockSelectionPreview] = React.useState(false);
  const [activeSubSector, setActiveSubSector] = React.useState<{
    id: string;
    rank: number;
    name: string;
  } | null>(null);
  const [subSectorStocks, setSubSectorStocks] = React.useState<StockForSelection[]>([]);
  const [isLoadingSubSectorStocks, setIsLoadingSubSectorStocks] = React.useState(false);
  const [subSectorStocksError, setSubSectorStocksError] = React.useState<string | null>(null);

  // Resolve params
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setAnalysisId(resolvedParams.id);
    });
  }, [params]);

  // Fetch analysis data
  React.useEffect(() => {
    if (!analysisId) return;

    // Use mock data for demo
    if (analysisId === 'demo') {
      setAnalysisData(mockSectorAnalysis);
      // Transform mock data to match RecentAnalysis type
      setRecentAnalyses(
        mockRecentAnalyses.map((item) => ({
          id: item.id,
          name: item.title,
          type: 'sector' as const,
          createdAt: new Date(), // Mock date
        }))
      );
      setIsLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/sector/${analysisId}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to fetch analysis');
          return;
        }

        setAnalysisData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId]);

  // TODO: Fetch recent analyses from API
  // For now, we'll leave it empty

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleReadFullReport = () => {
    // Keep previews mutually exclusive
    setShowStockSelectionPreview(false);
    setActiveSubSector(null);
    setShowReportPreview(true);
  };

  const handleCloseReportPreview = () => {
    setShowReportPreview(false);
  };

  const handleCloseStockSelectionPreview = () => {
    setShowStockSelectionPreview(false);
    setActiveSubSector(null);
    setSubSectorStocks([]);
    setSubSectorStocksError(null);
  };

  const fetchSubSectorStocks = React.useCallback(
    async (subSectorId: string) => {
      if (!analysisData || !analysisId) return;
      setIsLoadingSubSectorStocks(true);
      setSubSectorStocksError(null);
      try {
        // Demo path uses in-memory data
        if (analysisId === 'demo') {
          const sub = (analysisData as unknown as typeof mockSectorAnalysis).subSectors.find(
            (s) => s.id === subSectorId
          );
          const stocks = (sub?.stocks ?? []).map((s) => ({
            id: s.id,
            companyName: s.companyName,
            ticker: s.ticker ?? null,
            rank: s.rank,
            preliminaryNotes: null,
          })) satisfies StockForSelection[];
          setSubSectorStocks(stocks);
          return;
        }

        const response = await fetch(`/api/subsector/${subSectorId}/stocks`);
        const result = await response.json();
        if (!result.success) {
          setSubSectorStocksError(result.error || 'Failed to fetch subsector stocks');
          setSubSectorStocks([]);
          return;
        }

        const stocks = (result.data?.stocks ?? []) as StockForSelection[];
        setSubSectorStocks(stocks);
      } catch (err) {
        setSubSectorStocksError(err instanceof Error ? err.message : 'Failed to fetch subsector stocks');
        setSubSectorStocks([]);
      } finally {
        setIsLoadingSubSectorStocks(false);
      }
    },
    [analysisData, analysisId]
  );

  const handlePrepareResearch = React.useCallback(
    async (subSectorId: string) => {
      if (!analysisData) return;

      const sub = analysisData.subSectors.find((s) => s.id === subSectorId);
      if (!sub) return;

      // Keep previews mutually exclusive
      setShowReportPreview(false);

      setActiveSubSector({
        id: sub.id,
        rank: analysisData.subSectors.indexOf(sub) + 1,
        name: sub.name,
      });
      setShowStockSelectionPreview(true);
      await fetchSubSectorStocks(subSectorId);
    },
    [analysisData, fetchSubSectorStocks]
  );

  const handleLaunchSubSectorResearch = React.useCallback(
    async (selectedStockIds: string[]) => {
      if (!activeSubSector?.id) return;

      try {
        // Demo: just close (no backend job)
        if (analysisId === 'demo') {
          console.log('Launching subsector research (demo):', activeSubSector.id, selectedStockIds);
          handleCloseStockSelectionPreview();
          return;
        }

        const response = await fetch(`/api/subsector/${activeSubSector.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedStockIds }),
        });
        const result = await response.json();
        if (!result.success) {
          setSubSectorStocksError(result.error || 'Failed to launch research');
          return;
        }

        // Close panel and refresh page data
        handleCloseStockSelectionPreview();
        setAnalysisData(null);
        setIsLoading(true);
        const refresh = await fetch(`/api/sector/${analysisId}`);
        const refreshed = await refresh.json();
        if (refreshed.success) setAnalysisData(refreshed.data);
      } catch (err) {
        setSubSectorStocksError(err instanceof Error ? err.message : 'Failed to launch research');
      } finally {
        setIsLoading(false);
      }
    },
    [activeSubSector?.id, analysisId]
  );

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export report');
  };

  // Build breadcrumb navigation
  const breadcrumbButtons: ButtonConfig[] = React.useMemo(() => {
    const breadcrumbs = [
      {
        label: 'All Sectors',
        href: '/',
      },
      {
        label: analysisData?.sectorName || 'Loading...',
        href: `/sector/${analysisId}`,
      },
    ];

    return breadcrumbs.flatMap((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
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

      // Add chevron separator after each button except the last
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
  }, [analysisData?.sectorName, analysisId, router]);

  // Build action buttons
  const actionButtons: ButtonConfig[] = React.useMemo(() => {
    return [
      {
        id: 'export',
        children: 'Export Report',
        leftIcon: <Download className="size-5" />,
        variant: 'outline',
        onClick: handleExport,
      },
    ];
  }, []);

  // Calculate research status props from analysis data
  const researchStatusProps = React.useMemo(() => {
    if (!analysisData) return null;

    // Find the most recent sector research job
    const sectorResearchJob = analysisData.jobs?.find(
      (job) => job.jobType === 'sector_research'
    );

    // Determine stage based on status
    let stage = 'Initiating Research';
    if (analysisData.status === 'completed') {
      stage = 'Research Complete';
    } else if (analysisData.status === 'in_progress') {
      stage = sectorResearchJob?.status === 'writing' 
        ? 'Writing Report' 
        : 'Initiating Research';
    } else if (analysisData.status === 'error') {
      stage = `Error: ${sectorResearchJob?.errorMessage || 'A problem has occurred'}`;
    }

    // Calculate duration
    const createdAt = new Date(analysisData.createdAt);
    const updatedAt = new Date(analysisData.updatedAt);
    const durationMs = updatedAt.getTime() - createdAt.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    // Get sources count from job progress (if available)
    const sourcesCount = sectorResearchJob?.progress || undefined;

    return {
      stage,
      sourcesCount: sourcesCount && sourcesCount > 0 ? sourcesCount : undefined,
      duration,
    };
  }, [analysisData]);

  // Map sub-sectors for SectorReportSummary
  const subSectorsForSummary = React.useMemo(() => {
    if (!analysisData?.subSectors) return [];

    return analysisData.subSectors.map((subSector) => {
      // Map status from database to component status
      const statusMap: Record<string, 'pending' | 'initiated' | 'analyzing' | 'writing' | 'auditing' | 'completed'> = {
        pending: 'pending',
        initiated: 'initiated',
        analyzing: 'analyzing',
        writing: 'writing',
        auditing: 'auditing',
        completed: 'completed',
      };

      // Find related job for progress tracking
      const relatedJob = analysisData.jobs?.find(
        (job) => job.relatedId === subSector.id
      );

      return {
        id: subSector.id,
        rank: analysisData.subSectors.indexOf(subSector) + 1,
        name: subSector.name,
        stockCount: subSector.stocks.length,
        description: subSector.summary,
        longDescription: subSector.longDescription,
        status: statusMap[subSector.status] || 'pending',
        progress: relatedJob?.progress,
      };
    });
  }, [analysisData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar recentAnalyses={recentAnalyses} onNavigate={handleNavigate} />
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary mx-auto mb-4" />
              <p className="font-sans text-base text-neutral-600">Loading analysis...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex min-h-screen">
        <Sidebar recentAnalyses={recentAnalyses} onNavigate={handleNavigate} />
        <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="font-sans text-lg font-semibold text-error mb-2">
                {error || 'Analysis not found'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="font-sans text-base text-primary hover:underline"
              >
                Return to home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Collapse when ReportPreview is open */}
      <Sidebar 
        recentAnalyses={recentAnalyses} 
        onNavigate={handleNavigate}
        forceCollapsed={showReportPreview || showStockSelectionPreview}
      />

      {/* Main Content */}
      <main className={cn(
        'px-4 py-8 md:px-8 md:py-12',
        showReportPreview ? 'flex-1' : 'flex-1'
      )}>
        {/* TopBar with Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <TopBar leftButtons={breadcrumbButtons} rightButtons={actionButtons} />
        </nav>

        {/* Content Stack */}
        <div className="mt-6 space-y-6">
          {/* ResearchStatus */}
          {researchStatusProps && (
            <ResearchStatus
              stage={researchStatusProps.stage}
              sourcesCount={researchStatusProps.sourcesCount}
              duration={researchStatusProps.duration}
            />
          )}

          {/* SectorReportSummary - Show if we have sub-sectors or completed report */}
          {(analysisData.status === 'completed' || subSectorsForSummary.length > 0) && (
            <SectorReportSummary
              title={analysisData.sectorName}
              summary={
                analysisData.fullReport || 
                (analysisData.status === 'in_progress' 
                  ? 'Analysis in progress. Sub-sectors are being identified...' 
                  : 'No summary available.')
              }
              onReadFullReport={handleReadFullReport}
              onPrepareResearch={handlePrepareResearch}
              subSectors={subSectorsForSummary}
            />
          )}
        </div>
      </main>

      {/* ReportPreview - Show on the right when open */}
      {showReportPreview && analysisData?.fullReport && (
        <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5 border-l border-neutral-200">
          <ReportPreview
            content={analysisData.fullReport}
            onClose={handleCloseReportPreview}
          />
        </div>
      )}

      {/* StockSelectionPreview - Show on the right when open */}
      {showStockSelectionPreview && activeSubSector && (
        <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5 border-l border-neutral-200">
          {isLoadingSubSectorStocks ? (
            <div className="flex h-screen items-center justify-center bg-white">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary mx-auto mb-4" />
                <p className="font-sans text-base text-neutral-600">Loading stocks…</p>
              </div>
            </div>
          ) : subSectorStocksError ? (
            <div className="flex h-screen items-center justify-center bg-white px-6">
              <div className="text-center space-y-3">
                <p className="font-sans text-base font-semibold text-error">{subSectorStocksError}</p>
                <button
                  onClick={() => fetchSubSectorStocks(activeSubSector.id)}
                  className="font-sans text-base text-primary hover:underline"
                >
                  Retry
                </button>
                <button
                  onClick={handleCloseStockSelectionPreview}
                  className="block mx-auto font-sans text-sm text-neutral-600 hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <StockSelectionPreview
              subSectorRank={activeSubSector.rank}
              subSectorName={activeSubSector.name}
              stocks={subSectorStocks}
              onLaunch={handleLaunchSubSectorResearch}
              onClose={handleCloseStockSelectionPreview}
            />
          )}
        </div>
      )}
    </div>
  );
}

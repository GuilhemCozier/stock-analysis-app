'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Download } from 'lucide-react';
import Sidebar from '@/components/ui/Sidebar';
import { TopBar, type ButtonConfig } from '@/components/ui/TopBar';
import { ResearchStatus } from '@/components/ui/ResearchStatus';
import { SectorReportSummary } from '@/components/ui/SectorReportSummary';
import type { RecentAnalysis } from '@/components/ui/Sidebar';

interface SectorAnalysisData {
  id: string;
  sectorName: string;
  status: string;
  fullReport: string;
  subSectors: Array<{
    id: string;
    name: string;
    summary: string;
    status: string;
    stocks: Array<{
      id: string;
      companyName: string;
      ticker: string | null;
      rank: number;
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

  // Resolve params
  React.useEffect(() => {
    params.then((resolvedParams) => {
      setAnalysisId(resolvedParams.id);
    });
  }, [params]);

  // Fetch analysis data
  React.useEffect(() => {
    if (!analysisId) return;

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analysis/${analysisId}`);
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
    // TODO: Navigate to full report view or open modal
    console.log('Read full report');
  };

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
        href: `/analysis/${analysisId}`,
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
      {/* Sidebar */}
      <Sidebar recentAnalyses={recentAnalyses} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
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
              subSectors={subSectorsForSummary}
            />
          )}
        </div>
      </main>
    </div>
  );
}

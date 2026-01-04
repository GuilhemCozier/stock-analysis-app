import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { FormatInsightsJobData } from '../types';
import {
  markJobActive,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
} from '../jobStatus';
import { classifyError, formatErrorMessage } from '../errorHandling';

interface FormattedInsights {
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  targetPrice?: number;
  keyMetrics: {
    label: string;
    value: string | number;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }[];
  opportunities: string[];
  risks: string[];
  catalysts: string[];
  summary: string;
}

/**
 * Process format insights job
 * This worker formats the approved analysis into structured JSON insights
 */
async function processFormatInsights(job: Job<FormatInsightsJobData>) {
  const { stockAnalysisId, rawAnalysis, judgeReview, companyName } = job.data;

  try {
    // Mark job as active
    await markJobActive(job.id!, 0);

    // Progress: 20% - Starting formatting
    await updateJobProgress(job.id!, 20);
    await job.updateProgress(20);

    // TODO: Call AI service to format insights into structured JSON
    // This will be implemented in Phase 3
    // const formattedInsights = await formatToJson({
    //   rawAnalysis,
    //   judgeReview,
    //   companyName,
    // });

    // Mock formatted insights
    const mockInsights: FormattedInsights = {
      recommendation: 'Buy',
      targetPrice: 150.0,
      keyMetrics: [
        { label: 'P/E Ratio', value: 18.5, sentiment: 'positive' },
        { label: 'Revenue Growth (YoY)', value: '23%', sentiment: 'positive' },
        { label: 'Profit Margin', value: '15.2%', sentiment: 'neutral' },
        { label: 'Debt/Equity', value: 0.45, sentiment: 'positive' },
      ],
      opportunities: [
        'Expanding into emerging markets with strong demand',
        'New product line launching Q3 2026',
        'Strategic partnerships with industry leaders',
      ],
      risks: [
        'Regulatory uncertainty in key markets',
        'Increasing competition from new entrants',
        'Supply chain vulnerabilities',
      ],
      catalysts: [
        'Q2 earnings report (expected strong results)',
        'FDA approval decision (pending)',
        'Annual investor day presentation',
      ],
      summary: `${companyName} demonstrates strong fundamentals with impressive revenue growth and expanding market presence. The company is well-positioned to capitalize on industry trends, though investors should monitor regulatory developments.`,
    };

    // Progress: 70% - Formatting completed, saving
    await updateJobProgress(job.id!, 70);
    await job.updateProgress(70);

    // Save formatted insights
    await prisma.stockAnalysis.update({
      where: { id: stockAnalysisId },
      data: {
        insights: mockInsights as any, // Prisma Json type
        status: 'completed',
      },
    });

    // Progress: 90% - Checking if subsector is complete
    await updateJobProgress(job.id!, 90);
    await job.updateProgress(90);

    // Check if all stocks in the subsector are completed
    const stockAnalysis = await prisma.stockAnalysis.findUnique({
      where: { id: stockAnalysisId },
      include: {
        stock: {
          include: {
            subSector: {
              include: {
                stocks: {
                  include: {
                    deepAnalysis: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (stockAnalysis?.stock.subSector) {
      const subSector = stockAnalysis.stock.subSector;
      const topStocks = subSector.stocks
        .filter((s) => s.rank <= 5)
        .sort((a, b) => a.rank - b.rank);

      const allCompleted = topStocks.every(
        (stock) => stock.deepAnalysis?.status === 'completed'
      );

      if (allCompleted) {
        // All top 5 stocks are analyzed - mark subsector as completed
        await prisma.subSector.update({
          where: { id: subSector.id },
          data: { status: 'completed' },
        });

        console.log(`✓ SubSector ${subSector.name} completed - all top 5 stocks analyzed`);
      }
    }

    await markJobCompleted(job.id!);

    return {
      success: true,
      stockAnalysisId,
      insights: mockInsights,
    };
  } catch (error) {
    const jobError = classifyError(error);
    const errorMessage = formatErrorMessage(
      error,
      `Format insights failed for ${companyName}`
    );

    // Update stock analysis status
    await prisma.stockAnalysis.update({
      where: { id: stockAnalysisId },
      data: {
        status: 'review_failed',
        failureReason: errorMessage,
      },
    });

    await markJobFailed(job.id!, errorMessage);

    // Re-throw for BullMQ to handle retries
    throw new Error(errorMessage);
  }
}

// Create worker
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const formatInsightsWorker = new Worker<FormatInsightsJobData>(
  'format-insights',
  processFormatInsights,
  {
    connection: redisConnection,
    concurrency: 10, // Process many formatting jobs in parallel
    limiter: {
      max: 20, // Max 20 jobs
      duration: 60000, // Per minute
    },
  }
);

// Worker event handlers
formatInsightsWorker.on('completed', (job) => {
  console.log(`✓ Format insights job ${job.id} completed for ${job.data.companyName}`);
});

formatInsightsWorker.on('failed', (job, error) => {
  console.error(
    `✗ Format insights job ${job?.id} failed for ${job?.data.companyName}:`,
    error.message
  );
});

formatInsightsWorker.on('error', (error) => {
  console.error('Format insights worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await formatInsightsWorker.close();
});

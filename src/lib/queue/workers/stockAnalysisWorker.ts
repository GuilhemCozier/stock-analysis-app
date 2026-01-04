import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { StockAnalysisJobData } from '../types';
import {
  markJobActive,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
} from '../jobStatus';
import { classifyError, formatErrorMessage } from '../errorHandling';
import { judgeReviewQueue } from '../config';

/**
 * Process stock analysis job
 * This worker performs deep AI research on a stock (7-10 min)
 * and queues judge review
 */
async function processStockAnalysis(job: Job<StockAnalysisJobData>) {
  const {
    stockId,
    stockAnalysisId,
    companyName,
    ticker,
    subSectorName,
    attemptNumber,
  } = job.data;

  try {
    // Mark job as active
    await markJobActive(job.id!, 0);

    // Update stock analysis status
    await prisma.stockAnalysis.update({
      where: { id: stockAnalysisId },
      data: {
        status: 'analyzing',
        attemptCount: attemptNumber,
      },
    });

    // Progress: 10% - Starting deep research
    await updateJobProgress(job.id!, 10);
    await job.updateProgress(10);

    // TODO: Call AI service to perform deep stock analysis
    // This will be implemented in Phase 3
    // const aiAnalysis = await analyzeStock({
    //   companyName,
    //   ticker,
    //   subSectorName,
    //   attemptNumber,
    // });

    // Mock AI analysis (7-10 pages of deep analysis)
    const mockRawAnalysis = `
Deep Analysis of ${companyName} (${ticker || 'N/A'})
Attempt: ${attemptNumber}

This is a placeholder for the AI-generated deep stock analysis.
In production, this would be a comprehensive 7-10 page report including:
- Company overview and business model
- Financial analysis
- Competitive positioning
- Growth opportunities
- Risk factors
- Valuation assessment
- Investment thesis
`;

    // Progress: 80% - Analysis completed, saving
    await updateJobProgress(job.id!, 80);
    await job.updateProgress(80);

    // Save raw analysis
    await prisma.stockAnalysis.update({
      where: { id: stockAnalysisId },
      data: {
        rawAnalysis: mockRawAnalysis,
      },
    });

    // Progress: 90% - Queuing judge review
    await updateJobProgress(job.id!, 90);
    await job.updateProgress(90);

    // Queue judge review job
    const judgeJob = await judgeReviewQueue.add(
      'judge-review',
      {
        stockAnalysisId,
        stockId,
        rawAnalysis: mockRawAnalysis,
        companyName,
        attemptNumber,
      },
      {
        jobId: `judge-${stockAnalysisId}-${attemptNumber}`,
      }
    );

    console.log(`→ Queued judge review job ${judgeJob.id} for ${companyName}`);

    // Mark job as completed (judge review will continue the flow)
    await markJobCompleted(job.id!);

    return {
      success: true,
      stockAnalysisId,
      judgeJobId: judgeJob.id,
    };
  } catch (error) {
    const jobError = classifyError(error);
    const errorMessage = formatErrorMessage(
      error,
      `Stock analysis failed for ${companyName}`
    );

    // Update stock analysis with failure
    await prisma.stockAnalysis.update({
      where: { id: stockAnalysisId },
      data: {
        status: 'review_failed',
        failureReason: errorMessage,
      },
    });

    await markJobFailed(job.id!, errorMessage);

    // Note: We don't automatically retry stock analysis
    // Manual retry with variation is required (as per architecture)
    throw new Error(errorMessage);
  }
}

// Create worker
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const stockAnalysisWorker = new Worker<StockAnalysisJobData>(
  'stock-analysis',
  processStockAnalysis,
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 stock analyses in parallel
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // Per minute
    },
  }
);

// Worker event handlers
stockAnalysisWorker.on('completed', (job) => {
  console.log(`✓ Stock analysis job ${job.id} completed for ${job.data.companyName}`);
});

stockAnalysisWorker.on('failed', (job, error) => {
  console.error(
    `✗ Stock analysis job ${job?.id} failed for ${job?.data.companyName}:`,
    error.message
  );
});

stockAnalysisWorker.on('error', (error) => {
  console.error('Stock analysis worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await stockAnalysisWorker.close();
});

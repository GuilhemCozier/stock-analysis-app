import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { StockRankingJobData } from '../types';
import {
  markJobActive,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
} from '../jobStatus';
import { classifyError, formatErrorMessage } from '../errorHandling';
import { stockAnalysisQueue } from '../config';

/**
 * Process stock ranking job
 * This worker ranks stocks 1-10 within a sub-sector
 * and queues analysis jobs for the top 5 stocks
 */
async function processStockRanking(job: Job<StockRankingJobData>) {
  const { subSectorId, stocks } = job.data;

  try {
    // Mark job as active
    await markJobActive(job.id!, 0);

    // Update subsector status
    await prisma.subSector.update({
      where: { id: subSectorId },
      data: { status: 'analyzing' },
    });

    // Progress: 20% - Starting ranking
    await updateJobProgress(job.id!, 20);
    await job.updateProgress(20);

    // TODO: Call AI service to rank stocks
    // This will be implemented in Phase 3
    // const rankedStocks = await rankStocks({
    //   stocks,
    //   subSectorId,
    // });

    // Mock ranking - just assign sequential ranks for now
    const rankedStocks = stocks.map((stock, index) => ({
      ...stock,
      rank: index + 1,
    }));

    // Progress: 60% - Ranking completed, updating database
    await updateJobProgress(job.id!, 60);
    await job.updateProgress(60);

    // Update stock ranks in database
    for (const stock of rankedStocks) {
      await prisma.stock.update({
        where: { id: stock.id },
        data: { rank: stock.rank },
      });
    }

    // Progress: 70% - Creating analysis records for top 5
    await updateJobProgress(job.id!, 70);
    await job.updateProgress(70);

    // Get top 5 stocks for deep analysis
    const top5Stocks = rankedStocks.slice(0, 5);

    // Create StockAnalysis records for top 5 stocks
    const analysisPromises = top5Stocks.map(async (stock) => {
      return await prisma.stockAnalysis.create({
        data: {
          stockId: stock.id,
          status: 'pending',
          rawAnalysis: '',
          judgeReview: '',
          insights: {},
          attemptCount: 1,
        },
      });
    });

    const stockAnalyses = await Promise.all(analysisPromises);

    // Progress: 80% - Queuing stock analysis jobs
    await updateJobProgress(job.id!, 80);
    await job.updateProgress(80);

    // Get subsector name for job data
    const subSector = await prisma.subSector.findUnique({
      where: { id: subSectorId },
      select: { name: true },
    });

    // Queue stock analysis jobs for top 5 stocks
    const jobPromises = top5Stocks.map(async (stock, index) => {
      const analysis = stockAnalyses[index];

      return await stockAnalysisQueue.add(
        'stock-analysis',
        {
          stockId: stock.id,
          stockAnalysisId: analysis.id,
          companyName: stock.companyName,
          ticker: stock.ticker,
          subSectorName: subSector?.name || 'Unknown',
          attemptNumber: 1,
        },
        {
          jobId: `stock-${analysis.id}-attempt-1`,
          priority: stock.rank, // Higher rank = higher priority (lower number)
        }
      );
    });

    const queuedJobs = await Promise.all(jobPromises);

    console.log(
      `→ Queued ${queuedJobs.length} stock analysis jobs for top 5 stocks in subsector`
    );

    // Progress: 100% - Completed
    await updateJobProgress(job.id!, 100);
    await job.updateProgress(100);

    await markJobCompleted(job.id!);

    return {
      success: true,
      subSectorId,
      totalStocks: stocks.length,
      analysisJobsQueued: queuedJobs.length,
      jobIds: queuedJobs.map((j) => j.id),
    };
  } catch (error) {
    const jobError = classifyError(error);
    const errorMessage = formatErrorMessage(error, 'Stock ranking failed');

    // Update subsector status
    await prisma.subSector.update({
      where: { id: subSectorId },
      data: { status: 'pending' }, // Reset to pending on failure
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

export const stockRankingWorker = new Worker<StockRankingJobData>(
  'stock-ranking',
  processStockRanking,
  {
    connection: redisConnection,
    concurrency: 3, // Process a few ranking jobs in parallel
    limiter: {
      max: 5, // Max 5 jobs
      duration: 60000, // Per minute
    },
  }
);

// Worker event handlers
stockRankingWorker.on('completed', (job) => {
  console.log(`✓ Stock ranking job ${job.id} completed for subsector ${job.data.subSectorId}`);
});

stockRankingWorker.on('failed', (job, error) => {
  console.error(
    `✗ Stock ranking job ${job?.id} failed for subsector ${job?.data.subSectorId}:`,
    error.message
  );
});

stockRankingWorker.on('error', (error) => {
  console.error('Stock ranking worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await stockRankingWorker.close();
});

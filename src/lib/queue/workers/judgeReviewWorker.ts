import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { JudgeReviewJobData, ErrorType } from '../types';
import {
  markJobActive,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
} from '../jobStatus';
import { classifyError, formatErrorMessage } from '../errorHandling';
import { formatInsightsQueue, stockAnalysisQueue } from '../config';

const MAX_RETRY_ATTEMPTS = 3;

/**
 * Process judge review job
 * The judge AI evaluates the quality of the stock analysis
 * and either approves it or rejects it for retry
 */
async function processJudgeReview(job: Job<JudgeReviewJobData>) {
  const { stockAnalysisId, stockId, rawAnalysis, companyName, attemptNumber } =
    job.data;

  try {
    // Mark job as active
    await markJobActive(job.id!, 0);

    // Progress: 20% - Starting judge review
    await updateJobProgress(job.id!, 20);
    await job.updateProgress(20);

    // TODO: Call AI judge to review the analysis
    // This will be implemented in Phase 3
    // const judgeResult = await judgeAnalysis({
    //   rawAnalysis,
    //   companyName,
    // });

    // Mock judge review - randomly approve/reject for testing
    const mockApproved = Math.random() > 0.3; // 70% approval rate
    const mockJudgeReview = mockApproved
      ? `APPROVED: The analysis for ${companyName} is comprehensive and well-researched.`
      : `REJECTED: The analysis for ${companyName} lacks depth in financial analysis. Please retry with more focus on valuation metrics.`;

    // Progress: 70% - Judge review completed
    await updateJobProgress(job.id!, 70);
    await job.updateProgress(70);

    // Save judge review
    await prisma.stockAnalysis.update({
      where: { id: stockAnalysisId },
      data: {
        judgeReview: mockJudgeReview,
      },
    });

    if (mockApproved) {
      // APPROVED: Queue format insights job
      console.log(`✓ Judge approved analysis for ${companyName}`);

      await updateJobProgress(job.id!, 90);
      await job.updateProgress(90);

      const formatJob = await formatInsightsQueue.add(
        'format-insights',
        {
          stockAnalysisId,
          rawAnalysis,
          judgeReview: mockJudgeReview,
          companyName,
        },
        {
          jobId: `format-${stockAnalysisId}`,
        }
      );

      console.log(`→ Queued format insights job ${formatJob.id} for ${companyName}`);

      await markJobCompleted(job.id!);

      return {
        success: true,
        approved: true,
        formatJobId: formatJob.id,
      };
    } else {
      // REJECTED: Check if we should retry
      console.log(
        `✗ Judge rejected analysis for ${companyName} (attempt ${attemptNumber}/${MAX_RETRY_ATTEMPTS})`
      );

      if (attemptNumber < MAX_RETRY_ATTEMPTS) {
        // Queue retry with variation
        console.log(`→ Queuing retry for ${companyName} (attempt ${attemptNumber + 1})`);

        await updateJobProgress(job.id!, 90);
        await job.updateProgress(90);

        const retryJob = await stockAnalysisQueue.add(
          'stock-analysis-retry',
          {
            stockId,
            stockAnalysisId,
            companyName,
            ticker: job.data.companyName, // TODO: Get from database
            subSectorName: 'Unknown', // TODO: Get from database
            attemptNumber: attemptNumber + 1,
          },
          {
            jobId: `stock-${stockAnalysisId}-attempt-${attemptNumber + 1}`,
            delay: 5000, // 5 second delay before retry
          }
        );

        console.log(`→ Queued retry job ${retryJob.id} for ${companyName}`);

        await markJobCompleted(job.id!);

        return {
          success: true,
          approved: false,
          retryQueued: true,
          retryJobId: retryJob.id,
        };
      } else {
        // Max retries exceeded - mark as permanently failed
        console.error(
          `✗ Max retry attempts exceeded for ${companyName}. Marking as failed.`
        );

        await prisma.stockAnalysis.update({
          where: { id: stockAnalysisId },
          data: {
            status: 'review_failed',
            failureReason: `Judge rejected after ${MAX_RETRY_ATTEMPTS} attempts: ${mockJudgeReview}`,
          },
        });

        await markJobCompleted(job.id!); // Job itself completed, even though analysis failed

        return {
          success: true,
          approved: false,
          retryQueued: false,
          maxRetriesExceeded: true,
        };
      }
    }
  } catch (error) {
    const jobError = classifyError(error);
    const errorMessage = formatErrorMessage(
      error,
      `Judge review failed for ${companyName}`
    );

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

export const judgeReviewWorker = new Worker<JudgeReviewJobData>(
  'judge-review',
  processJudgeReview,
  {
    connection: redisConnection,
    concurrency: 10, // Process many judge reviews in parallel (faster than analysis)
    limiter: {
      max: 20, // Max 20 jobs
      duration: 60000, // Per minute
    },
  }
);

// Worker event handlers
judgeReviewWorker.on('completed', (job) => {
  console.log(`✓ Judge review job ${job.id} completed for ${job.data.companyName}`);
});

judgeReviewWorker.on('failed', (job, error) => {
  console.error(
    `✗ Judge review job ${job?.id} failed for ${job?.data.companyName}:`,
    error.message
  );
});

judgeReviewWorker.on('error', (error) => {
  console.error('Judge review worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await judgeReviewWorker.close();
});

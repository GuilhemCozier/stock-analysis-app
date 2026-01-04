import { Queue, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';
import {
  SectorResearchJobData,
  StockAnalysisJobData,
  JudgeReviewJobData,
  FormatInsightsJobData,
  StockRankingJobData,
} from './types';

// Redis connection configuration
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

// Common queue options
const baseQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times as per conventions
    backoff: {
      type: 'exponential',
      delay: 5000, // Start with 5 second delay
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs for debugging
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 200, // Keep last 200 failed jobs for analysis
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

// Sector research queue - long-running AI research (5-10 min)
export const sectorResearchQueue = new Queue<SectorResearchJobData>(
  'sector-research',
  {
    ...baseQueueOptions,
    defaultJobOptions: {
      ...baseQueueOptions.defaultJobOptions,
      attempts: 2, // Only retry once for long-running jobs
      timeout: 15 * 60 * 1000, // 15 minute timeout
    },
  }
);

// Stock analysis queue - deep stock research (7-10 min)
export const stockAnalysisQueue = new Queue<StockAnalysisJobData>(
  'stock-analysis',
  {
    ...baseQueueOptions,
    defaultJobOptions: {
      ...baseQueueOptions.defaultJobOptions,
      attempts: 1, // No automatic retries - manual retry with variation
      timeout: 15 * 60 * 1000, // 15 minute timeout
    },
  }
);

// Judge review queue - AI quality assessment
export const judgeReviewQueue = new Queue<JudgeReviewJobData>(
  'judge-review',
  {
    ...baseQueueOptions,
    defaultJobOptions: {
      ...baseQueueOptions.defaultJobOptions,
      attempts: 3,
      timeout: 5 * 60 * 1000, // 5 minute timeout
    },
  }
);

// Format insights queue - structure JSON output
export const formatInsightsQueue = new Queue<FormatInsightsJobData>(
  'format-insights',
  {
    ...baseQueueOptions,
    defaultJobOptions: {
      ...baseQueueOptions.defaultJobOptions,
      attempts: 3,
      timeout: 3 * 60 * 1000, // 3 minute timeout
    },
  }
);

// Stock ranking queue - rank stocks 1-10 within subsector
export const stockRankingQueue = new Queue<StockRankingJobData>(
  'stock-ranking',
  {
    ...baseQueueOptions,
    defaultJobOptions: {
      ...baseQueueOptions.defaultJobOptions,
      attempts: 3,
      timeout: 5 * 60 * 1000, // 5 minute timeout
    },
  }
);

// Export all queues
export const queues = {
  sectorResearch: sectorResearchQueue,
  stockAnalysis: stockAnalysisQueue,
  judgeReview: judgeReviewQueue,
  formatInsights: formatInsightsQueue,
  stockRanking: stockRankingQueue,
};

// Graceful shutdown
export async function closeQueues() {
  await Promise.all([
    sectorResearchQueue.close(),
    stockAnalysisQueue.close(),
    judgeReviewQueue.close(),
    formatInsightsQueue.close(),
    stockRankingQueue.close(),
  ]);
  await redisConnection.quit();
}

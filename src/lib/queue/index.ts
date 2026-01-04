/**
 * Queue module exports
 * Main entry point for the BullMQ job queue system
 */

// Queue instances
export {
  queues,
  sectorResearchQueue,
  stockAnalysisQueue,
  judgeReviewQueue,
  formatInsightsQueue,
  stockRankingQueue,
  closeQueues,
} from './config';

// Job types and interfaces
export type {
  SectorResearchJobData,
  StockAnalysisJobData,
  JudgeReviewJobData,
  FormatInsightsJobData,
  StockRankingJobData,
  JobType,
  JobStatusType,
  JobError,
} from './types';

export { ErrorType } from './types';

// Job status tracking utilities
export {
  createJobStatus,
  updateJobStatus,
  markJobActive,
  updateJobProgress,
  markJobCompleted,
  markJobFailed,
  getJobStatus,
  getJobsByRelatedId,
  cleanupOldJobs,
} from './jobStatus';

// Error handling utilities
export {
  classifyError,
  shouldRetry,
  calculateRetryDelay,
  formatErrorMessage,
  isAnthropicError,
  getRetryAfter,
  withRetry,
} from './errorHandling';

// Workers (for starting in separate process)
export { startAllWorkers, stopAllWorkers } from './workers';

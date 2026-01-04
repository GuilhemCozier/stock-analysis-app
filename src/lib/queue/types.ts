// Queue job data types

export interface SectorResearchJobData {
  sectorAnalysisId: string;
  userId: string;
  sectorName: string;
}

export interface StockAnalysisJobData {
  stockId: string;
  stockAnalysisId: string;
  companyName: string;
  ticker?: string;
  subSectorName: string;
  attemptNumber: number;
}

export interface JudgeReviewJobData {
  stockAnalysisId: string;
  stockId: string;
  rawAnalysis: string;
  companyName: string;
  attemptNumber: number;
}

export interface FormatInsightsJobData {
  stockAnalysisId: string;
  rawAnalysis: string;
  judgeReview: string;
  companyName: string;
}

export interface StockRankingJobData {
  subSectorId: string;
  stocks: Array<{
    id: string;
    companyName: string;
    ticker?: string;
    preliminaryNotes: string;
  }>;
}

// Job types
export type JobType =
  | 'sector_research'
  | 'stock_analysis'
  | 'judge_review'
  | 'format_insights'
  | 'stock_ranking';

// Job status types
export type JobStatusType = 'waiting' | 'active' | 'completed' | 'failed';

// Error types for different retry strategies
export enum ErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  JUDGE_REJECTION = 'JUDGE_REJECTION',
  UNKNOWN = 'UNKNOWN',
}

export interface JobError {
  type: ErrorType;
  message: string;
  retryable: boolean;
  retryDelay?: number; // milliseconds
}

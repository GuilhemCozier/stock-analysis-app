/**
 * AI Module - Main exports
 */

export {
  runSectorResearch,
  runStockAnalysis,
  runJudgeReview,
  runFormatInsights,
  validateAnthropicConfig,
} from './client';

export type {
  AIResult,
  TokenUsage,
  ProgressCallback,
  StructuredInsights,
} from './client';

export {
  getSectorResearchPrompt,
  getStockAnalysisPrompt,
  getJudgeReviewPrompt,
  getFormatInsightsPrompt,
} from './prompts';

export {
  sectorResearchSchema,
  stockAnalysisSchema,
  judgeReviewSchema,
  formatInsightsSchema,
  validateInput,
} from './validation';

export type {
  SectorResearchInput,
  StockAnalysisInput,
  JudgeReviewInput,
  FormatInsightsInput,
} from './validation';

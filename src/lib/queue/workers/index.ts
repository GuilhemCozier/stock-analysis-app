/**
 * Worker exports
 * All BullMQ workers for processing background jobs
 */

export { sectorResearchWorker } from './sectorResearchWorker';
export { stockAnalysisWorker } from './stockAnalysisWorker';
export { judgeReviewWorker } from './judgeReviewWorker';
export { formatInsightsWorker } from './formatInsightsWorker';
export { stockRankingWorker } from './stockRankingWorker';

/**
 * Start all workers
 * This function initializes all workers and sets up graceful shutdown
 */
export async function startAllWorkers() {
  // Import all workers to initialize them
  const {
    sectorResearchWorker,
    stockAnalysisWorker,
    judgeReviewWorker,
    formatInsightsWorker,
    stockRankingWorker,
  } = await import('./index');

  console.log('🚀 All workers started successfully');
  console.log('  - Sector Research Worker');
  console.log('  - Stock Analysis Worker');
  console.log('  - Judge Review Worker');
  console.log('  - Format Insights Worker');
  console.log('  - Stock Ranking Worker');

  return {
    sectorResearchWorker,
    stockAnalysisWorker,
    judgeReviewWorker,
    formatInsightsWorker,
    stockRankingWorker,
  };
}

/**
 * Stop all workers gracefully
 */
export async function stopAllWorkers() {
  const {
    sectorResearchWorker,
    stockAnalysisWorker,
    judgeReviewWorker,
    formatInsightsWorker,
    stockRankingWorker,
  } = await import('./index');

  console.log('🛑 Stopping all workers...');

  await Promise.all([
    sectorResearchWorker.close(),
    stockAnalysisWorker.close(),
    judgeReviewWorker.close(),
    formatInsightsWorker.close(),
    stockRankingWorker.close(),
  ]);

  console.log('✓ All workers stopped');
}

import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { SectorResearchJobData } from '../types';
import {
  markJobActive,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
} from '../jobStatus';
import { classifyError, formatErrorMessage } from '../errorHandling';

/**
 * Process sector research job
 * This worker performs AI research on a sector (5-10 min)
 * and creates sub-sectors and stocks
 */
async function processSectorResearch(job: Job<SectorResearchJobData>) {
  const { sectorAnalysisId, userId, sectorName } = job.data;

  try {
    // Mark job as active in database
    await markJobActive(job.id!, 0);

    // Update sector analysis status
    await prisma.sectorAnalysis.update({
      where: { id: sectorAnalysisId },
      data: { status: 'in_progress' },
    });

    // Progress: 10% - Starting AI research
    await updateJobProgress(job.id!, 10);
    await job.updateProgress(10);

    // TODO: Call AI service to research sector
    // This will be implemented in Phase 3
    // const aiResult = await researchSector(sectorName, userId);

    // Mock AI result for now - will be replaced with actual AI service
    const mockFullReport = `AI Research Report for ${sectorName}\n\nThis is a placeholder for the AI-generated sector analysis report.`;

    // Progress: 60% - AI research completed
    await updateJobProgress(job.id!, 60);
    await job.updateProgress(60);

    // Save the full report
    await prisma.sectorAnalysis.update({
      where: { id: sectorAnalysisId },
      data: {
        fullReport: mockFullReport,
      },
    });

    // Progress: 70% - Parsing sub-sectors and stocks
    await updateJobProgress(job.id!, 70);
    await job.updateProgress(70);

    // TODO: Parse AI output to extract sub-sectors and stocks
    // This will be implemented in Phase 3
    // const { subSectors, stocks } = parseAIOutput(aiResult);

    // Mock sub-sectors for now
    const mockSubSectors = [
      {
        name: `${sectorName} Sub-sector 1`,
        summary: 'Placeholder summary for sub-sector 1',
      },
      {
        name: `${sectorName} Sub-sector 2`,
        summary: 'Placeholder summary for sub-sector 2',
      },
    ];

    // Create sub-sectors with their stocks
    for (const subSector of mockSubSectors) {
      await prisma.subSector.create({
        data: {
          sectorAnalysisId,
          name: subSector.name,
          summary: subSector.summary,
          status: 'pending', // User needs to approve
        },
      });
    }

    // Progress: 90% - Finalizing
    await updateJobProgress(job.id!, 90);
    await job.updateProgress(90);

    // Mark sector analysis as completed
    await prisma.sectorAnalysis.update({
      where: { id: sectorAnalysisId },
      data: { status: 'completed' },
    });

    // Mark job as completed
    await markJobCompleted(job.id!);

    return {
      success: true,
      sectorAnalysisId,
      subSectorsCreated: mockSubSectors.length,
    };
  } catch (error) {
    // Classify error for better handling
    const jobError = classifyError(error);
    const errorMessage = formatErrorMessage(error, 'Sector research failed');

    // Update database
    await prisma.sectorAnalysis.update({
      where: { id: sectorAnalysisId },
      data: { status: 'failed' },
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

export const sectorResearchWorker = new Worker<SectorResearchJobData>(
  'sector-research',
  processSectorResearch,
  {
    connection: redisConnection,
    concurrency: 2, // Process 2 sector research jobs in parallel max
    limiter: {
      max: 5, // Max 5 jobs
      duration: 60000, // Per minute
    },
  }
);

// Worker event handlers
sectorResearchWorker.on('completed', (job) => {
  console.log(`✓ Sector research job ${job.id} completed for ${job.data.sectorName}`);
});

sectorResearchWorker.on('failed', (job, error) => {
  console.error(`✗ Sector research job ${job?.id} failed:`, error.message);
});

sectorResearchWorker.on('error', (error) => {
  console.error('Sector research worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await sectorResearchWorker.close();
});

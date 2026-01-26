import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db/prisma';
import { SectorResearchJobData } from '../types';
import { createWorkerConnection } from '../config';
import {
  markJobActive,
  markJobCompleted,
  markJobFailed,
  updateJobProgress,
} from '../jobStatus';
import { classifyError, formatErrorMessage } from '../errorHandling';
import { runSectorResearch } from '@/lib/ai';

/**
 * Parse AI output to extract executive summary, sub-sectors, and their stocks
 */
interface ParsedStock {
  rank: number;
  companyName: string;
  ticker: string | null;
  preliminaryNotes: string;
}

interface ParsedSubSector {
  name: string;
  shortDescription: string; // One-line headline
  summary: string;          // Full 2-3 paragraph description
  stocks: ParsedStock[];
}

interface ParsedOutput {
  executiveSummary: string;
  subSectors: ParsedSubSector[];
}

function parseAIOutput(content: string): ParsedOutput {
  const subSectors: ParsedSubSector[] = [];

  // Extract executive summary (between "## Executive Summary" and next "##")
  const execSummaryMatch = content.match(/##\s*Executive\s*Summary\s*\n([\s\S]*?)(?=\n---|\n##)/i);
  const executiveSummary = execSummaryMatch
    ? execSummaryMatch[1].trim().slice(0, 500)
    : '';

  console.log(`  Executive summary: ${executiveSummary.slice(0, 100)}...`);

  // Split by sub-sector headers - matches "## Sub-sector: Name" or "## Sub-sector 1: Name"
  const subSectorPattern = /##\s*Sub-sector\s*\d*:\s*(.+?)(?=\n)/gi;
  const subSectorMatches = [...content.matchAll(subSectorPattern)];

  console.log(`  Found ${subSectorMatches.length} sub-sector headers in AI output`);

  for (let i = 0; i < subSectorMatches.length; i++) {
    const match = subSectorMatches[i];
    const subSectorName = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = subSectorMatches[i + 1]?.index ?? content.length;
    const subSectorContent = content.slice(startIndex, endIndex);

    // Extract headline (one-line description after **Headline:**)
    const headlineMatch = subSectorContent.match(/\*\*Headline:\*\*\s*(.+?)(?=\n)/i);
    const shortDescription = headlineMatch
      ? headlineMatch[1].trim()
      : subSectorName; // Fallback to name if no headline

    // Extract full summary (text between headline and first ### Rank, excluding Key Trends)
    const summaryMatch = subSectorContent.match(/(?:\*\*Headline:\*\*[^\n]*\n)?([\s\S]*?)(?=###\s*Rank)/);
    let summary = summaryMatch ? summaryMatch[1].trim() : '';
    // Remove the headline line if it's included
    summary = summary.replace(/^\*\*Headline:\*\*[^\n]*\n?/, '').trim();
    // Remove Key Trends section from summary
    summary = summary.replace(/\*\*Key Trends:\*\*[\s\S]*?(?=\n\n|$)/, '').trim();

    // Extract stocks with rank pattern: ### Rank N: or ### Rank N/M: followed by Company Name (TICKER)
    // Ticker can be 1-6 chars, uppercase, or "Private"
    const stockPattern = /###\s*Rank\s*(\d+)(?:\/\d+)?:\s*(.+?)(?:\s*\(([A-Za-z]{1,6}|Private)\))?\s*\n([\s\S]*?)(?=###\s*Rank|\n---|\n##|$)/gi;
    const stocks: ParsedStock[] = [];

    let stockMatch;
    while ((stockMatch = stockPattern.exec(subSectorContent)) !== null) {
      const rank = parseInt(stockMatch[1], 10);
      const companyName = stockMatch[2].trim();
      const tickerOrPrivate = stockMatch[3]?.trim();
      const ticker = tickerOrPrivate && tickerOrPrivate !== 'Private' ? tickerOrPrivate : null;
      const preliminaryNotes = stockMatch[4].trim();

      stocks.push({ rank, companyName, ticker, preliminaryNotes });
    }

    subSectors.push({
      name: subSectorName,
      shortDescription: shortDescription.slice(0, 200),
      summary: summary.slice(0, 2000),
      stocks,
    });
  }

  return { executiveSummary, subSectors };
}

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

    console.log(`🔬 Starting AI sector research for: ${sectorName}`);

    // Call AI service to research sector
    const aiResult = await runSectorResearch(sectorName, (chunk) => {
      // Log progress chunks (optional)
      process.stdout.write('.');
    });

    if (aiResult.error) {
      throw new Error(`AI research failed: ${aiResult.error}`);
    }

    console.log(`\n✓ AI research completed. Tokens used: ${aiResult.tokenUsage.totalTokens}`);

    // Progress: 60% - AI research completed
    await updateJobProgress(job.id!, 60);
    await job.updateProgress(60);

    // Progress: 70% - Parsing sub-sectors and stocks
    await updateJobProgress(job.id!, 70);
    await job.updateProgress(70);

    // Parse AI output to extract executive summary, sub-sectors, and stocks
    const parsedOutput = parseAIOutput(aiResult.content);
    console.log(`📊 Parsed ${parsedOutput.subSectors.length} sub-sectors from AI output`);

    // Save the full report and executive summary
    await prisma.sectorAnalysis.update({
      where: { id: sectorAnalysisId },
      data: {
        fullReport: aiResult.content,
        summary: parsedOutput.executiveSummary || null,
      },
    });

    // Create sub-sectors with their stocks
    let totalStocksCreated = 0;
    for (const subSector of parsedOutput.subSectors) {
      const createdSubSector = await prisma.subSector.create({
        data: {
          sectorAnalysisId,
          name: subSector.name,
          shortDescription: subSector.shortDescription,
          summary: subSector.summary,
          status: 'pending', // User needs to approve
        },
      });

      // Create stocks for this sub-sector
      for (const stock of subSector.stocks) {
        await prisma.stock.create({
          data: {
            subSectorId: createdSubSector.id,
            companyName: stock.companyName,
            ticker: stock.ticker,
            rank: stock.rank,
            preliminaryNotes: stock.preliminaryNotes,
          },
        });
        totalStocksCreated++;
      }

      console.log(`  ✓ Created sub-sector "${subSector.name}" with ${subSector.stocks.length} stocks`);
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
      subSectorsCreated: parsedOutput.subSectors.length,
      stocksCreated: totalStocksCreated,
      tokenUsage: aiResult.tokenUsage,
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

// Create worker with shared Redis connection
export const sectorResearchWorker = new Worker<SectorResearchJobData>(
  'sector-research',
  processSectorResearch,
  {
    connection: createWorkerConnection(),
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

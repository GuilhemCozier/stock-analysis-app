import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { stockRankingQueue, stockAnalysisQueue } from '@/lib/queue/config';
import { createJobStatus } from '@/lib/queue/jobStatus';

/**
 * POST /api/subsector/[id]/approve
 *
 * Approve a sub-sector for deep stock analysis
 * - Updates SubSector status to "approved"
 * - Triggers stock ranking if not already ranked
 * - Triggers stock analysis jobs for top 5 stocks
 * - Creates JobStatus records for tracking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch subsector with stocks
    const subSector = await prisma.subSector.findUnique({
      where: { id },
      include: {
        stocks: {
          orderBy: { rank: 'asc' },
        },
      },
    });

    if (!subSector) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sub-sector not found',
        },
        { status: 404 }
      );
    }

    // Update subsector status to approved
    await prisma.subSector.update({
      where: { id },
      data: { status: 'approved' },
    });

    const jobsCreated: Array<{ jobId: string; type: string; stockId?: string }> = [];

    // Check if stocks need ranking (rank = 0 means not ranked yet)
    const needsRanking = subSector.stocks.length > 0 && subSector.stocks.some(stock => stock.rank === 0);

    if (needsRanking) {
      // Trigger stock ranking job first
      const rankingJob = await stockRankingQueue.add('stock-ranking', {
        subSectorId: id,
        stocks: subSector.stocks.map((stock) => ({
          id: stock.id,
          companyName: stock.companyName,
          ticker: stock.ticker || undefined,
          preliminaryNotes: stock.preliminaryNotes,
        })),
      });

      await createJobStatus(rankingJob.id!, 'stock_ranking', id);

      jobsCreated.push({
        jobId: rankingJob.id!,
        type: 'stock_ranking',
      });
    } else if (subSector.stocks.length > 0) {
      // Stocks are already ranked, trigger analysis for top 5
      const top5Stocks = subSector.stocks.slice(0, 5);

      for (const stock of top5Stocks) {
        // Create StockAnalysis record
        const stockAnalysis = await prisma.stockAnalysis.create({
          data: {
            stockId: stock.id,
            status: 'pending',
            rawAnalysis: '',
            judgeReview: '',
            insights: {},
            attemptCount: 1,
          },
        });

        // Add stock analysis job to queue
        const analysisJob = await stockAnalysisQueue.add('stock-analysis', {
          stockId: stock.id,
          stockAnalysisId: stockAnalysis.id,
          companyName: stock.companyName,
          ticker: stock.ticker || undefined,
          subSectorName: subSector.name,
          attemptNumber: 1,
        });

        await createJobStatus(analysisJob.id!, 'stock_analysis', stock.id);

        jobsCreated.push({
          jobId: analysisJob.id!,
          type: 'stock_analysis',
          stockId: stock.id,
        });
      }

      // Update subsector status to analyzing
      await prisma.subSector.update({
        where: { id },
        data: { status: 'analyzing' },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          subSectorId: id,
          jobsCreated,
          message: needsRanking
            ? 'Stock ranking job created'
            : `${jobsCreated.length} stock analysis jobs created for top ${jobsCreated.length} stocks`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving subsector:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve subsector',
      },
      { status: 500 }
    );
  }
}

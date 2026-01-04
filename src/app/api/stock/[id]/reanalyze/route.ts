import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { stockAnalysisQueue } from '@/lib/queue/config';
import { createJobStatus } from '@/lib/queue/jobStatus';

/**
 * POST /api/stock/[id]/reanalyze
 *
 * Manually trigger deep analysis for a stock (typically non-top-5)
 * - Verifies stock exists
 * - Checks if analysis already exists
 * - Creates StockAnalysis record
 * - Triggers stock analysis job
 * - Creates JobStatus record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch stock with existing analysis and subsector info
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        deepAnalysis: true,
        subSector: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!stock) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stock not found',
        },
        { status: 404 }
      );
    }

    // Check if analysis already exists
    if (stock.deepAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stock already has an analysis. Delete existing analysis first to reanalyze.',
        },
        { status: 400 }
      );
    }

    // Create StockAnalysis record
    const stockAnalysis = await prisma.stockAnalysis.create({
      data: {
        stockId: id,
        status: 'pending',
        rawAnalysis: '',
        judgeReview: '',
        insights: {},
        attemptCount: 1,
      },
    });

    // Add stock analysis job to queue
    const analysisJob = await stockAnalysisQueue.add('stock-analysis', {
      stockId: id,
      stockAnalysisId: stockAnalysis.id,
      companyName: stock.companyName,
      ticker: stock.ticker || undefined,
      subSectorName: stock.subSector.name,
      attemptNumber: 1,
    });

    // Create JobStatus record for tracking
    await createJobStatus(analysisJob.id!, 'stock_analysis', id);

    return NextResponse.json(
      {
        success: true,
        data: {
          jobId: analysisJob.id!,
          stockAnalysisId: stockAnalysis.id,
          message: `Started analysis for ${stock.companyName}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error triggering stock reanalysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger stock reanalysis',
      },
      { status: 500 }
    );
  }
}

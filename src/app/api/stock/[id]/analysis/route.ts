import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/stock/[id]/analysis
 *
 * Get deep analysis for a specific stock
 * - Fetches Stock with StockAnalysis
 * - Includes formatted insights JSON
 * - Returns null if no analysis exists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch stock with deep analysis
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        deepAnalysis: true,
        subSector: {
          select: {
            id: true,
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

    // Return null for analysis if it doesn't exist
    const analysisData = stock.deepAnalysis
      ? {
          id: stock.deepAnalysis.id,
          status: stock.deepAnalysis.status,
          rawAnalysis: stock.deepAnalysis.rawAnalysis,
          judgeReview: stock.deepAnalysis.judgeReview,
          insights: stock.deepAnalysis.insights,
          attemptCount: stock.deepAnalysis.attemptCount,
          failureReason: stock.deepAnalysis.failureReason,
          createdAt: stock.deepAnalysis.createdAt,
          updatedAt: stock.deepAnalysis.updatedAt,
        }
      : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          stock: {
            id: stock.id,
            companyName: stock.companyName,
            ticker: stock.ticker,
            rank: stock.rank,
            preliminaryNotes: stock.preliminaryNotes,
            subSector: stock.subSector,
          },
          analysis: analysisData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stock analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stock analysis',
      },
      { status: 500 }
    );
  }
}

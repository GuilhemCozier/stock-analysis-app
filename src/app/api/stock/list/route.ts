import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/stock/list
 *
 * List all stocks with completed analyses
 * - Returns stocks that have deep analysis completed
 * - Includes insights data for display in DatabaseTable
 * - Supports filtering by sector via query param
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sectorId');

    const stocks = await prisma.stock.findMany({
      where: {
        deepAnalysis: {
          status: 'completed',
        },
        ...(sectorId && {
          subSector: {
            sectorAnalysisId: sectorId,
          },
        }),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        deepAnalysis: {
          select: {
            id: true,
            status: true,
            insights: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        subSector: {
          select: {
            id: true,
            name: true,
            sectorAnalysis: {
              select: {
                id: true,
                sectorName: true,
              },
            },
          },
        },
      },
    });

    // Map to the shape expected by DatabaseTable
    const companyAnalyses = stocks.map((stock) => {
      const insights = stock.deepAnalysis?.insights as Record<string, unknown> | null;

      return {
        id: stock.id,
        companyName: stock.companyName,
        ticker: stock.ticker,
        sector: stock.subSector.sectorAnalysis.sectorName,
        subSector: stock.subSector.name,
        // These fields come from the insights JSON
        // Provide defaults if insights structure doesn't match
        isHolding: (insights?.isHolding as boolean) ?? false,
        conservative5yTarget: (insights?.conservative5yTarget as number) ?? 0,
        priceAtAnalysis: (insights?.priceAtAnalysis as number) ?? 0,
        convictionScore: (insights?.convictionScore as number) ?? 0,
        currency: (insights?.currency as string) ?? 'USD',
        strongBuyThreshold: (insights?.strongBuyThreshold as number) ?? 0,
        accumulateThreshold: (insights?.accumulateThreshold as number) ?? 0,
        reduceThreshold: (insights?.reduceThreshold as number) ?? 0,
        strongSellThreshold: (insights?.strongSellThreshold as number) ?? 0,
        dateOfAnalysis: stock.deepAnalysis?.createdAt ?? stock.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: companyAnalyses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching stock list:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stock list',
      },
      { status: 500 }
    );
  }
}

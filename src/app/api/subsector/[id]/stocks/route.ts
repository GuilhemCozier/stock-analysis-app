import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/subsector/[id]/stocks
 *
 * Get all stocks in a sub-sector
 * - Fetches SubSector with all stocks
 * - Includes deep analysis and insights if available
 * - Returns stocks ordered by rank (1-10)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch subsector with stocks and their analyses
    const subSector = await prisma.subSector.findUnique({
      where: { id },
      include: {
        stocks: {
          orderBy: { rank: 'asc' },
          include: {
            deepAnalysis: true,
          },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: subSector.id,
          name: subSector.name,
          summary: subSector.summary,
          status: subSector.status,
          stocks: subSector.stocks,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching subsector stocks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subsector stocks',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/analysis/[id]
 *
 * Get sector analysis status and complete data tree
 * - Fetches SectorAnalysis with all sub-sectors and stocks
 * - Includes job progress from JobStatus
 * - Returns complete analysis hierarchy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch sector analysis with all related data
    const sectorAnalysis = await prisma.sectorAnalysis.findUnique({
      where: { id },
      include: {
        subSectors: {
          include: {
            stocks: {
              orderBy: { rank: 'asc' },
              include: {
                deepAnalysis: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!sectorAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sector analysis not found',
        },
        { status: 404 }
      );
    }

    // Fetch related job statuses
    const jobStatuses = await prisma.jobStatus.findMany({
      where: { relatedId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...sectorAnalysis,
          jobs: jobStatuses,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sector analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sector analysis',
      },
      { status: 500 }
    );
  }
}

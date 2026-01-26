import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/analysis/list
 *
 * List all analyses (sector and stock) for sidebar display
 * - Returns analyses ordered by most recent
 * - Includes type field to distinguish sector vs stock
 * - Used by sidebar recent analyses
 */
export async function GET() {
  try {
    // Fetch sector analyses
    const sectorAnalyses = await prisma.sectorAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sectorName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // TODO: When individual stock analyses are supported, fetch and merge them here
    // const stockAnalyses = await prisma.stockAnalysis.findMany({...});

    // Map to unified format with type field
    const analyses = [
      ...sectorAnalyses.map((analysis) => ({
        id: analysis.id,
        name: analysis.sectorName,
        type: 'sector' as const,
        status: analysis.status,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      })),
      // TODO: Add stock analyses here when supported
      // ...stockAnalyses.map((analysis) => ({
      //   id: analysis.id,
      //   name: analysis.companyName,
      //   type: 'stock' as const,
      //   ...
      // })),
    ];

    // Sort combined list by createdAt descending
    analyses.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        data: analyses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analyses',
      },
      { status: 500 }
    );
  }
}

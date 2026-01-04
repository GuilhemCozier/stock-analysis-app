import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sectorResearchQueue } from '@/lib/queue/config';
import { createJobStatus } from '@/lib/queue/jobStatus';
import { startAnalysisSchema } from '@/lib/validation/api';

/**
 * POST /api/analysis/start
 *
 * Start a new sector analysis
 * - Validates sector name
 * - Creates SectorAnalysis record
 * - Creates JobStatus record
 * - Triggers sector research job
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = startAnalysisSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { sectorName } = validationResult.data;

    // TODO: Replace with actual user ID from authentication
    const userId = 'demo-user';

    // Create SectorAnalysis record
    const sectorAnalysis = await prisma.sectorAnalysis.create({
      data: {
        userId,
        sectorName,
        status: 'in_progress',
        fullReport: '', // Will be populated by the worker
      },
    });

    // Add job to queue
    const job = await sectorResearchQueue.add('sector-research', {
      sectorAnalysisId: sectorAnalysis.id,
      userId,
      sectorName,
    });

    // Create JobStatus record for tracking
    await createJobStatus(job.id!, 'sector_research', sectorAnalysis.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: sectorAnalysis.id,
          status: sectorAnalysis.status,
          message: `Started analysis for sector: ${sectorName}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error starting sector analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start sector analysis',
      },
      { status: 500 }
    );
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/analysis/[id]/stream
 *
 * Server-Sent Events (SSE) endpoint for real-time job updates
 * - Streams progress updates every 2 seconds
 * - Sends job status changes and progress updates
 * - Handles connection cleanup on abort
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify sector analysis exists
  const sectorAnalysis = await prisma.sectorAnalysis.findUnique({
    where: { id },
  });

  if (!sectorAnalysis) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sector analysis not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create ReadableStream for SSE
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    async start(controller) {
      // Track last update to detect changes
      const lastJobStates = new Map<string, { status: string; progress: number }>();

      // Function to send SSE event
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Poll for job updates every 2 seconds
      intervalId = setInterval(async () => {
        try {
          // Fetch all related jobs
          const jobs = await prisma.jobStatus.findMany({
            where: { relatedId: id },
            orderBy: { createdAt: 'desc' },
          });

          // Also fetch jobs for sub-entities (stocks)
          const sectorWithSubSectors = await prisma.sectorAnalysis.findUnique({
            where: { id },
            include: {
              subSectors: {
                include: {
                  stocks: {
                    include: {
                      deepAnalysis: true,
                    },
                  },
                },
              },
            },
          });

          const stockJobs = sectorWithSubSectors?.subSectors.flatMap((subSector) =>
            subSector.stocks.flatMap((stock) => {
              const stockId = stock.id;
              const analysisId = stock.deepAnalysis?.id;
              return [stockId, analysisId].filter(Boolean) as string[];
            })
          ) || [];

          const relatedJobs = await prisma.jobStatus.findMany({
            where: {
              OR: [
                { relatedId: id },
                { relatedId: { in: stockJobs } },
              ],
            },
            orderBy: { updatedAt: 'desc' },
          });

          // Send updates for changed jobs
          for (const job of relatedJobs) {
            const lastState = lastJobStates.get(job.jobId);
            const currentState = { status: job.status, progress: job.progress };

            // Check if job state changed
            if (
              !lastState ||
              lastState.status !== currentState.status ||
              lastState.progress !== currentState.progress
            ) {
              // Send progress event
              sendEvent('progress', {
                type: job.jobType,
                jobId: job.jobId,
                relatedId: job.relatedId,
                status: job.status,
                progress: job.progress,
                errorMessage: job.errorMessage,
              });

              // Update last state
              lastJobStates.set(job.jobId, currentState);

              // Send complete event if job is done
              if (job.status === 'completed') {
                sendEvent('complete', {
                  type: job.jobType,
                  jobId: job.jobId,
                  relatedId: job.relatedId,
                  status: job.status,
                });
              }

              // Send error event if job failed
              if (job.status === 'failed') {
                sendEvent('error', {
                  type: job.jobType,
                  jobId: job.jobId,
                  relatedId: job.relatedId,
                  status: job.status,
                  errorMessage: job.errorMessage,
                });
              }
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
          sendEvent('error', {
            message: 'Error fetching job updates',
          });
        }
      }, 2000); // Poll every 2 seconds

      // Send initial connection event
      sendEvent('connected', { message: 'Connected to job stream' });
    },

    cancel() {
      // Clean up interval on disconnect
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });

  // Return response with SSE headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  });
}

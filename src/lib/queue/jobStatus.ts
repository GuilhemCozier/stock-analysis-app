import { prisma } from '@/lib/db/prisma';
import { JobType, JobStatusType } from './types';

/**
 * Create a new job status record in the database
 */
export async function createJobStatus(
  jobId: string,
  jobType: JobType,
  relatedId: string
) {
  return await prisma.jobStatus.create({
    data: {
      jobId,
      jobType,
      relatedId,
      status: 'waiting',
      progress: 0,
    },
  });
}

/**
 * Update job status in the database
 */
export async function updateJobStatus(
  jobId: string,
  data: {
    status?: JobStatusType;
    progress?: number;
    errorMessage?: string;
  }
) {
  return await prisma.jobStatus.update({
    where: { jobId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

/**
 * Mark job as active
 */
export async function markJobActive(jobId: string, progress = 0) {
  return await updateJobStatus(jobId, {
    status: 'active',
    progress,
  });
}

/**
 * Update job progress (0-100)
 */
export async function updateJobProgress(jobId: string, progress: number) {
  return await updateJobStatus(jobId, {
    progress: Math.min(100, Math.max(0, progress)),
  });
}

/**
 * Mark job as completed
 */
export async function markJobCompleted(jobId: string) {
  return await updateJobStatus(jobId, {
    status: 'completed',
    progress: 100,
  });
}

/**
 * Mark job as failed
 */
export async function markJobFailed(jobId: string, errorMessage: string) {
  return await updateJobStatus(jobId, {
    status: 'failed',
    errorMessage,
  });
}

/**
 * Get job status from database
 */
export async function getJobStatus(jobId: string) {
  return await prisma.jobStatus.findUnique({
    where: { jobId },
  });
}

/**
 * Get all jobs for a related entity
 */
export async function getJobsByRelatedId(relatedId: string) {
  return await prisma.jobStatus.findMany({
    where: { relatedId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Clean up old completed jobs (optional utility for maintenance)
 */
export async function cleanupOldJobs(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await prisma.jobStatus.deleteMany({
    where: {
      status: 'completed',
      updatedAt: {
        lt: cutoffDate,
      },
    },
  });
}

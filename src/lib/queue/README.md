# BullMQ Job Queue System

This directory contains the complete BullMQ-based job queue system for processing asynchronous AI tasks in the Stock Analysis application.

## Overview

The queue system handles five types of jobs in a multi-stage pipeline:

1. **Sector Research** → Research a broad sector (5-10 min)
2. **Stock Ranking** → Rank stocks 1-10 within a sub-sector
3. **Stock Analysis** → Deep analysis of individual stocks (7-10 min)
4. **Judge Review** → AI quality assessment of stock analysis
5. **Format Insights** → Structure analysis into JSON format

## Architecture

### Job Flow

```
[Sector Research Job]
        ↓
  Creates SubSectors
        ↓
User approves SubSector
        ↓
[Stock Ranking Job]
        ↓
  Ranks stocks 1-10
        ↓
[5x Stock Analysis Jobs] (parallel, top 5 stocks)
        ↓
[Judge Review Job] → Approved?
        ↓              ↓ No (retry with variation)
      Yes              ↓
        ↓         [Stock Analysis Job]
        ↓              ↓
        ↓         [Judge Review Job]
        ↓              ↓
        ↓            Yes
        ↓              ↓
[Format Insights Job] ←┘
        ↓
   Completed!
```

### Directory Structure

```
/queue
  /workers              # Worker implementations
    sectorResearchWorker.ts
    stockRankingWorker.ts
    stockAnalysisWorker.ts
    judgeReviewWorker.ts
    formatInsightsWorker.ts
    index.ts
  config.ts             # Queue configurations
  types.ts              # TypeScript types
  jobStatus.ts          # Database job tracking
  errorHandling.ts      # Error classification & retry logic
  startWorkers.ts       # Worker process entry point
  index.ts              # Main exports
  README.md             # This file
```

## Queue Configurations

### Sector Research Queue
- **Concurrency**: 2 workers
- **Timeout**: 15 minutes
- **Retry**: 2 attempts (only 1 retry)
- **Rate Limit**: 5 jobs/minute

Long-running AI research job. Limited retries due to high cost.

### Stock Ranking Queue
- **Concurrency**: 3 workers
- **Timeout**: 5 minutes
- **Retry**: 3 attempts
- **Rate Limit**: 5 jobs/minute

Ranks stocks within a sub-sector before analysis.

### Stock Analysis Queue
- **Concurrency**: 5 workers
- **Timeout**: 15 minutes
- **Retry**: 1 attempt (no automatic retries)
- **Rate Limit**: 10 jobs/minute

Deep stock analysis. Manual retry with variation on judge rejection.

### Judge Review Queue
- **Concurrency**: 10 workers
- **Timeout**: 5 minutes
- **Retry**: 3 attempts
- **Rate Limit**: 20 jobs/minute

Fast AI quality assessment. Higher concurrency.

### Format Insights Queue
- **Concurrency**: 10 workers
- **Timeout**: 3 minutes
- **Retry**: 3 attempts
- **Rate Limit**: 20 jobs/minute

Fast JSON formatting. Higher concurrency.

## Error Handling & Retry Strategies

### Error Classification

The system automatically classifies errors into types:

| Error Type | Retryable | Delay | Examples |
|------------|-----------|-------|----------|
| `RATE_LIMIT` | ✅ Yes | 60s | HTTP 429, "rate limit exceeded" |
| `NETWORK_ERROR` | ✅ Yes | 10s | Timeout, ECONNREFUSED |
| `JUDGE_REJECTION` | ✅ Yes | 5s | Analysis rejected by judge |
| `API_ERROR` | ❌ No | N/A | HTTP 401, 403 |
| `VALIDATION_ERROR` | ❌ No | N/A | HTTP 400, invalid input |
| `UNKNOWN` | ✅ Yes | 5s | Other errors |

### Retry Behavior

#### Standard Retries (BullMQ)
- Uses **exponential backoff**: `delay * (2 ^ attemptNumber)`
- Base delay: 5 seconds
- Max attempts: 3 (configurable per queue)

#### Judge Rejection Retries
- Special handling: triggers new Stock Analysis job with variation
- Max attempts: 3
- After 3 rejections: mark as permanently failed

#### Rate Limit Retries
- Respects `Retry-After` header if present
- Otherwise: 60 second delay
- Automatically retried by BullMQ

### Error Recovery Flow

```
Job Execution
     ↓
   Error?
     ↓
Classify Error
     ↓
Retryable? → No → Mark Failed → Update DB
     ↓
    Yes
     ↓
Attempts Left? → No → Mark Failed → Update DB
     ↓
    Yes
     ↓
Calculate Delay (exponential backoff)
     ↓
Wait
     ↓
Retry Job
```

## Job Status Tracking

All jobs are tracked in the database using the `JobStatus` model:

```typescript
{
  jobId: string;        // BullMQ job ID
  jobType: string;      // Type of job
  relatedId: string;    // ID of related entity
  status: string;       // waiting | active | completed | failed
  progress: number;     // 0-100
  errorMessage?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Status Lifecycle

1. `waiting` - Job queued, not started
2. `active` - Job currently processing
3. `completed` - Job finished successfully
4. `failed` - Job failed after all retries

### Progress Tracking

Workers update progress at key stages (0-100%):

```typescript
// Sector Research
0%   → Job started
10%  → AI research started
60%  → AI research completed
70%  → Parsing sub-sectors
90%  → Finalizing
100% → Completed

// Stock Analysis
0%   → Job started
10%  → Deep research started
80%  → Analysis completed
90%  → Queuing judge review
100% → Completed

// Judge Review
0%   → Job started
20%  → Starting review
70%  → Review completed
90%  → Queuing next job (format or retry)
100% → Completed

// Format Insights
0%   → Job started
20%  → Starting formatting
70%  → Formatting completed
90%  → Checking subsector completion
100% → Completed
```

## Usage

### Starting Workers

#### Development
```bash
# In a separate terminal
npm run workers

# Or with tsx
tsx src/lib/queue/startWorkers.ts
```

#### Production
```bash
# Build first
npm run build

# Start workers
NODE_ENV=production node dist/lib/queue/startWorkers.js

# Or with PM2
pm2 start dist/lib/queue/startWorkers.js --name stock-workers
```

### Adding Jobs to Queues

```typescript
import { sectorResearchQueue, createJobStatus } from '@/lib/queue';

// Create job in queue
const job = await sectorResearchQueue.add(
  'sector-research',
  {
    sectorAnalysisId: 'abc123',
    userId: 'user456',
    sectorName: 'Technology',
  },
  {
    jobId: `sector-abc123`, // Optional unique ID
  }
);

// Track job in database
await createJobStatus(job.id!, 'sector_research', 'abc123');
```

### Monitoring Job Progress

```typescript
import { getJobStatus, getJobsByRelatedId } from '@/lib/queue';

// Get single job status
const status = await getJobStatus(jobId);
console.log(status?.progress); // 0-100

// Get all jobs for an entity
const jobs = await getJobsByRelatedId(sectorAnalysisId);
```

### Error Handling in Workers

Workers automatically handle errors using the error classification system:

```typescript
import { withRetry, classifyError } from '@/lib/queue';

// Wrap AI calls with retry logic
const result = await withRetry(
  async () => {
    return await callAnthropicAPI();
  },
  {
    maxAttempts: 3,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}: ${error.message}`);
    },
    context: 'AI API call',
  }
);
```

## Database Integration

### Required Prisma Models

The queue system requires these Prisma models:

- `JobStatus` - Job metadata and progress
- `SectorAnalysis` - Sector research results
- `SubSector` - Sub-sector information
- `Stock` - Stock information
- `StockAnalysis` - Deep stock analysis results

See `/docs/database-schema.md` for complete schema.

### Transaction Handling

Workers use Prisma transactions for atomic updates:

```typescript
await prisma.$transaction([
  prisma.stockAnalysis.update({ ... }),
  prisma.jobStatus.update({ ... }),
]);
```

## Redis Configuration

### Connection

Set `REDIS_URL` environment variable:

```bash
# Local development
REDIS_URL=redis://localhost:6379

# Production with auth
REDIS_URL=redis://:password@host:6379
```

### Queue Cleanup

Jobs are automatically cleaned up:

- **Completed jobs**: Keep last 100, max 24 hours
- **Failed jobs**: Keep last 200, max 7 days

Manual cleanup:

```typescript
import { cleanupOldJobs } from '@/lib/queue';

// Clean up jobs older than 30 days
await cleanupOldJobs(30);
```

## Testing

### Unit Tests

```bash
npm test -- queue
```

### Integration Tests

```bash
# Start Redis and PostgreSQL
docker-compose up -d

# Run integration tests
npm run test:integration
```

### Manual Testing

```typescript
// Add test job
const job = await sectorResearchQueue.add('test-job', {
  sectorAnalysisId: 'test123',
  userId: 'testuser',
  sectorName: 'Test Sector',
});

// Monitor job
const jobState = await job.getState();
const progress = await job.progress;
```

## Monitoring & Debugging

### Queue UI (BullBoard)

Add BullBoard for visual queue monitoring:

```bash
npm install @bull-board/express @bull-board/api
```

### Logging

Workers log to console with structured format:

- `✓` = Success
- `✗` = Failure
- `→` = Action/Queue

Example:
```
✓ Sector research job abc123 completed for Technology
→ Queued stock analysis job def456 for Apple Inc.
✗ Stock analysis job ghi789 failed: Rate limit exceeded
```

### Health Checks

```typescript
import { queues } from '@/lib/queue';

// Check queue health
const health = await sectorResearchQueue.getJobCounts();
console.log(health); // { waiting: 5, active: 2, completed: 100, failed: 3 }
```

## Best Practices

1. **Always track jobs in database** - Use `createJobStatus()` when adding jobs
2. **Update progress regularly** - Help users track long-running jobs
3. **Use unique job IDs** - Prevent duplicate jobs with `jobId` option
4. **Handle errors gracefully** - Use `classifyError()` for proper retry logic
5. **Monitor queue sizes** - Set up alerts for queue backlogs
6. **Test retry behavior** - Ensure errors are classified correctly
7. **Use transactions** - Keep database updates atomic
8. **Clean up old jobs** - Prevent Redis memory issues

## Troubleshooting

### Jobs Not Processing

1. Check Redis connection:
   ```bash
   redis-cli ping
   ```

2. Verify workers are running:
   ```bash
   ps aux | grep startWorkers
   ```

3. Check queue status:
   ```typescript
   const counts = await sectorResearchQueue.getJobCounts();
   ```

### High Failure Rate

1. Check error logs in database:
   ```sql
   SELECT * FROM "JobStatus" WHERE status = 'failed' ORDER BY "updatedAt" DESC;
   ```

2. Review error classifications:
   ```typescript
   const failed = await getJobsByRelatedId(id);
   console.log(failed.filter(j => j.status === 'failed'));
   ```

### Rate Limiting Issues

1. Adjust queue rate limits in `config.ts`
2. Reduce worker concurrency
3. Add delays between job additions

### Memory Issues

1. Clean up old jobs:
   ```typescript
   await cleanupOldJobs(7);
   ```

2. Reduce `removeOnComplete` counts in `config.ts`
3. Monitor Redis memory usage

## Future Improvements

- [ ] Add BullBoard UI for visual monitoring
- [ ] Implement job priority based on user subscription
- [ ] Add webhook notifications for job completion
- [ ] Implement job cancellation
- [ ] Add metrics collection (Prometheus)
- [ ] Implement circuit breaker for API calls
- [ ] Add job dependencies (BullMQ Pro)

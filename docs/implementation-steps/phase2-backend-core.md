**Task for Claude Code:***"Set up the job queue system with BullMQ. Create separate queues for: sector research, stock analysis, judge review, and formatting. Include worker files for each job type, error handling, and retry logic. Add a job status tracking system that stores job metadata in the database."*

**What this creates:**

- `/src/lib/queue/queues.ts` - Queue definitions
- `/src/lib/queue/workers/sectorResearch.ts` - Sector research worker
- `/src/lib/queue/workers/stockAnalysis.ts` - Stock analysis worker
- `/src/lib/queue/workers/judgeReview.ts` - Judge worker
- `/src/lib/queue/workers/formatInsights.ts` - Formatting worker
- `/src/lib/queue/jobTracker.ts` - Job status utilities
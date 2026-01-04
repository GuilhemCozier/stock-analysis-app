**Task for Claude Code:**
```python
Create Next.js 14 API routes with App Router that integrate the job queue system with the frontend. Include Zod validation, Prisma database operations, BullMQ job triggering, and SSE streaming.

**Requirements:**

1. **POST /api/analysis/start** - Start sector analysis
   - Validate input: { sectorName: string }
   - Create SectorAnalysis record (status: "in_progress")
   - Create JobStatus record for tracking
   - Trigger sectorResearchQueue.add() job
   - Return: { id, status, message }

2. **GET /api/analysis/[id]** - Get analysis status and data
   - Fetch SectorAnalysis with all subSectors and stocks
   - Include job progress from JobStatus
   - Return complete analysis tree structure

3. **GET /api/analysis/[id]/stream** - SSE endpoint for real-time updates
   - Stream Server-Sent Events (SSE)
   - Query JobStatus for related jobs every 1-2 seconds
   - Send progress updates: { type, jobId, status, progress, data }
   - Handle connection cleanup

4. **POST /api/subsector/[id]/approve** - Approve sub-sector for deep analysis
   - Update SubSector status to "approved"
   - Trigger stockRankingQueue job (if needed)
   - Trigger top 5 stockAnalysisQueue jobs in parallel
   - Create JobStatus records for each
   - Return: { success, jobsCreated }

5. **GET /api/subsector/[id]/stocks** - Get stocks in sub-sector
   - Fetch SubSector with all stocks and their analyses
   - Include deepAnalysis with insights if available
   - Return ranked list

6. **GET /api/stock/[id]/analysis** - Get deep analysis for stock
   - Fetch Stock with StockAnalysis and insights
   - Return null if no analysis exists
   - Include formatted insights JSON

7. **POST /api/stock/[id]/reanalyze** - Trigger analysis for non-top-5 stock
   - Verify stock exists and doesn't already have analysis
   - Create StockAnalysis record
   - Trigger stockAnalysisQueue job
   - Return: { success, jobId }

**Technical Requirements:**

- Use Zod for all input validation (create schemas in /src/lib/validation/api.ts)
- Use Prisma client from @/lib/db for all database operations
- Import queues from @/lib/queue/config
- Follow Next.js 14 App Router patterns (route.ts files)
- Return proper HTTP status codes (200, 400, 404, 500)
- Include error handling with try/catch
- For SSE: Use proper headers (text/event-stream, no-cache)
- Log errors to console with context

**File Structure:**
- /src/app/api/analysis/start/route.ts
- /src/app/api/analysis/[id]/route.ts
- /src/app/api/analysis/[id]/stream/route.ts
- /src/app/api/subsector/[id]/approve/route.ts
- /src/app/api/subsector/[id]/stocks/route.ts
- /src/app/api/stock/[id]/analysis/route.ts
- /src/app/api/stock/[id]/reanalyze/route.ts
- /src/lib/validation/api.ts - Zod schemas for API requests

**Response Format:**
All non-SSE endpoints return JSON:
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "message" }

**SSE Event Format:**
`event: progress
data: {"type":"sector_research","jobId":"123","status":"active","progress":45}

event: complete
data: {"type":"sector_research","jobId":"123","status":"completed"}`
```

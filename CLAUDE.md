# Stock Analysis App

## Project Overview
A web application that uses AI to conduct deep financial sector analysis,
identifying and analyzing high-potential stocks across multiple sub-sectors.

## Tech Stack
- Next.js 14 (App Router) with TypeScript
- Prisma ORM + PostgreSQL
- BullMQ + Redis for job queues
- Anthropic API (Claude Sonnet 4.5) with web_search
- Tailwind CSS + shadcn/ui

## Current Status
Phase 3: Frontend UI components built, wiring backend to frontend in progress.

## Project Structure
```
/src
  /app
    /page.tsx              # Home page - start new sector analysis
    /database/page.tsx     # View all past analyses
    /sector/[id]/page.tsx  # View sector analysis with sub-sectors
    /subsector/[id]/page.tsx # View sub-sector with analyzed stocks
    /api
      /sector              # Sector analysis endpoints
      /subsector           # Sub-sector endpoints
      /stock               # Stock analysis endpoints
  /lib
    /queue                 # BullMQ queues and workers
    /ai                    # Anthropic API client and prompts
    /db                    # Prisma client and utilities
    /validation            # Zod schemas
    /design-system.md      # UI design system reference
  /components/ui           # Reusable UI components
```

## UI Development
When creating or modifying UI components, ALWAYS read `/src/lib/design-system.md` first and follow its patterns.

## API Routes
```
/api/analysis
  GET /list                - List all analyses (sector + stock) for sidebar

/api/sector
  POST /start              - Start new sector analysis
  GET /[id]                - Get sector analysis with sub-sectors and stocks
  GET /[id]/stream         - SSE for real-time job progress

/api/subsector
  POST /[id]/approve       - Approve sub-sector for deep analysis
  GET /[id]/stocks         - Get stocks in sub-sector

/api/stock
  GET /list                - List all stocks with completed analyses
  GET /[id]/analysis       - Get deep analysis for a stock
  POST /[id]/reanalyze     - Manually trigger stock reanalysis
```

## Key Architectural Decisions
- Async processing: All AI work happens in background jobs, not request/response
- Multi-agent workflow: research → judge → format pipeline
- SSE for real-time progress updates to frontend
- Large text storage in PostgreSQL (not Redis)

## Documentation
For detailed information, read the relevant files in `/docs`:
- `/docs/architecture.md` - Job queue flow, API structure, frontend routes
- `/docs/database-schema.md` - Complete Prisma schema
- `/docs/ai-prompts.md` - Prompt templates for each AI task
- `/docs/api-routes.md` - API endpoint specifications
- `/docs/job-queue-flow.md` - BullMQ queue and worker design

## Conventions
- Use Zod for all API input validation
- Store job metadata in database (JobStatus model) for persistence
- All AI functions should handle streaming and track token usage
- Error handling: retry up to 3 times for AI calls, log failures to database

## Environment Variables Required
- DATABASE_URL (PostgreSQL)
- REDIS_URL
- ANTHROPIC_API_KEY

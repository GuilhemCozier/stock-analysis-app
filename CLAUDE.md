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
Phase 2: Backend Core - Setting up job queue system

## Project Structure
```
/src
  /app              # Next.js app router pages and API routes
  /lib
    /queue          # BullMQ queues and workers
    /ai             # Anthropic API client and prompts
    /db             # Prisma client and utilities
    /validation     # Zod schemas
  /hooks            # React hooks for API interactions
  /components       # UI components
```

## Key Architectural Decisions
- Async processing: All AI work happens in background jobs, not request/response
- Multi-agent workflow: research → judge → format pipeline
- SSE for real-time progress updates to frontend
- Large text storage in PostgreSQL (not Redis)

## Documentation
For detailed information, read the relevant files in `/docs`:
- `/docs/implementation-steps/` - Folder with files detailing each phase and steps
- `/docs/project-overview.md` - More details on user flow
- `/docs/architecture.md` - Job queue flow and API structure
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
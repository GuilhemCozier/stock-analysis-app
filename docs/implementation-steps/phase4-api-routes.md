**Task for Claude Code:***"Create Next.js API routes for starting sector analysis, approving sub-sectors, and retrieving analysis data. Include input validation with Zod. Add an SSE endpoint that streams job progress updates to the frontend."*

**What this creates:**

- `/src/app/api/analysis/start/route.ts`
- `/src/app/api/analysis/[id]/route.ts`
- `/src/app/api/analysis/[id]/stream/route.ts`
- `/src/app/api/subsector/[id]/approve/route.ts`
- `/src/lib/validation/schemas.ts` - Zod schemas
**Initial setup:**

```
"Set up a Next.js 14 app with TypeScript, Tailwind, Prisma (PostgreSQL),
BullMQ (Redis), and the Anthropic SDK. Include proper TypeScript
configurations and project structure."

```

**Job queue:**

```
"Create a BullMQ job queue system with separate queues for sector research,
stock analysis, quality review, and formatting. Include worker files, error
handling, and retry logic. Store job status in the database using Prisma."

```

**AI integration:**

```
"Build Anthropic API client utilities for: (1) sector research with web_search,
(2) individual stock analysis, (3) quality review of analyses, and (4)
formatting raw analysis into structured JSON. Include streaming support and
error handling."

```

**API routes:**

```
"Create Next.js API routes for: starting sector analysis, retrieving analysis
status, approving sub-sectors for deep analysis, and getting stock analysis
data. Add Zod validation for inputs and an SSE endpoint for streaming progress."

```

**Authentication (if needed later):**

```
"Add authentication with Clerk. Protect all API routes and associate analyses
with user IDs. Add user dashboard showing past analyses."

```
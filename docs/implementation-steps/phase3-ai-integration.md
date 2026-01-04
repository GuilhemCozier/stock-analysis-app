**Task for Claude Code:**
*"Create AI client utilities for making Anthropic API calls. Include:

1. A function to run sector research with web_search enabled
2. A function to run individual stock deep analysis with web_search
3. A function to judge analysis quality
4. A function to format raw analysis into structured insights
Each function should handle streaming, error handling, and token usage tracking."*

**What this creates:**

- `/src/lib/ai/client.ts` - Anthropic API wrapper
- `/src/lib/ai/prompts.ts` - Prompt templates
- `/src/lib/ai/streaming.ts` - SSE streaming utilities

**Key prompt structure (for your reference):**

```tsx
// Sector research prompt
const SECTOR_RESEARCH_PROMPT = `
Analyze the ${sectorName} sector for investment opportunities.

Your task:
1. Identify 4-8 distinct sub-sectors within ${sectorName}
2. For each sub-sector, research 5-15 companies with strong growth potential
3. Provide preliminary analysis for each company (1-2 paragraphs)
4. Rank companies within each sub-sector based on potential ROI (5-10 year horizon)

Output format:
## Sub-sector: [Name]
Brief sub-sector overview...

### Company 1: [Name] ([Ticker if public])
Rank: 1/10
[Preliminary analysis]

### Company 2: [Name]
...
`;

// Deep stock analysis prompt
const STOCK_ANALYSIS_PROMPT = `
Conduct a comprehensive investment analysis of ${companyName}.

Research areas:
1. Business model and revenue streams
2. Competitive positioning and moat
3. Financial health (revenue growth, margins, cash flow)
4. Management quality and track record
5. Industry tailwinds/headwinds
6. Valuation (relative and absolute)
7. Key risks and risk mitigation
8. 5-10 year growth potential

Output a detailed 7-10 page analysis covering all areas above.
`;

// Judge prompt
const JUDGE_PROMPT = `
Review this stock analysis for quality:

${rawAnalysis}

Check for:
- Calculation errors or inconsistencies
- Unverifiable or implausible claims
- Missing critical information
- Failure to follow analysis structure

Output:
- APPROVED or REJECTED
- Specific issues found (if rejected)
- Confidence score (1-10)
`;

// Formatting prompt
const FORMAT_PROMPT = `
Extract structured insights from this analysis:

${approvedAnalysis}

Output JSON with:
{
  "summary": "2-3 sentence overview",
  "recommendation": "BUY | HOLD | AVOID",
  "confidence": 1-10,
  "keyMetrics": {
    "revenueGrowth": "X%",
    "profitMargin": "X%",
    ...
  },
  "strengths": ["...", "..."],
  "risks": ["...", "..."],
  "catalysts": ["...", "..."]
}
`;

```
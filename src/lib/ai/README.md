# AI Client Utilities

This module provides functions for making Anthropic API calls with Claude Sonnet 4.5.

## Features

- ✅ **Streaming support** - Real-time progress updates via callbacks
- ✅ **web_search integration** - Enabled for sector research and stock analysis
- ✅ **Error handling** - Automatic retries with exponential backoff (up to 3 attempts)
- ✅ **Token usage tracking** - Monitor input/output/total tokens for each call
- ✅ **Validation** - Zod schemas for input validation
- ✅ **Type safety** - Full TypeScript support with typed responses

## Functions

### 1. `runSectorResearch(sectorName, onProgress?)`

Conducts comprehensive sector analysis with web_search enabled.

**Parameters:**
- `sectorName` (string): The sector to analyze (e.g., "Technology", "Healthcare")
- `onProgress` (optional): Callback function called with each text chunk as it streams

**Returns:** `Promise<AIResult>`
- `content`: Full sector analysis text
- `tokenUsage`: Input, output, and total token counts
- `error`: Error message if the call failed

**Example:**
```typescript
import { runSectorResearch } from '@/lib/ai';

const result = await runSectorResearch('Technology', (chunk) => {
  console.log('Received:', chunk);
});

if (result.error) {
  console.error('Failed:', result.error);
} else {
  console.log('Analysis:', result.content);
  console.log('Tokens used:', result.tokenUsage.totalTokens);
}
```

---

### 2. `runStockAnalysis(params, onProgress?)`

Runs in-depth analysis of an individual stock with web_search enabled.

**Parameters:**
- `params.companyName` (string): Company name
- `params.ticker` (string | null): Stock ticker symbol (or null for private companies)
- `params.subSectorName` (string): Sub-sector classification
- `params.attemptNumber` (number, optional): Attempt number (1-3), defaults to 1
- `onProgress` (optional): Callback function for streaming

**Returns:** `Promise<AIResult>`

**Example:**
```typescript
import { runStockAnalysis } from '@/lib/ai';

const result = await runStockAnalysis({
  companyName: 'NVIDIA Corporation',
  ticker: 'NVDA',
  subSectorName: 'AI Chip Manufacturers',
  attemptNumber: 1,
});
```

---

### 3. `runJudgeReview(params)`

Reviews a stock analysis for quality and completeness.

**Parameters:**
- `params.companyName` (string): Company name
- `params.attemptNumber` (number): Which attempt this is (1-3)
- `params.rawAnalysis` (string): The analysis text to review

**Returns:** `Promise<AIResult>`
- `content`: Judge's decision (APPROVED/REJECTED) with feedback

**Example:**
```typescript
import { runJudgeReview } from '@/lib/ai';

const result = await runJudgeReview({
  companyName: 'NVIDIA Corporation',
  attemptNumber: 1,
  rawAnalysis: analysisText,
});

// Parse the judge's decision
const isApproved = result.content.includes('DECISION: APPROVED');
```

---

### 4. `runFormatInsights(params)`

Extracts structured JSON from approved analysis for dashboard display.

**Parameters:**
- `params.companyName` (string): Company name
- `params.approvedAnalysis` (string): The approved analysis text
- `params.judgeReview` (string): The judge's review

**Returns:** `Promise<AIResult<StructuredInsights>>`
- `content`: Parsed JSON object with structured insights

**Example:**
```typescript
import { runFormatInsights, type StructuredInsights } from '@/lib/ai';

const result = await runFormatInsights({
  companyName: 'NVIDIA Corporation',
  approvedAnalysis: analysisText,
  judgeReview: judgeText,
});

if (!result.error) {
  const insights: StructuredInsights = result.content;
  console.log('Recommendation:', insights.recommendation);
  console.log('Target Price:', insights.targetPrice);
  console.log('Summary:', insights.summary);
}
```

---

## Validation

All inputs can be validated using the provided Zod schemas:

```typescript
import { validateInput, sectorResearchSchema } from '@/lib/ai';

const validation = validateInput(sectorResearchSchema, {
  sectorName: 'Technology',
});

if (validation.success) {
  const data = validation.data; // Typed as SectorResearchInput
} else {
  console.error('Validation errors:', validation.errors);
}
```

**Available schemas:**
- `sectorResearchSchema`
- `stockAnalysisSchema`
- `judgeReviewSchema`
- `formatInsightsSchema`

---

## Error Handling

All functions include automatic retry logic with exponential backoff:
- Maximum 3 attempts
- Initial delay: 1 second
- Exponential backoff: 2x each retry

```typescript
const result = await runSectorResearch('Technology');

if (result.error) {
  // After 3 failed attempts
  console.error('All retries exhausted:', result.error);
}
```

---

## Environment Variables

Required:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Validate configuration:
```typescript
import { validateAnthropicConfig } from '@/lib/ai';

const config = validateAnthropicConfig();
if (!config.valid) {
  console.error(config.error);
}
```

---

## Token Usage

All functions return token usage statistics:

```typescript
const result = await runSectorResearch('Technology');

console.log('Input tokens:', result.tokenUsage.inputTokens);
console.log('Output tokens:', result.tokenUsage.outputTokens);
console.log('Total tokens:', result.tokenUsage.totalTokens);
```

**Typical token usage:**
- Sector research: ~15,000-20,000 tokens
- Stock analysis: ~12,000-16,000 tokens
- Judge review: ~2,000-4,000 tokens
- Format insights: ~1,000-2,000 tokens

---

## Type Definitions

### `AIResult<T = string>`
```typescript
interface AIResult<T = string> {
  content: T;
  tokenUsage: TokenUsage;
  error?: string;
}
```

### `TokenUsage`
```typescript
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
```

### `StructuredInsights`
See [client.ts](./client.ts) for the full type definition.

---

## Model Configuration

- **Model:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Max tokens:** 16,000 (sector/stock analysis), 4,000 (judge/format)
- **web_search:** Enabled for sector research and stock analysis (`web_search_20250305`)
- **web_search max uses:** 20 per request

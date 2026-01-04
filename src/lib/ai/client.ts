/**
 * AI Client Utilities
 *
 * Functions for making Anthropic API calls with:
 * - Streaming support
 * - Error handling and retries
 * - Token usage tracking
 * - web_search tool integration
 */

import Anthropic from '@anthropic-ai/sdk';
import type { WebSearchTool20250305 } from '@anthropic-ai/sdk/resources/messages';
import {
  getSectorResearchPrompt,
  getStockAnalysisPrompt,
  getJudgeReviewPrompt,
  getFormatInsightsPrompt,
} from './prompts';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Model configuration
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 16000;

/**
 * Token usage tracking
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Result type for AI functions
 */
export interface AIResult<T = string> {
  content: T;
  tokenUsage: TokenUsage;
  error?: string;
}

/**
 * Progress callback for streaming
 */
export type ProgressCallback = (chunk: string) => void;

/**
 * Helper function to run Anthropic API call with streaming support
 */
async function runAnthropicStream(
  prompt: string,
  options: {
    enableWebSearch?: boolean;
    onProgress?: ProgressCallback;
    maxTokens?: number;
  } = {}
): Promise<AIResult> {
  const { enableWebSearch = false, onProgress, maxTokens = MAX_TOKENS } = options;

  try {
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Configure tools (web_search if enabled)
    const tools: WebSearchTool20250305[] | undefined = enableWebSearch
      ? [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 20,
          },
        ]
      : undefined;

    // Create streaming message
    const stream = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      tools,
      stream: true,
    });

    // Process stream
    for await (const event of stream) {
      switch (event.type) {
        case 'message_start':
          // Track input tokens
          if (event.message.usage) {
            inputTokens = event.message.usage.input_tokens;
          }
          break;

        case 'content_block_delta':
          // Accumulate text content
          if (event.delta.type === 'text_delta') {
            const chunk = event.delta.text;
            fullContent += chunk;
            if (onProgress) {
              onProgress(chunk);
            }
          }
          break;

        case 'message_delta':
          // Track output tokens
          if (event.usage) {
            outputTokens = event.usage.output_tokens;
          }
          break;

        case 'message_stop':
          // Stream complete
          break;
      }
    }

    return {
      content: fullContent,
      tokenUsage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    };
  } catch (error) {
    console.error('Anthropic API error:', error);
    return {
      content: '',
      tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper function for retry logic
 */
async function withRetry<T>(
  fn: () => Promise<AIResult<T>>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<AIResult<T>> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await fn();

    if (!result.error) {
      return result;
    }

    lastError = result.error;

    // Don't retry on last attempt
    if (attempt < maxRetries) {
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      // Exponential backoff
      delayMs *= 2;
    }
  }

  // All retries failed
  return {
    content: '' as T,
    tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
}

/**
 * 1. SECTOR RESEARCH
 *
 * Runs comprehensive sector analysis with web_search enabled.
 * Identifies high-potential sub-sectors and companies.
 */
export async function runSectorResearch(
  sectorName: string,
  onProgress?: ProgressCallback
): Promise<AIResult> {
  console.log(`Starting sector research for: ${sectorName}`);

  const prompt = getSectorResearchPrompt({ sectorName });

  return withRetry(
    () =>
      runAnthropicStream(prompt, {
        enableWebSearch: true,
        onProgress,
        maxTokens: 16000,
      }),
    3
  );
}

/**
 * 2. STOCK DEEP ANALYSIS
 *
 * Runs in-depth analysis of an individual stock with web_search enabled.
 * Supports multiple attempts with variation.
 */
export async function runStockAnalysis(
  params: {
    companyName: string;
    ticker: string | null;
    subSectorName: string;
    attemptNumber?: number;
  },
  onProgress?: ProgressCallback
): Promise<AIResult> {
  const attemptNumber = params.attemptNumber || 1;

  console.log(
    `Starting stock analysis for: ${params.companyName} (attempt ${attemptNumber})`
  );

  const prompt = getStockAnalysisPrompt({
    ...params,
    attemptNumber,
  });

  return withRetry(
    () =>
      runAnthropicStream(prompt, {
        enableWebSearch: true,
        onProgress,
        maxTokens: 16000,
      }),
    3
  );
}

/**
 * 3. JUDGE ANALYSIS QUALITY
 *
 * Reviews a stock analysis for quality and completeness.
 * Returns approval/rejection decision with feedback.
 */
export async function runJudgeReview(params: {
  companyName: string;
  attemptNumber: number;
  rawAnalysis: string;
}): Promise<AIResult> {
  console.log(`Starting judge review for: ${params.companyName}`);

  const prompt = getJudgeReviewPrompt(params);

  // Judge doesn't need web_search
  return withRetry(
    () =>
      runAnthropicStream(prompt, {
        enableWebSearch: false,
        maxTokens: 4000,
      }),
    3
  );
}

/**
 * 4. FORMAT ANALYSIS TO STRUCTURED INSIGHTS
 *
 * Extracts structured JSON from approved analysis for dashboard display.
 */
export async function runFormatInsights(params: {
  companyName: string;
  approvedAnalysis: string;
  judgeReview: string;
}): Promise<AIResult<StructuredInsights>> {
  console.log(`Formatting insights for: ${params.companyName}`);

  const prompt = getFormatInsightsPrompt(params);

  const result = await withRetry(
    async () => {
      const rawResult = await runAnthropicStream(prompt, {
        enableWebSearch: false,
        maxTokens: 4000,
      });

      // Parse JSON from response
      if (rawResult.error) {
        return {
          ...rawResult,
          content: {} as StructuredInsights,
        };
      }

      try {
        // Extract JSON from response (may be wrapped in markdown code blocks)
        let jsonString = rawResult.content.trim();

        // Remove markdown code blocks if present
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(jsonString) as StructuredInsights;

        return {
          content: parsed,
          tokenUsage: rawResult.tokenUsage,
        };
      } catch (parseError) {
        console.error('Failed to parse JSON insights:', parseError);
        return {
          content: {} as StructuredInsights,
          tokenUsage: rawResult.tokenUsage,
          error: `JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        };
      }
    },
    3
  );

  return result;
}

/**
 * Type definitions for structured insights
 */
export interface StructuredInsights {
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  convictionScore: string;
  analysisConfidence: string;
  targetPrice: number | null;
  impliedAnnualReturn: string;
  priceRanges: {
    strongBuy: string | null;
    accumulate: string | null;
    fairValue: string;
    reduce: string | null;
    sell: string | null;
  };
  scenarios: {
    bull: { target: string; assumptions: string };
    base: { target: string; assumptions: string };
    bear: { target: string; assumptions: string };
  };
  summary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  opportunities: string[];
  risks: string[];
  catalysts: string[];
}

/**
 * Helper function to validate API key is configured
 */
export function validateAnthropicConfig(): { valid: boolean; error?: string } {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      valid: false,
      error: 'ANTHROPIC_API_KEY environment variable is not set',
    };
  }

  return { valid: true };
}

/**
 * Example Usage of AI Client Utilities
 *
 * This file demonstrates how to use the AI functions in a typical workflow.
 * DO NOT run this directly in production - it's for reference only.
 */

import {
  runSectorResearch,
  runStockAnalysis,
  runJudgeReview,
  runFormatInsights,
  validateAnthropicConfig,
  type StructuredInsights,
} from './index';

/**
 * Example 1: Sector Research
 */
async function exampleSectorResearch() {
  console.log('=== SECTOR RESEARCH EXAMPLE ===\n');

  // Validate config before making calls
  const config = validateAnthropicConfig();
  if (!config.valid) {
    console.error('Config error:', config.error);
    return;
  }

  // Run sector research with streaming progress
  const result = await runSectorResearch('Technology', (chunk) => {
    // This callback is called with each text chunk as it streams
    process.stdout.write(chunk);
  });

  if (result.error) {
    console.error('\nError:', result.error);
    return;
  }

  console.log('\n\n--- Analysis Complete ---');
  console.log('Total tokens:', result.tokenUsage.totalTokens);
  console.log('Input tokens:', result.tokenUsage.inputTokens);
  console.log('Output tokens:', result.tokenUsage.outputTokens);

  // Parse the result to extract sub-sectors and companies
  // (In real implementation, you'd save this to database)
  return result.content;
}

/**
 * Example 2: Stock Deep Analysis
 */
async function exampleStockAnalysis() {
  console.log('=== STOCK ANALYSIS EXAMPLE ===\n');

  const result = await runStockAnalysis(
    {
      companyName: 'NVIDIA Corporation',
      ticker: 'NVDA',
      subSectorName: 'AI Chip Manufacturers',
      attemptNumber: 1,
    },
    (chunk) => {
      process.stdout.write(chunk);
    }
  );

  if (result.error) {
    console.error('\nError:', result.error);
    return;
  }

  console.log('\n\n--- Analysis Complete ---');
  console.log('Tokens used:', result.tokenUsage.totalTokens);

  return result.content;
}

/**
 * Example 3: Judge Review
 */
async function exampleJudgeReview(rawAnalysis: string) {
  console.log('=== JUDGE REVIEW EXAMPLE ===\n');

  const result = await runJudgeReview({
    companyName: 'NVIDIA Corporation',
    attemptNumber: 1,
    rawAnalysis,
  });

  if (result.error) {
    console.error('Error:', result.error);
    return;
  }

  console.log(result.content);
  console.log('\n--- Review Complete ---');
  console.log('Tokens used:', result.tokenUsage.totalTokens);

  // Check if approved
  const isApproved = result.content.includes('DECISION: APPROVED');
  console.log('Approved:', isApproved);

  return {
    isApproved,
    reviewText: result.content,
  };
}

/**
 * Example 4: Format Insights
 */
async function exampleFormatInsights(
  approvedAnalysis: string,
  judgeReview: string
) {
  console.log('=== FORMAT INSIGHTS EXAMPLE ===\n');

  const result = await runFormatInsights({
    companyName: 'NVIDIA Corporation',
    approvedAnalysis,
    judgeReview,
  });

  if (result.error) {
    console.error('Error:', result.error);
    return;
  }

  const insights: StructuredInsights = result.content;

  console.log('Recommendation:', insights.recommendation);
  console.log('Conviction Score:', insights.convictionScore);
  console.log('Target Price:', insights.targetPrice);
  console.log('Summary:', insights.summary);
  console.log('\nKey Metrics:');
  insights.keyMetrics.forEach((metric) => {
    console.log(`  - ${metric.label}: ${metric.value} (${metric.sentiment})`);
  });

  console.log('\n--- Formatting Complete ---');
  console.log('Tokens used:', result.tokenUsage.totalTokens);

  return insights;
}

/**
 * Example 5: Complete Workflow
 *
 * This demonstrates the full flow from analysis to structured insights
 */
async function exampleCompleteWorkflow() {
  console.log('=== COMPLETE WORKFLOW EXAMPLE ===\n');

  try {
    // Step 1: Run stock analysis
    console.log('Step 1: Running stock analysis...\n');
    const analysisResult = await runStockAnalysis({
      companyName: 'NVIDIA Corporation',
      ticker: 'NVDA',
      subSectorName: 'AI Chip Manufacturers',
      attemptNumber: 1,
    });

    if (analysisResult.error) {
      throw new Error(`Analysis failed: ${analysisResult.error}`);
    }

    const rawAnalysis = analysisResult.content;
    console.log(`✓ Analysis complete (${analysisResult.tokenUsage.totalTokens} tokens)\n`);

    // Step 2: Judge review
    console.log('Step 2: Reviewing analysis...\n');
    const judgeResult = await runJudgeReview({
      companyName: 'NVIDIA Corporation',
      attemptNumber: 1,
      rawAnalysis,
    });

    if (judgeResult.error) {
      throw new Error(`Judge review failed: ${judgeResult.error}`);
    }

    const isApproved = judgeResult.content.includes('DECISION: APPROVED');
    console.log(`✓ Review complete (${judgeResult.tokenUsage.totalTokens} tokens)`);
    console.log(`  Decision: ${isApproved ? 'APPROVED' : 'REJECTED'}\n`);

    if (!isApproved) {
      console.log('Analysis was rejected. Would retry with attemptNumber: 2');
      return;
    }

    // Step 3: Format insights
    console.log('Step 3: Formatting insights...\n');
    const formatResult = await runFormatInsights({
      companyName: 'NVIDIA Corporation',
      approvedAnalysis: rawAnalysis,
      judgeReview: judgeResult.content,
    });

    if (formatResult.error) {
      throw new Error(`Format insights failed: ${formatResult.error}`);
    }

    console.log(`✓ Formatting complete (${formatResult.tokenUsage.totalTokens} tokens)\n`);

    const insights = formatResult.content;

    // Step 4: Display results
    console.log('=== FINAL RESULTS ===\n');
    console.log('Recommendation:', insights.recommendation);
    console.log('Conviction:', insights.convictionScore);
    console.log('Target Price:', insights.targetPrice);
    console.log('Implied Annual Return:', insights.impliedAnnualReturn);
    console.log('\nSummary:', insights.summary);

    // Total token usage
    const totalTokens =
      analysisResult.tokenUsage.totalTokens +
      judgeResult.tokenUsage.totalTokens +
      formatResult.tokenUsage.totalTokens;

    console.log('\n=== TOTAL TOKEN USAGE ===');
    console.log('Total tokens:', totalTokens);
    console.log(
      'Estimated cost (Claude Sonnet 4.5): $',
      ((totalTokens / 1_000_000) * 3).toFixed(4)
    ); // $3 per million tokens (approximate)

    return {
      rawAnalysis,
      judgeReview: judgeResult.content,
      insights,
      tokenUsage: {
        analysis: analysisResult.tokenUsage,
        judge: judgeResult.tokenUsage,
        format: formatResult.tokenUsage,
        total: totalTokens,
      },
    };
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

// Export examples for use in other files
export {
  exampleSectorResearch,
  exampleStockAnalysis,
  exampleJudgeReview,
  exampleFormatInsights,
  exampleCompleteWorkflow,
};

// Uncomment to run examples directly (for testing only)
// if (require.main === module) {
//   exampleCompleteWorkflow().catch(console.error);
// }

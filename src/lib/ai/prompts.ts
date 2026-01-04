/**
 * AI Prompt Templates
 *
 * This file contains all prompt templates for the different AI tasks:
 * - Sector research (with web_search)
 * - Individual stock deep analysis (with web_search)
 * - Quality review/judging
 * - Formatting raw analysis into structured insights
 */

interface SectorResearchParams {
  sectorName: string;
}

interface StockAnalysisParams {
  companyName: string;
  ticker: string | null;
  subSectorName: string;
  attemptNumber: number;
}

interface JudgeReviewParams {
  companyName: string;
  attemptNumber: number;
  rawAnalysis: string;
}

interface FormatInsightsParams {
  companyName: string;
  approvedAnalysis: string;
  judgeReview: string;
}

/**
 * SECTOR RESEARCH PROMPT
 * Used to identify high-potential sub-sectors and companies within a given sector
 */
export function getSectorResearchPrompt({ sectorName }: SectorResearchParams): string {
  return `You are a professional equity research analyst conducting sector-wide investment research.

Analyze the **${sectorName}** sector to identify the most promising investment opportunities for a 5-10 year investment horizon.

## Your Task
Focus your research on companies where you can find:
- Publicly available information (financial statements, analyst reports, news)
- Clear competitive positioning and moat characteristics
- Evidence of execution quality vs promises
- Structural tailwinds vs headwinds
- Strategic coherence (not just reactive moves)

You should aim to identify companies worth deep analysis, not conduct deep analysis yet.

1. **Identify 4-8 distinct sub-sectors** within ${sectorName}
   - Focus on sub-sectors with strong growth drivers
   - Consider current market trends and future catalysts

2. **For each sub-sector:**
   - Write a 2-3 paragraph overview explaining the investment opportunity
   - Research and identify 5-15 companies with high growth potential
   - Provide preliminary analysis for each company (1-2 paragraphs)
   - Rank companies 1-10 based on overall investment potential

3. **Research current as of ${new Date().getFullYear()}:**
   - Use web search to find recent news, financial data, and industry trends
   - Focus on factual, verifiable information
   - Cite specific metrics when available (revenue growth, market share, etc.)

## Output Format

For each sub-sector, use this exact structure:

---
## Sub-sector: [Name]

[2-3 paragraph overview of the sub-sector opportunity]

**Key Trends:**
- [Trend 1]
- [Trend 2]
- [Trend 3]

### Rank 1/10: [Company Name] ([Ticker if public])
[1-2 paragraph preliminary analysis covering: business model, competitive position, growth drivers, and why it ranks #1]

### Rank 2/10: [Company Name]
[Analysis...]

[Continue for all companies, ranked 1-10]
---

## Important Guidelines

- Be objective and fact-based
- Highlight both opportunities AND risks
- Use specific metrics and data points when available
- If a company is private, note "Private" instead of ticker
- Focus on long-term sustainable competitive advantages

## Output Completeness

For each sub-sector, you must provide:
- 2-3 paragraph overview (minimum 200 words)
- 5-15 companies ranked 1-10
- Each company: 1-2 substantive paragraphs (minimum 100 words each)

Do not artificially extend or compress your analysis. Write what's needed to be thorough.`;
}

/**
 * STOCK DEEP ANALYSIS PROMPT
 * Used for in-depth analysis of individual stocks
 */
export function getStockAnalysisPrompt({
  companyName,
  ticker,
  subSectorName,
  attemptNumber,
}: StockAnalysisParams): string {
  return `You are a senior equity research analyst preparing an in-depth investment report on **${companyName}** ${ticker ? `(${ticker})` : '(Private Company)'}.

This analysis is part of research on the **${subSectorName}** sub-sector. This is attempt #${attemptNumber}${attemptNumber > 1 ? ' - please vary your research approach and dig deeper into areas that may have been insufficient previously.' : ''}.

## Research Requirements

### Analytical Framework

Weight your analysis across these dimensions:
- **Business Quality (40%)**: Moat durability, unit economics, capital allocation, management, execution consistency
- **Industry Context (25%)**: Structural trends, competitive dynamics, disruption risks, regulatory environment
- **Financial Health (20%)**: Balance sheet strength, cash generation quality, performance through cycles
- **Valuation (15%)**: Historical ranges, peer comparison, multiple methodologies

This is a long-term investment analysis (5-10 year horizon). Prioritize depth over breadth.

### 1. Business Overview & Model
- Core business activities and revenue streams
- Products/services and customer segments
- Geographic presence and market positioning
- Recent strategic initiatives

### 2. Competitive Analysis
- Key competitors and market share
- Competitive advantages (moat analysis)
- Barriers to entry
- Threats from new entrants or substitutes

### 3. Financial Analysis
- Revenue growth trends (3-5 year history)
- Profitability metrics (gross margin, operating margin, net margin)
- Cash flow generation and quality of earnings
- Balance sheet strength (debt levels, liquidity)
- Key financial ratios vs peers

### 4. Management & Governance
- Leadership team background and track record
- Capital allocation decisions
- Insider ownership and alignment
- Corporate governance quality

### 5. Industry Dynamics & Market Opportunity
- Total addressable market (TAM) size and growth
- Industry tailwinds and headwinds
- Regulatory environment
- Technological disruption factors

### 6. Valuation Assessment
- Current valuation metrics (P/E, P/S, EV/EBITDA, etc.)
- Comparison to historical valuation ranges
- Peer valuation comparison
- DCF assumptions and fair value estimate (if enough data available)

### 7. Investment Thesis & Catalysts
- Bull case: key reasons to own the stock
- Near-term catalysts (6-12 months)
- Long-term growth drivers (5-10 years)

### 8. Risk Factors
- Company-specific risks
- Industry/sector risks
- Macroeconomic risks
- Risk mitigation strategies

### 9. Investment Synthesis

**Investment Thesis** (2-3 paragraphs)
- Core reason to own this business long-term
- Key risks that could invalidate the thesis
- Catalysts for value realization (6-12 months and 3-5 years)

**Base Case 5-Year Price Target**
- Conservative assumptions (not worst-case, but below-consensus where justified)
- Show methodology: key assumptions, exit multiple, sensitivity analysis
- Express as absolute price AND implied annual return

**Scenario Analysis**
- Bull case: [assumptions and target]
- Base case: [assumptions and target]
- Bear case: [assumptions and target]
- Probability weight if useful

**Conviction Assessment**
- Conviction Score (1-10): [score]
  - 1-3: Speculative/high uncertainty
  - 4-6: Moderate confidence, meaningful unknowns
  - 7-8: High confidence, limited uncertainties
  - 9-10: Exceptional confidence, clear visibility
- Explain what drives the score and what could change it

**Analysis Confidence (1-5)**
- Rate the quality/availability of data used
- Note specific gaps or limitations in your analysis
- Identify what you don't know or can't assess reliably


## Research Approach

- Prioritize PRIMARY sources: latest 10-K/10-Q filings, earnings call transcripts, investor presentations
- Use SECONDARY sources for context: recent news, analyst reports, industry research
- Weight qualitative factors (moat, management, culture) equally with quantitative metrics
- Focus on most recent information (${new Date().getFullYear()}) but analyze historical patterns
- Be explicit about assumptions and confidence levels throughout
- Identify execution consistency: does this company ship or just promise?
- Consider timing: early to something real vs late to something overhyped?
- Note any data gaps, limitations, or areas of uncertainty

## Output Completeness

Each of the 9 sections must be substantive and thorough:
- Sections 1-8: Cover all listed subsections with depth
- Section 9: Complete synthesis with all required components (thesis, scenarios, conviction scores)

Prioritize depth over breadth. Write until each section is genuinely complete, then move on.
Do not pad with filler. Do not cut corners to save tokens.

## Output Format

Write in a professional research report style with clear section headers. Use bullet points, tables, and structured formatting for readability. Include specific data points and calculations where relevant.`;
}

/**
 * JUDGE REVIEW PROMPT
 * Used to evaluate the quality of stock analysis before approval
 */
export function getJudgeReviewPrompt({
  companyName,
  attemptNumber,
  rawAnalysis,
}: JudgeReviewParams): string {
  return `You are a senior research director reviewing an analyst's stock report for quality assurance before publication.

## Report to Review

**Company:** ${companyName}
**Attempt:** ${attemptNumber}/3

${rawAnalysis}

## Your Evaluation Task

Thoroughly assess this analysis across these dimensions:

### 1. Completeness (Critical)
- Are all 8 required sections present and substantive?
- Is the analysis 7-10 pages worth of content?
- Are key areas adequately researched?

### 2. Factual Accuracy
- Are claims supported by evidence or clearly marked as estimates?
- Are calculations correct?
- Are comparisons to peers/industry reasonable?
- Any contradictions or inconsistencies?

### 3. Research Quality
- Is the analysis based on current information (${new Date().getFullYear()})?
- Are sources credible and specific?
- Is competitive analysis thorough?
- Is the financial analysis rigorous?

### 4. Investment Utility
- Does it provide actionable insights?
- Are risks and opportunities clearly articulated?
- Is the valuation assessment reasonable?
- Would this help an investor make a decision?

### 5. Critical Red Flags
- Unverifiable or implausible claims
- Missing critical risk factors
- Overly promotional tone (lack of objectivity)
- Superficial analysis (talking points only)

### 6. Investment Synthesis Quality
- Is there a clear, compelling investment thesis?
- Are price targets shown with methodology and assumptions?
- Is scenario analysis thoughtful and probability-weighted?
- Are conviction and confidence scores justified?
- Does the analyst identify what they don't know?


## Your Decision

Provide your evaluation in this format:

**DECISION:** [APPROVED or REJECTED]

**CONFIDENCE SCORE:** [1-10, where 10 = publication-ready]

**STRENGTHS:**
- [Strength 1]
- [Strength 2]

**ISSUES FOUND:** [If REJECTED]
- [Critical Issue 1 - be specific]
- [Critical Issue 2]

**GUIDANCE FOR RETRY:** [If REJECTED]
[1-2 sentences explaining what the analyst should focus on in the next attempt]

## Evaluation Standards

- **APPROVED**: Analysis is thorough, fact-based, and provides investment-grade insights. Minor improvements could be made but it's good enough.
- **REJECTED**: Significant gaps in research, factual issues, or superficial analysis that wouldn't help an investor. Needs material improvement.

Be tough but fair. We need high-quality research, not perfection.`;
}

/**
 * FORMAT INSIGHTS PROMPT
 * Used to extract structured data from approved analysis for dashboard display
 */
export function getFormatInsightsPrompt({
  companyName,
  approvedAnalysis,
  judgeReview,
}: FormatInsightsParams): string {
  return `You are extracting structured data from an approved investment analysis for display in a dashboard.

## Approved Analysis

**Company:** ${companyName}

${approvedAnalysis}

## Judge's Review

${judgeReview}

## Your Task

Extract key insights and format them into a structured JSON object matching this exact schema:

\`\`\`json
{
  "recommendation": "[Strong Buy|Buy|Hold|Sell|Strong Sell]",
  "convictionScore": "[1-10 with explanation]",
  "analysisConfidence": "[1-5 with data quality notes]",
  "targetPrice": "[number or null]",
  "impliedAnnualReturn": "[percentage over 5 years]",
  "priceRanges": {
    "strongBuy": "[price or null]",
    "accumulate": "[price range or null]",
    "fairValue": "[price range]",
    "reduce": "[price range or null]",
    "sell": "[price threshold or null]"
  },
  "scenarios": {
    "bull": { "target": "[price]", "assumptions": "[brief]" },
    "base": { "target": "[price]", "assumptions": "[brief]" },
    "bear": { "target": "[price]", "assumptions": "[brief]" }
  },
  "summary": "[2-3 sentence executive summary of the investment thesis]",
  "keyMetrics": [
    {
      "label": "[Metric name]",
      "value": "[Metric value with units]",
      "sentiment": "[positive|neutral|negative]"
    }
  ],
  "opportunities": [
    "[Specific growth opportunity 1]",
    "[Specific growth opportunity 2]",
    "[Specific growth opportunity 3]"
  ],
  "risks": [
    "[Specific risk factor 1]",
    "[Specific risk factor 2]",
    "[Specific risk factor 3]"
  ],
  "catalysts": [
    "[Near-term catalyst 1 with timeframe]",
    "[Near-term catalyst 2 with timeframe]",
    "[Near-term catalyst 3 with timeframe]"
  ]
}
\`\`\`

## Field Guidelines

- **recommendation**: Based on the overall investment thesis, valuation, and risk/reward
- **targetPrice**: Extract if mentioned in analysis, otherwise null
- **summary**: Distill the core investment thesis into 2-3 sentences
- **keyMetrics**: 4-8 most important financial/business metrics (revenue growth, margins, P/E ratio, market share, etc.)
- **opportunities**: 3-5 specific growth drivers or competitive advantages
- **risks**: 3-5 most significant risk factors
- **catalysts**: 3-5 near-term events that could drive stock performance (earnings, product launches, regulatory decisions, etc.)

Return ONLY the JSON object, no additional text.`;
}

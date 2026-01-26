/**
 * Test script to parse existing AI output without making another API call
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ParsedStock {
  rank: number;
  companyName: string;
  ticker: string | null;
  preliminaryNotes: string;
}

interface ParsedSubSector {
  name: string;
  shortDescription: string;
  summary: string;
  stocks: ParsedStock[];
}

interface ParsedOutput {
  executiveSummary: string;
  subSectors: ParsedSubSector[];
}

function parseAIOutput(content: string): ParsedOutput {
  const subSectors: ParsedSubSector[] = [];

  // Extract executive summary
  const execSummaryMatch = content.match(/##\s*Executive\s*Summary\s*\n([\s\S]*?)(?=\n---|\n##)/i);
  const executiveSummary = execSummaryMatch
    ? execSummaryMatch[1].trim().slice(0, 500)
    : '';

  const subSectorPattern = /##\s*Sub-sector\s*\d*:\s*(.+?)(?=\n)/gi;
  const subSectorMatches = [...content.matchAll(subSectorPattern)];

  console.log(`Found ${subSectorMatches.length} sub-sector headers`);

  for (let i = 0; i < subSectorMatches.length; i++) {
    const match = subSectorMatches[i];
    const subSectorName = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = subSectorMatches[i + 1]?.index ?? content.length;
    const subSectorContent = content.slice(startIndex, endIndex);

    // Extract headline
    const headlineMatch = subSectorContent.match(/\*\*Headline:\*\*\s*(.+?)(?=\n)/i);
    const shortDescription = headlineMatch
      ? headlineMatch[1].trim()
      : subSectorName;

    // Extract full summary
    const summaryMatch = subSectorContent.match(/(?:\*\*Headline:\*\*[^\n]*\n)?([\s\S]*?)(?=###\s*Rank)/);
    let summary = summaryMatch ? summaryMatch[1].trim() : '';
    summary = summary.replace(/^\*\*Headline:\*\*[^\n]*\n?/, '').trim();
    summary = summary.replace(/\*\*Key Trends:\*\*[\s\S]*?(?=\n\n|$)/, '').trim();

    const stockPattern = /###\s*Rank\s*(\d+)(?:\/\d+)?:\s*(.+?)(?:\s*\(([A-Za-z]{1,6}|Private)\))?\s*\n([\s\S]*?)(?=###\s*Rank|\n---|\n##|$)/gi;
    const stocks: ParsedStock[] = [];

    let stockMatch;
    while ((stockMatch = stockPattern.exec(subSectorContent)) !== null) {
      const rank = parseInt(stockMatch[1], 10);
      const companyName = stockMatch[2].trim();
      const tickerOrPrivate = stockMatch[3]?.trim();
      const ticker = tickerOrPrivate && tickerOrPrivate !== 'Private' ? tickerOrPrivate.toUpperCase() : null;
      const preliminaryNotes = stockMatch[4].trim().slice(0, 500);

      stocks.push({ rank, companyName, ticker, preliminaryNotes });
    }

    subSectors.push({
      name: subSectorName,
      shortDescription: shortDescription.slice(0, 200),
      summary: summary.slice(0, 2000),
      stocks,
    });
  }

  return { executiveSummary, subSectors };
}

async function main() {
  const analysis = await prisma.sectorAnalysis.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!analysis?.fullReport) {
    console.log('No report found');
    return;
  }

  console.log('Parsing existing report...\n');
  const parsed = parseAIOutput(analysis.fullReport);

  console.log(`\n=== RESULTS ===`);
  console.log(`Executive Summary: ${parsed.executiveSummary.slice(0, 150)}...`);
  console.log(`\nSub-sectors found: ${parsed.subSectors.length}`);
  for (const ss of parsed.subSectors) {
    console.log(`\n📁 ${ss.name}`);
    console.log(`   Headline: ${ss.shortDescription}`);
    console.log(`   Summary: ${ss.summary.slice(0, 100)}...`);
    console.log(`   Stocks: ${ss.stocks.length}`);
    for (const stock of ss.stocks.slice(0, 3)) {
      console.log(`     ${stock.rank}. ${stock.companyName} (${stock.ticker || 'Private'})`);
    }
    if (ss.stocks.length > 3) console.log(`     ... and ${ss.stocks.length - 3} more`);
  }

  await prisma.$disconnect();
}

main();

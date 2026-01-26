/**
 * Re-parse existing AI output and save to database
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
  summary: string;
  stocks: ParsedStock[];
}

function parseAIOutput(content: string): ParsedSubSector[] {
  const subSectors: ParsedSubSector[] = [];

  const subSectorPattern = /##\s*Sub-sector\s*\d*:\s*(.+?)(?=\n)/gi;
  const subSectorMatches = [...content.matchAll(subSectorPattern)];

  for (let i = 0; i < subSectorMatches.length; i++) {
    const match = subSectorMatches[i];
    const subSectorName = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = subSectorMatches[i + 1]?.index ?? content.length;
    const subSectorContent = content.slice(startIndex, endIndex);

    const summaryMatch = subSectorContent.match(/^([\s\S]*?)(?=###\s*Rank)/);
    const summary = summaryMatch
      ? summaryMatch[1].replace(/\*\*Key Trends:\*\*[\s\S]*?(?=\n\n|$)/, '').trim()
      : '';

    const stockPattern = /###\s*Rank\s*(\d+)(?:\/\d+)?:\s*(.+?)(?:\s*\(([A-Za-z]{1,6}|Private)\))?\s*\n([\s\S]*?)(?=###\s*Rank|\n---|\n##|$)/gi;
    const stocks: ParsedStock[] = [];

    let stockMatch;
    while ((stockMatch = stockPattern.exec(subSectorContent)) !== null) {
      const rank = parseInt(stockMatch[1], 10);
      const companyName = stockMatch[2].trim();
      const tickerOrPrivate = stockMatch[3]?.trim();
      const ticker = tickerOrPrivate && tickerOrPrivate !== 'Private' ? tickerOrPrivate.toUpperCase() : null;
      const preliminaryNotes = stockMatch[4].trim().slice(0, 2000);

      stocks.push({ rank, companyName, ticker, preliminaryNotes });
    }

    subSectors.push({
      name: subSectorName,
      summary: summary.slice(0, 2000),
      stocks,
    });
  }

  return subSectors;
}

async function main() {
  // Get the most recent analysis
  const analysis = await prisma.sectorAnalysis.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { subSectors: true },
  });

  if (!analysis?.fullReport) {
    console.log('No report found');
    return;
  }

  // Check if sub-sectors already exist
  if (analysis.subSectors.length > 0) {
    console.log(`Analysis already has ${analysis.subSectors.length} sub-sectors.`);
    console.log('Delete them first if you want to re-parse.');
    return;
  }

  console.log(`Re-parsing analysis: ${analysis.sectorName} (${analysis.id})\n`);
  const parsed = parseAIOutput(analysis.fullReport);

  console.log(`Found ${parsed.length} sub-sectors. Saving to database...\n`);

  let totalStocks = 0;
  for (const subSector of parsed) {
    const createdSubSector = await prisma.subSector.create({
      data: {
        sectorAnalysisId: analysis.id,
        name: subSector.name,
        summary: subSector.summary,
        status: 'pending',
      },
    });

    for (const stock of subSector.stocks) {
      await prisma.stock.create({
        data: {
          subSectorId: createdSubSector.id,
          companyName: stock.companyName,
          ticker: stock.ticker,
          rank: stock.rank,
          preliminaryNotes: stock.preliminaryNotes,
        },
      });
      totalStocks++;
    }

    console.log(`✓ ${subSector.name}: ${subSector.stocks.length} stocks`);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Created ${parsed.length} sub-sectors and ${totalStocks} stocks`);

  await prisma.$disconnect();
}

main();

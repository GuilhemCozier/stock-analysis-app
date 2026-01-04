```
// Core models

model SectorAnalysis {
  id            String   @id @default(cuid())
  userId        String   // who requested this analysis
  sectorName    String
  status        String   // "in_progress" | "completed" | "failed"

  // Broad sector report content
  fullReport    String   @db.Text  // Raw AI output

  subSectors    SubSector[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SubSector {
  id                String   @id @default(cuid())
  sectorAnalysisId  String
  sectorAnalysis    SectorAnalysis @relation(fields: [sectorAnalysisId], references: [id])

  name              String
  summary           String   @db.Text
  status            String   // "pending" | "approved" | "analyzing" | "completed"

  // Stocks identified in this sub-sector
  stocks            Stock[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Stock {
  id            String   @id @default(cuid())
  subSectorId   String
  subSector     SubSector @relation(fields: [subSectorId], references: [id])

  companyName   String
  ticker        String?
  rank          Int      // 1-10 ranking within sub-sector

  // Preliminary info from sector report
  preliminaryNotes  String   @db.Text

  // Deep analysis (only for top 5 stocks)
  deepAnalysis  StockAnalysis?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model StockAnalysis {
  id            String   @id @default(cuid())
  stockId       String   @unique
  stock         Stock    @relation(fields: [stockId], references: [id])

  status        String   // "pending" | "analyzing" | "review_failed" | "completed"

  // Raw AI outputs
  rawAnalysis   String   @db.Text  // 7-10 pages of deep analysis
  judgeReview   String   @db.Text  // Judge's assessment

  // Formatted insights (structured JSON)
  insights      Json     // Key metrics, risks, opportunities, recommendation

  // Retry tracking
  attemptCount  Int      @default(1)
  failureReason String?  @db.Text

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model JobStatus {
  id            String   @id @default(cuid())
  jobId         String   @unique  // BullMQ job ID
  jobType       String   // "sector_research" | "stock_analysis" | "judge_review"

  relatedId     String   // ID of SectorAnalysis, Stock, or StockAnalysis
  status        String   // "waiting" | "active" | "completed" | "failed"

  progress      Int      @default(0)  // 0-100
  errorMessage  String?  @db.Text

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

```
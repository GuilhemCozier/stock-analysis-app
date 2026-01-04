-- CreateTable
CREATE TABLE "SectorAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sectorName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fullReport" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectorAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSector" (
    "id" TEXT NOT NULL,
    "sectorAnalysisId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "subSectorId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "ticker" TEXT,
    "rank" INTEGER NOT NULL,
    "preliminaryNotes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAnalysis" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rawAnalysis" TEXT NOT NULL,
    "judgeReview" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobStatus" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockAnalysis_stockId_key" ON "StockAnalysis"("stockId");

-- CreateIndex
CREATE UNIQUE INDEX "JobStatus_jobId_key" ON "JobStatus"("jobId");

-- AddForeignKey
ALTER TABLE "SubSector" ADD CONSTRAINT "SubSector_sectorAnalysisId_fkey" FOREIGN KEY ("sectorAnalysisId") REFERENCES "SectorAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stock" ADD CONSTRAINT "Stock_subSectorId_fkey" FOREIGN KEY ("subSectorId") REFERENCES "SubSector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAnalysis" ADD CONSTRAINT "StockAnalysis_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

### Job Queue Flow

```
User Request
    ↓
[Create SectorAnalysis record] → Set status: "in_progress"
    ↓
[Queue: sector_research job]
    ↓
AI researches sector (5-10 min) → Streams progress via SSE
    ↓
[Save sector report] → Set status: "completed"
    ↓
[Create SubSector + Stock records] → All SubSectors status: "pending"
    ↓
User approves SubSector A
    ↓
[Queue: stock_ranking job] → Rank stocks 1-10 within SubSector A
    ↓
[Queue: stock_analysis jobs] → Create 5 parallel jobs for top 5 stocks
    ↓
Each stock analysis:
  - AI researches stock (7-10 min)
  - [Queue: judge_review job]
  - Judge approves/rejects
  - If rejected: retry with variation OR log failure
  - If approved: [Queue: format_insights job]
  - Save to database
    ↓
[Update SubSector status: "completed"]
    ↓
UI displays completed sub-sector → User approves next sub-sector

```

### API Routes Structure

```
/api/analysis
  POST /start              - Initiate sector analysis
  GET /[id]                - Get analysis status and data
  GET /[id]/stream         - SSE endpoint for real-time updates

/api/subsector
  POST /[id]/approve       - User approves sub-sector for analysis
  GET /[id]/stocks         - Get stocks in sub-sector

/api/stock
  GET /[id]/analysis       - Get deep analysis for a stock
  POST /[id]/reanalyze     - Manually trigger analysis for non-top-5 stock

/api/jobs
  GET /[id]/status         - Get job status (for debugging)

```
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
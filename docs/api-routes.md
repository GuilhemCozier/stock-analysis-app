```
/api/analysis
  GET /list                - List all analyses (sector + stock) for sidebar

/api/sector
  POST /start              - Initiate sector analysis
  GET /[id]                - Get analysis status and data tree
  GET /[id]/stream         - SSE endpoint for real-time updates

/api/subsector
  POST /[id]/approve       - User approves sub-sector for analysis
  GET /[id]/stocks         - Get stocks in sub-sector

/api/stock
  GET /list                - List all stocks with completed analyses
  GET /[id]/analysis       - Get deep analysis for a stock
  POST /[id]/reanalyze     - Manually trigger analysis for non-top-5 stock

```

**What we're building:** A web application that uses AI to conduct deep financial sector analysis, identifying and analyzing high-potential stocks across multiple sub-sectors.

**Core user flow:**

1. User enters a sector name (e.g., "Clean Energy")
2. AI researches and generates a broad sector report (5-10 min)
3. User selects which sub-sectors to analyze deeply
4. For each approved sub-sector, AI analyzes top 5 stocks individually (7-10 pages per stock)
5. Quality AI reviews each analysis before showing to user
6. User views formatted insights in the UI

**Key characteristics:**

- Asynchronous processing (users don't wait staring at screen)
- Streaming updates (progress shown in real-time)
- Large data volumes (15+ pages of text per stock)
- Multi-agent AI workflow (research → judge → format)
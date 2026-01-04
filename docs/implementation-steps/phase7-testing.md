**7.1 End-to-end test**

1. Submit a sector (try "Renewable Energy" first)
2. Verify streaming updates appear correctly
3. Check database records are created properly
4. Approve a sub-sector
5. Verify top 5 stocks get analyzed
6. Check judge approves good analyses
7. View formatted insights in UI

**7.2 Error handling test**

- What if AI returns malformed data?
- What if judge rejects multiple times?
- What if user closes browser mid-analysis?
- Test Redis/database disconnection scenarios

**7.3 Performance optimization**

- Add database indexes (Prisma)
- Optimize API response sizes
- Add caching where appropriate
- Monitor Anthropic API usage/costs
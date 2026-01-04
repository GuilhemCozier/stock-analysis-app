**6.1 Create API hooks**

```tsx
// Example: /src/hooks/useAnalysis.ts
export function useAnalysis(id: string) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  // SSE connection for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/analysis/${id}/stream`);
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      // Update UI based on progress
    };
    return () => eventSource.close();
  }, [id]);

  return { data, status };
}

```

**6.2 Wire up components**

- Sector form → POST to `/api/analysis/start`
- Display streaming progress from SSE
- Sub-sector approval → POST to `/api/subsector/[id]/approve`
- Stock analysis viewer → GET from `/api/stock/[id]/analysis`
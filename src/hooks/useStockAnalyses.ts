'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CompanyAnalysis } from '@/components/ui/DatabaseTable';

interface ApiResponse {
  success: boolean;
  data?: CompanyAnalysis[];
  error?: string;
}

/**
 * Hook to fetch stock analyses for the database table
 */
export function useStockAnalyses(sectorId?: string) {
  const [companies, setCompanies] = useState<CompanyAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockAnalyses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = sectorId
        ? `/api/stock/list?sectorId=${sectorId}`
        : '/api/stock/list';

      const response = await fetch(url);
      const json: ApiResponse = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch stock analyses');
      }

      setCompanies(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [sectorId]);

  useEffect(() => {
    fetchStockAnalyses();
  }, [fetchStockAnalyses]);

  return {
    companies,
    isLoading,
    error,
    refetch: fetchStockAnalyses,
  };
}

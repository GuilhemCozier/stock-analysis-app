'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RecentAnalysis } from '@/components/ui/Sidebar';

interface Analysis {
  id: string;
  name: string;
  type: 'sector' | 'stock';
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data?: Analysis[];
  error?: string;
}

/**
 * Hook to fetch all analyses (sector and stock) for sidebar display
 */
export function useRecentAnalyses() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/analysis/list');
      const json: ApiResponse = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch analyses');
      }

      setAnalyses(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Transform to RecentAnalysis format for Sidebar
  const recentAnalyses: RecentAnalysis[] = analyses.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    createdAt: new Date(a.createdAt),
  }));

  return {
    analyses,
    recentAnalyses,
    isLoading,
    error,
    refetch: fetchAnalyses,
  };
}

interface StartSectorResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    message: string;
  };
  error?: string;
}

/**
 * Hook to start a new sector analysis
 */
export function useStartSectorAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = useCallback(async (sectorName: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/sector/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sectorName }),
      });

      const json: StartSectorResponse = await response.json();

      if (!json.success) {
        throw new Error(json.error || 'Failed to start analysis');
      }

      return json.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    startAnalysis,
    isLoading,
    error,
  };
}

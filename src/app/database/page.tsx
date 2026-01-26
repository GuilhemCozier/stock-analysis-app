'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { DatabaseTable } from '@/components/ui/DatabaseTable';
import { useRecentAnalyses } from '@/hooks/useAnalyses';
import { useStockAnalyses } from '@/hooks/useStockAnalyses';

export default function DatabasePage() {
  const router = useRouter();
  const { recentAnalyses } = useRecentAnalyses();
  const { companies, isLoading, error } = useStockAnalyses();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <Sidebar recentAnalyses={recentAnalyses} onNavigate={handleNavigate} />

      <main className="flex-1 px-4 py-8 md:px-8 md:py-12">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900">
          Investment Analyses
        </h1>

        <div className="mt-6">
          {isLoading ? (
            <div className="text-neutral-500">Loading analyses...</div>
          ) : error ? (
            <div className="text-red-600">Error: {error}</div>
          ) : companies.length === 0 ? (
            <div className="text-neutral-500">
              No completed analyses yet. Start a sector analysis to see results here.
            </div>
          ) : (
            <DatabaseTable companies={companies} />
          )}
        </div>
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { ChatInputField } from '@/components/ui/ChatInputField';
import { useRecentAnalyses, useStartSectorAnalysis } from '@/hooks/useAnalyses';

export default function HomePage() {
  const router = useRouter();
  const { recentAnalyses } = useRecentAnalyses();
  const { startAnalysis, isLoading: isStarting } = useStartSectorAnalysis();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLaunch = async (input: string, analysisType: 'sector' | 'stock') => {
    if (analysisType === 'sector') {
      try {
        const result = await startAnalysis(input);
        if (result?.id) {
          router.push(`/sector/${result.id}`);
        }
      } catch (error) {
        console.error('Failed to start sector analysis:', error);
      }
    } else {
      // TODO: Implement individual stock analysis
      console.log('Stock analysis not yet implemented:', input);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        recentAnalyses={recentAnalyses}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-8 md:py-12">
        <div className="flex w-full max-w-2xl flex-col gap-8">
          {/* Title */}
          <h1 className="font-serif text-3xl font-semibold leading-tight text-neutral-900">
            What would you like to analyse?
          </h1>

          {/* Chat Input Field */}
          <ChatInputField onLaunch={handleLaunch} />
        </div>
      </main>
    </div>
  );
}

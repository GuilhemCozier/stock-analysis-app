/**
 * Sidebar component - Collapsible vertical navigation sidebar
 * Contains app name, main navigation actions, and recent analyses list
 */

'use client';

import * as React from 'react';
import { Plus, Factory, Store, PanelLeft } from 'lucide-react';
import { Button } from './Button';
import MenuItem from './MenuItem';
import { cn } from '@/lib/utils';

export interface RecentAnalysis {
  id: string;
  name: string;
  type: 'sector' | 'stock';
  createdAt: Date;
}

export interface SidebarProps {
  recentAnalyses?: RecentAnalysis[];
  onNavigate?: (path: string) => void;
}

const SIDEBAR_COLLAPSE_KEY = 'sidebar-collapsed';

export default function Sidebar({ recentAnalyses = [], onNavigate }: SidebarProps) {
  // Initialize collapse state from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      return stored === 'true';
    }
    return false;
  });

  const [isRecentsExpanded, setIsRecentsExpanded] = React.useState<boolean>(true);

  // Persist collapse state to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleRecents = () => {
    setIsRecentsExpanded((prev) => !prev);
  };

  // Sort recent analyses by createdAt (newest first)
  const sortedRecents = React.useMemo(() => {
    return [...recentAnalyses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [recentAnalyses]);

  return (
    <aside
      className={cn(
        'flex flex-col',
        'border-r border-neutral-200',
        'bg-neutral-50',
        'transition-all duration-300',
        isCollapsed ? 'w-fit' : 'w-[290px]'
      )}
      aria-label="Navigation sidebar"
    >
      {/* Top Row Section */}
      <div
        className={cn(
          'flex items-center',
          'transition-all duration-300',
          isCollapsed ? 'w-fit justify-center px-2 py-4' : 'w-full justify-between px-4 py-4'
        )}
      >
        {!isCollapsed && (
          <span className="font-sans text-xl font-semibold text-neutral-900">
            Valin
          </span>
        )}
        <Button
          variant="ghost"
          onClick={toggleCollapse}
          className="transition-all duration-300"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft/>
        </Button>
      </div>

      {/* Main Actions Section */}
      <nav 
        className="flex flex-col px-2"
        aria-label="Main navigation"
      >
        <div className={cn(isCollapsed && 'w-fit')}>
          <MenuItem
            leftIcon={Plus}
            leftText={!isCollapsed ? 'New Analysis' : undefined}
            onClick={() => onNavigate?.('/')}
          />
        </div>
        <div className={cn(isCollapsed && 'w-fit')}>
          <MenuItem
            leftIcon={Factory}
            leftText={!isCollapsed ? 'Sectors' : undefined}
            onClick={() => onNavigate?.('/sectors')}
          />
        </div>
        <div className={cn(isCollapsed && 'w-fit')}>
          <MenuItem
            leftIcon={Store}
            leftText={!isCollapsed ? 'Stocks' : undefined}
            onClick={() => onNavigate?.('/stocks')}
          />
        </div>
      </nav>

      {/* Recents Section - only shown when expanded */}
      {!isCollapsed && (
        <div className="flex flex-col px-2 mt-4">
          <MenuItem
            variant="MenuHeader"
            leftText="Recents"
            onClick={toggleRecents}
            expanded={isRecentsExpanded}
          />
          {isRecentsExpanded &&
            sortedRecents.map((analysis) => (
              <MenuItem
                key={analysis.id}
                leftText={analysis.name}
                onClick={() => onNavigate?.(`/${analysis.type}/${analysis.id}`)}
              />
            ))}
        </div>
      )}
    </aside>
  );
}
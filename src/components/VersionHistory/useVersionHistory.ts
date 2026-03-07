'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { VersionDataService } from '../../../lib/version-history/version-data-model';

export interface MergeMetadata {
  isMergeCommit: boolean;
  sourceBranchId: string;
  sourceBranchName: string;
  targetBranchId: string;
  mergedVersionIds: string[];
  conflictsResolved?: number;
}

export interface VersionHistoryItem {
  id: string;
  content: string;
  timestamp: Date;
  type: 'auto-save' | 'manual-save' | 'merge-commit';
  author: string;
  name?: string;
  contentHash?: string;
  mergeMetadata?: MergeMetadata;
}

export interface UseVersionHistoryOptions {
  documentId: string;
  pageSize?: number;
  showOnlySavePoints?: boolean;
  searchQuery?: string;
}

export interface UseVersionHistoryReturn {
  versions: VersionHistoryItem[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleFilter: () => void;
  setSearchQuery: (query: string) => void;
  
  // State
  showOnlySavePoints: boolean;
  searchQuery: string;
  totalCount: number;
}

export function useVersionHistory({
  documentId,
  pageSize = 50,
  showOnlySavePoints: initialShowOnlySavePoints = false,
  searchQuery: initialSearchQuery = ''
}: UseVersionHistoryOptions): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<VersionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [showOnlySavePoints, setShowOnlySavePoints] = useState(initialShowOnlySavePoints);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and search versions
  const filteredVersions = useMemo(() => {
    let filtered = versions;

    // Filter by type (show only save points)
    if (showOnlySavePoints) {
      filtered = filtered.filter(v => v.type === 'manual-save');
    }

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(v => 
        v.name?.toLowerCase().includes(query) ||
        v.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [versions, showOnlySavePoints, searchQuery]);

  // Load versions from the data service
  const loadVersions = useCallback(async (currentOffset: number = 0, replace: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual VersionDataService instance
      // For now, use mock data to match the existing test structure
      const mockVersions: VersionHistoryItem[] = [
        {
          id: 'v1',
          content: 'Original content for testing version preview functionality. This was the first draft of the document with basic content.',
          timestamp: new Date('2026-03-06T10:00:00Z'),
          type: 'auto-save',
          author: 'Test User',
          contentHash: 'abc123'
        },
        {
          id: 'v2',
          content: 'Updated content with more text for testing hover tooltips and preview functionality. This version includes additional details and improvements over the original draft.',
          timestamp: new Date('2026-03-06T11:00:00Z'),
          type: 'manual-save',
          author: 'Test User',
          name: 'First draft',
          contentHash: 'def456'
        },
        {
          id: 'v3',
          content: 'Latest version with final changes for testing the version preview system. This represents the most current state of the document with all recent modifications.',
          timestamp: new Date('2026-03-06T12:00:00Z'),
          type: 'manual-save',
          author: 'Test User', 
          name: 'Final version',
          contentHash: 'ghi789'
        },
        {
          id: 'v4',
          content: 'Auto-saved content from continued editing session.',
          timestamp: new Date('2026-03-06T12:15:00Z'),
          type: 'auto-save',
          author: 'Test User',
          contentHash: 'jkl012'
        },
        {
          id: 'v5',
          content: 'Another manual save point with significant changes.',
          timestamp: new Date('2026-03-06T13:00:00Z'),
          type: 'manual-save',
          author: 'Test User',
          name: 'Major revision',
          contentHash: 'mno345'
        }
      ];

      // Simulate pagination
      const start = currentOffset;
      const end = start + pageSize;
      const paginatedVersions = mockVersions.slice(start, end);

      if (replace) {
        setVersions(paginatedVersions);
        setTotalCount(mockVersions.length);
      } else {
        setVersions(prev => [...prev, ...paginatedVersions]);
      }

      setHasMore(end < mockVersions.length);
      setOffset(end);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Initial load
  useEffect(() => {
    loadVersions(0, true);
  }, [loadVersions]);

  // Load more versions (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await loadVersions(offset, false);
  }, [loading, hasMore, offset, loadVersions]);

  // Refresh versions
  const refresh = useCallback(async () => {
    setOffset(0);
    await loadVersions(0, true);
  }, [loadVersions]);

  // Toggle filter
  const toggleFilter = useCallback(() => {
    setShowOnlySavePoints(prev => !prev);
  }, []);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    versions: filteredVersions,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
    toggleFilter,
    setSearchQuery: updateSearchQuery,
    showOnlySavePoints,
    searchQuery,
    totalCount: filteredVersions.length
  };
}
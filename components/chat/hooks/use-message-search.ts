import { useState, useEffect, useCallback, useMemo } from 'react';
import { MatrixClient, MatrixEvent, EventType, Room } from 'matrix-js-sdk';
import { useMatrixClient } from '../../../matrix-client/lib/matrix/matrix-context';

export interface SearchResult {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  roomId: string;
  roomName?: string;
  snippet: string; // Highlighted content snippet
  context?: {
    before: SearchResult[];
    after: SearchResult[];
  };
  isEncrypted: boolean;
  eventType: string;
  score: number; // Relevance score (0-1)
}

export interface SearchFilters {
  rooms?: string[]; // Limit search to specific rooms
  senders?: string[]; // Limit search to specific senders
  dateFrom?: Date;
  dateTo?: Date;
  includeEncrypted?: boolean;
  messageTypes?: string[]; // Event types to include
  fileTypes?: string[]; // For media search
}

export interface SearchOptions {
  limit?: number;
  includeContext?: boolean; // Include surrounding messages
  contextSize?: number; // Number of messages before/after
  enableFuzzySearch?: boolean;
  highlightMatches?: boolean;
  searchInThreads?: boolean;
}

interface UseMessageSearchResult {
  results: SearchResult[];
  isSearching: boolean;
  hasMore: boolean;
  totalResults: number;
  error: string | null;
  search: (query: string, filters?: SearchFilters, options?: SearchOptions) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  getResultContext: (resultId: string) => Promise<SearchResult[]>;
}

/**
 * Hook for searching messages in Matrix rooms
 */
export function useMessageSearch(
  defaultFilters?: SearchFilters,
  defaultOptions?: SearchOptions
): UseMessageSearchResult {
  const client = useMatrixClient();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | undefined>();
  const [currentOptions, setCurrentOptions] = useState<SearchOptions | undefined>();
  const [nextBatch, setNextBatch] = useState<string | null>(null);

  // Process Matrix event into search result
  const processSearchResult = useCallback((
    event: MatrixEvent,
    query: string,
    options: SearchOptions = {}
  ): SearchResult | null => {
    if (!client) return null;

    const eventId = event.getId();
    const senderId = event.getSender();
    const roomId = event.getRoomId();

    if (!eventId || !senderId || !roomId) return null;

    const room = client.getRoom(roomId);
    if (!room) return null;

    // Get content
    const content = event.getContent();
    const isEncrypted = event.isEncrypted();
    const messageContent = isEncrypted ? event.getClearContent() : content;
    const body = messageContent?.body || '';

    if (!body) return null;

    // Calculate relevance score
    const queryWords = query.toLowerCase().split(/\s+/);
    const bodyLower = body.toLowerCase();
    let score = 0;

    queryWords.forEach(word => {
      if (bodyLower.includes(word)) {
        score += 1 / queryWords.length;
        // Boost score for exact matches
        if (bodyLower === word) score += 0.5;
        // Boost score for word boundaries
        const wordBoundary = new RegExp(`\\b${word}\\b`, 'i');
        if (wordBoundary.test(body)) score += 0.2;
      }
    });

    // Create snippet with highlighting
    let snippet = body;
    if (options.highlightMatches && score > 0) {
      queryWords.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        snippet = snippet.replace(regex, '**$1**');
      });
    }

    // Truncate snippet if too long
    if (snippet.length > 200) {
      const queryIndex = snippet.toLowerCase().indexOf(query.toLowerCase());
      if (queryIndex !== -1) {
        const start = Math.max(0, queryIndex - 50);
        const end = Math.min(snippet.length, queryIndex + query.length + 50);
        snippet = (start > 0 ? '...' : '') + 
                 snippet.slice(start, end) + 
                 (end < snippet.length ? '...' : '');
      } else {
        snippet = snippet.slice(0, 200) + '...';
      }
    }

    return {
      id: eventId,
      content: body,
      senderId,
      senderName: room.getMember(senderId)?.name || senderId,
      timestamp: event.getTs(),
      roomId,
      roomName: room.name || room.getCanonicalAlias() || roomId,
      snippet,
      isEncrypted,
      eventType: event.getType(),
      score
    };
  }, [client]);

  // Perform local search in room timelines
  const performLocalSearch = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult[]> => {
    if (!client || !query.trim()) return [];

    const {
      rooms = [],
      senders = [],
      dateFrom,
      dateTo,
      includeEncrypted = true,
      messageTypes = [EventType.RoomMessage]
    } = filters;

    const {
      limit = 50,
      enableFuzzySearch = false
    } = options;

    const searchResults: SearchResult[] = [];
    const roomsToSearch = rooms.length > 0 
      ? rooms.map(id => client.getRoom(id)).filter(Boolean) as Room[]
      : client.getRooms();

    for (const room of roomsToSearch) {
      try {
        // Get room timeline
        const timeline = room.getLiveTimeline();
        const events = timeline.getEvents();

        for (const event of events) {
          // Filter by event type
          if (!messageTypes.includes(event.getType())) continue;

          // Filter by encryption
          if (!includeEncrypted && event.isEncrypted()) continue;

          // Filter by sender
          if (senders.length > 0 && !senders.includes(event.getSender() || '')) continue;

          // Filter by date range
          const eventDate = new Date(event.getTs());
          if (dateFrom && eventDate < dateFrom) continue;
          if (dateTo && eventDate > dateTo) continue;

          // Process search result
          const result = processSearchResult(event, query, options);
          if (result && result.score > 0) {
            // Apply fuzzy search threshold
            if (!enableFuzzySearch && result.score < 0.3) continue;
            
            searchResults.push(result);
          }

          // Stop if we've hit the limit
          if (searchResults.length >= limit) break;
        }

        if (searchResults.length >= limit) break;
      } catch (err) {
        console.warn(`Failed to search in room ${room.roomId}:`, err);
      }
    }

    // Sort by relevance score, then by timestamp
    searchResults.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return b.timestamp - a.timestamp;
    });

    return searchResults.slice(0, limit);
  }, [client, processSearchResult]);

  // Perform server-side search (if available)
  const performServerSearch = useCallback(async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {},
    nextBatch?: string | null
  ): Promise<{ results: SearchResult[]; nextBatch?: string; totalResults: number }> => {
    if (!client || !query.trim()) return { results: [], totalResults: 0 };

    try {
      // Use Matrix search API if available
      const searchResult = await client.searchMessageText({
        query,
        keys: ['content.body'],
        room_events: {
          ...filters.rooms ? { rooms: filters.rooms } : {},
          next_batch: nextBatch || undefined
        }
      });

      const results: SearchResult[] = [];
      const searchHits = searchResult.search_categories?.room_events?.results || [];

      for (const hit of searchHits) {
        const event = new MatrixEvent(hit.result);
        const result = processSearchResult(event, query, options);
        if (result) {
          results.push(result);
        }
      }

      return {
        results,
        nextBatch: searchResult.search_categories?.room_events?.next_batch,
        totalResults: searchResult.search_categories?.room_events?.count || results.length
      };

    } catch (err) {
      console.warn('Server search failed, falling back to local search:', err);
      const localResults = await performLocalSearch(query, filters, options);
      return { results: localResults, totalResults: localResults.length };
    }
  }, [client, processSearchResult, performLocalSearch]);

  // Main search function
  const search = useCallback(async (
    query: string,
    filters: SearchFilters = defaultFilters || {},
    options: SearchOptions = defaultOptions || {}
  ) => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setCurrentQuery(query);
      setCurrentFilters(filters);
      setCurrentOptions(options);
      setNextBatch(null);

      const searchResult = await performServerSearch(query, filters, options);
      
      setResults(searchResult.results);
      setTotalResults(searchResult.totalResults);
      setHasMore(!!searchResult.nextBatch);
      setNextBatch(searchResult.nextBatch || null);

    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  }, [defaultFilters, defaultOptions, performServerSearch]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!currentQuery || !nextBatch || isSearching) return;

    try {
      setIsSearching(true);
      setError(null);

      const searchResult = await performServerSearch(
        currentQuery,
        currentFilters,
        currentOptions,
        nextBatch
      );

      setResults(prev => [...prev, ...searchResult.results]);
      setHasMore(!!searchResult.nextBatch);
      setNextBatch(searchResult.nextBatch || null);

    } catch (err) {
      console.error('Load more failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more results');
    } finally {
      setIsSearching(false);
    }
  }, [currentQuery, currentFilters, currentOptions, nextBatch, isSearching, performServerSearch]);

  // Get context around a search result
  const getResultContext = useCallback(async (resultId: string): Promise<SearchResult[]> => {
    const result = results.find(r => r.id === resultId);
    if (!result || !client) return [];

    try {
      const room = client.getRoom(result.roomId);
      if (!room) return [];

      const event = room.findEventById(resultId);
      if (!event) return [];

      // Get timeline and find event index
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();
      const eventIndex = events.findIndex(e => e.getId() === resultId);

      if (eventIndex === -1) return [];

      // Get context events
      const contextSize = currentOptions?.contextSize || 3;
      const contextEvents = events.slice(
        Math.max(0, eventIndex - contextSize),
        Math.min(events.length, eventIndex + contextSize + 1)
      );

      const contextResults: SearchResult[] = [];
      for (const contextEvent of contextEvents) {
        const contextResult = processSearchResult(contextEvent, currentQuery, {
          ...currentOptions,
          highlightMatches: false // Don't highlight in context
        });
        if (contextResult) {
          contextResults.push(contextResult);
        }
      }

      return contextResults;

    } catch (err) {
      console.error('Failed to get result context:', err);
      return [];
    }
  }, [results, client, currentQuery, currentOptions, processSearchResult]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setHasMore(false);
    setNextBatch(null);
    setError(null);
    setCurrentQuery('');
  }, []);

  return {
    results,
    isSearching,
    hasMore,
    totalResults,
    error,
    search,
    loadMore,
    clearResults,
    getResultContext
  };
}

/**
 * Hook for searching within a specific room
 */
export function useRoomSearch(
  roomId: string | null,
  defaultOptions?: SearchOptions
) {
  const roomFilters: SearchFilters = useMemo(() => ({
    rooms: roomId ? [roomId] : []
  }), [roomId]);

  return useMessageSearch(roomFilters, defaultOptions);
}

/**
 * Hook for recent searches
 */
export function useRecentSearches(maxHistory: number = 10) {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('matrix-recent-searches');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== query);
      const updated = [query, ...filtered].slice(0, maxHistory);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('matrix-recent-searches', JSON.stringify(updated));
      }
      
      return updated;
    });
  }, [maxHistory]);

  const removeSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== query);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('matrix-recent-searches', JSON.stringify(updated));
      }
      
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('matrix-recent-searches');
    }
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearHistory
  };
}
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMessageSearch, useRecentSearches, SearchResult, SearchFilters, SearchOptions } from './hooks/use-message-search';
import { useMatrixClient } from '../../matrix-client/lib/matrix/matrix-context';

interface MessageSearchProps {
  roomId?: string; // If provided, search only in this room
  onResultSelect?: (result: SearchResult) => void;
  onClose?: () => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showFilters?: boolean;
  showRecentSearches?: boolean;
  maxResults?: number;
}

interface SearchFiltersFormProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableRooms: Array<{ id: string; name: string }>;
  onClose: () => void;
}

// Search filters form component
const SearchFiltersForm: React.FC<SearchFiltersFormProps> = ({
  filters,
  onFiltersChange,
  availableRooms,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
    onClose();
  }, [localFilters, onFiltersChange, onClose]);

  const handleReset = useCallback(() => {
    const resetFilters: SearchFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  }, [onFiltersChange]);

  return (
    <div className="search-filters-form p-4 border-b bg-gray-50">
      <div className="filters-header flex justify-between items-center mb-4">
        <h3 className="font-semibold">Search Filters</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="filters-content space-y-4">
        {/* Room selection */}
        <div className="filter-group">
          <label className="block text-sm font-medium mb-2">Rooms</label>
          <select
            multiple
            value={localFilters.rooms || []}
            onChange={(e) => {
              const rooms = Array.from(e.target.selectedOptions, option => option.value);
              setLocalFilters(prev => ({ ...prev, rooms: rooms.length ? rooms : undefined }));
            }}
            className="w-full p-2 border rounded max-h-32"
          >
            {availableRooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Date range */}
        <div className="filter-group">
          <label className="block text-sm font-medium mb-2">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={localFilters.dateFrom?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setLocalFilters(prev => ({ ...prev, dateFrom: date }));
              }}
              className="flex-1 p-2 border rounded"
              placeholder="From"
            />
            <input
              type="date"
              value={localFilters.dateTo?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setLocalFilters(prev => ({ ...prev, dateTo: date }));
              }}
              className="flex-1 p-2 border rounded"
              placeholder="To"
            />
          </div>
        </div>

        {/* Message types */}
        <div className="filter-group">
          <label className="block text-sm font-medium mb-2">Message Types</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!localFilters.messageTypes || localFilters.messageTypes.includes('m.room.message')}
                onChange={(e) => {
                  const types = localFilters.messageTypes || ['m.room.message'];
                  if (e.target.checked) {
                    if (!types.includes('m.room.message')) {
                      setLocalFilters(prev => ({ 
                        ...prev, 
                        messageTypes: [...types, 'm.room.message'] 
                      }));
                    }
                  } else {
                    setLocalFilters(prev => ({ 
                      ...prev, 
                      messageTypes: types.filter(t => t !== 'm.room.message') 
                    }));
                  }
                }}
                className="mr-2"
              />
              Text messages
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.includeEncrypted !== false}
                onChange={(e) => {
                  setLocalFilters(prev => ({ ...prev, includeEncrypted: e.target.checked }));
                }}
                className="mr-2"
              />
              Encrypted messages
            </label>
          </div>
        </div>
      </div>

      <div className="filters-actions flex gap-2 mt-4">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Search result item component
interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onClick: () => void;
  showRoomName?: boolean;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  query,
  onClick,
  showRoomName = true
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  // Render snippet with markdown-style highlighting
  const renderSnippet = (snippet: string) => {
    const parts = snippet.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part.slice(2, -2)}
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      onClick={onClick}
      className="search-result-item p-3 border-b hover:bg-gray-50 cursor-pointer"
    >
      <div className="result-header flex justify-between items-start mb-2">
        <div className="result-meta flex items-center gap-2 text-sm text-gray-600">
          <span className="sender-name font-medium">{result.senderName}</span>
          {showRoomName && result.roomName && (
            <>
              <span>in</span>
              <span className="room-name font-medium">{result.roomName}</span>
            </>
          )}
          {result.isEncrypted && <span className="text-green-600">🔒</span>}
        </div>
        <span className="result-timestamp text-xs text-gray-500">
          {formatDate(result.timestamp)}
        </span>
      </div>

      <div className="result-content">
        <div className="result-snippet text-gray-800">
          {renderSnippet(result.snippet)}
        </div>
      </div>

      <div className="result-footer flex justify-between items-center mt-2 text-xs text-gray-500">
        <span className="relevance-score">
          Relevance: {Math.round(result.score * 100)}%
        </span>
        <span className="event-id font-mono">
          {result.id.slice(-8)}
        </span>
      </div>
    </div>
  );
};

// Main search component
export const MessageSearch: React.FC<MessageSearchProps> = ({
  roomId,
  onResultSelect,
  onClose,
  className = '',
  placeholder = "Search messages...",
  autoFocus = true,
  showFilters = true,
  showRecentSearches = true,
  maxResults = 50
}) => {
  const client = useMatrixClient();
  const [query, setQuery] = useState('');
  const [showFiltersForm, setShowFiltersForm] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(
    roomId ? { rooms: [roomId] } : {}
  );
  const [options] = useState<SearchOptions>({
    limit: maxResults,
    highlightMatches: true,
    includeContext: false
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    results,
    isSearching,
    hasMore,
    totalResults,
    error,
    search,
    loadMore,
    clearResults
  } = useMessageSearch(filters, options);

  const {
    recentSearches,
    addSearch,
    removeSearch,
    clearHistory
  } = useRecentSearches();

  // Get available rooms for filters
  const availableRooms = React.useMemo(() => {
    if (!client) return [];
    return client.getRooms().map(room => ({
      id: room.roomId,
      name: room.name || room.getCanonicalAlias() || room.roomId
    }));
  }, [client]);

  // Auto-focus search input
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle search
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearResults();
      return;
    }

    addSearch(searchQuery);
    await search(searchQuery, filters, options);
  }, [search, filters, options, addSearch, clearResults]);

  // Handle search input change with debouncing
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      handleSearch(value);
    }, 300);

    setSearchTimeout(timeout);
  }, [handleSearch, searchTimeout]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
      handleSearch(query);
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  }, [query, handleSearch, searchTimeout, onClose]);

  // Handle recent search click
  const handleRecentSearchClick = useCallback((recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  }, [handleSearch]);

  // Handle result click
  const handleResultClick = useCallback((result: SearchResult) => {
    onResultSelect?.(result);
  }, [onResultSelect]);

  const showRecentSearchesPanel = showRecentSearches && !query && recentSearches.length > 0;
  const showResults = query && (results.length > 0 || isSearching || error);

  return (
    <div className={`message-search flex flex-col h-full ${className}`}>
      {/* Search header */}
      <div className="search-header p-4 border-b">
        <div className="search-input-container flex gap-2">
          <div className="search-input flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  clearResults();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {showFilters && (
            <button
              onClick={() => setShowFiltersForm(!showFiltersForm)}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                Object.keys(filters).length > 0 ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              Filters
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search stats */}
        {showResults && (
          <div className="search-stats mt-2 text-sm text-gray-600">
            {isSearching ? (
              'Searching...'
            ) : error ? (
              <span className="text-red-500">Error: {error}</span>
            ) : (
              `${results.length} of ${totalResults} results`
            )}
          </div>
        )}
      </div>

      {/* Filters form */}
      {showFiltersForm && (
        <SearchFiltersForm
          filters={filters}
          onFiltersChange={setFilters}
          availableRooms={availableRooms}
          onClose={() => setShowFiltersForm(false)}
        />
      )}

      {/* Search content */}
      <div className="search-content flex-1 overflow-y-auto">
        {/* Recent searches */}
        {showRecentSearchesPanel && (
          <div className="recent-searches p-4">
            <div className="recent-header flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Recent Searches</h3>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
            
            <div className="recent-list space-y-1">
              {recentSearches.map((recentQuery, index) => (
                <div key={index} className="recent-item flex justify-between items-center">
                  <button
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="flex-1 text-left p-2 rounded hover:bg-gray-100 text-gray-700"
                  >
                    {recentQuery}
                  </button>
                  <button
                    onClick={() => removeSearch(recentQuery)}
                    className="p-1 text-gray-400 hover:text-gray-600 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {showResults && (
          <div className="search-results">
            {isSearching && results.length === 0 && (
              <div className="loading p-8 text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Searching messages...</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="results-list">
                {results.map(result => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    query={query}
                    onClick={() => handleResultClick(result)}
                    showRoomName={!roomId}
                  />
                ))}

                {/* Load more button */}
                {hasMore && (
                  <div className="load-more p-4 text-center border-t">
                    <button
                      onClick={loadMore}
                      disabled={isSearching}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      {isSearching ? 'Loading...' : 'Load More Results'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {query && results.length === 0 && !isSearching && !error && (
              <div className="no-results p-8 text-center">
                <p className="text-gray-600 mb-2">No messages found</p>
                <p className="text-sm text-gray-500">Try different keywords or adjust your filters</p>
              </div>
            )}

            {error && (
              <div className="error p-8 text-center">
                <p className="text-red-500 mb-2">{error}</p>
                <button
                  onClick={() => handleSearch(query)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Retry Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSearch;
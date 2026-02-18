'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ServerDiscoveryService, PublicServer, SearchOptions, SearchResults } from '@/lib/matrix/server-discovery';
import { ServerPreview } from './server-preview';
import { useMatrixClient } from '@/lib/matrix/matrix-context'; // Assuming this exists

const TOPICS = [
  'Technology', 'Gaming', 'Art', 'Music', 'Education', 
  'Programming', 'Science', 'Books', 'Movies', 'Sports',
  'Language Exchange', 'General', 'Support'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 
  'Japanese', 'Russian', 'Portuguese', 'Arabic', 'Italian', 'Dutch'
];

const SORT_OPTIONS = [
  { value: 'members', label: 'Member Count' },
  { value: 'name', label: 'Name' },
  { value: 'recent', label: 'Recent Activity' },
  { value: 'topic', label: 'Topic' }
];

export function ServerDiscovery() {
  const matrixClient = useMatrixClient();
  const [discoveryService, setDiscoveryService] = useState<ServerDiscoveryService | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    servers: [],
    totalCount: 0,
    page: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false
  });
  
  // Search filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [minMembers, setMinMembers] = useState<number>(0);
  const [maxMembers, setMaxMembers] = useState<number | ''>('');
  
  // Sorting and pagination
  const [sortBy, setSortBy] = useState<'members' | 'recent' | 'name' | 'topic'>('members');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewServerId, setPreviewServerId] = useState<string | null>(null);

  useEffect(() => {
    if (matrixClient) {
      setDiscoveryService(new ServerDiscoveryService(matrixClient));
    }
  }, [matrixClient]);

  const performSearch = useCallback(async (page = 1) => {
    if (!discoveryService) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchOptions: SearchOptions = {
        searchTerm: searchTerm.trim() || undefined,
        topic: selectedTopic || undefined,
        language: selectedLanguage || undefined,
        minMemberCount: minMembers || undefined,
        maxMemberCount: maxMembers || undefined,
        sortBy,
        sortDirection,
        page,
        limit: pageSize
      };

      const results = await discoveryService.searchServers(searchOptions);
      setSearchResults(results);
      setCurrentPage(page);
    } catch (err: any) {
      setError('Failed to search servers. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [discoveryService, searchTerm, selectedTopic, selectedLanguage, minMembers, maxMembers, sortBy, sortDirection, pageSize]);

  const performSearchWithSort = useCallback(async (page = 1, newSortBy?: typeof sortBy, newSortDirection?: typeof sortDirection) => {
    if (!discoveryService) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchOptions: SearchOptions = {
        searchTerm: searchTerm.trim() || undefined,
        topic: selectedTopic || undefined,
        language: selectedLanguage || undefined,
        minMemberCount: minMembers || undefined,
        maxMemberCount: maxMembers || undefined,
        sortBy: newSortBy || sortBy,
        sortDirection: newSortDirection || sortDirection,
        page,
        limit: pageSize
      };

      const results = await discoveryService.searchServers(searchOptions);
      setSearchResults(results);
      setCurrentPage(page);
    } catch (err: any) {
      setError('Failed to search servers. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [discoveryService, searchTerm, selectedTopic, selectedLanguage, minMembers, maxMembers, sortBy, sortDirection, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(searchResults.totalCount / pageSize)) {
      performSearch(newPage);
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    let newSortDirection: 'asc' | 'desc' = 'desc';
    
    if (newSortBy === sortBy) {
      newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newSortDirection);
    } else {
      setSortBy(newSortBy);
      setSortDirection(newSortDirection);
    }
    setCurrentPage(1);
    
    // Call performSearch with the new values directly since state updates are async
    performSearchWithSort(1, newSortBy, newSortDirection);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTopic('');
    setSelectedLanguage('');
    setMinMembers(0);
    setMaxMembers('');
    setSortBy('members');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  // Load initial results
  useEffect(() => {
    if (discoveryService) {
      performSearch();
    }
  }, [discoveryService]);

  const totalPages = Math.ceil(searchResults.totalCount / pageSize);

  return (
    <div className="server-discovery">
      <div className="server-discovery-header">
        <h1>Explore Servers</h1>
        <p>Discover and join public Matrix servers that match your interests</p>
      </div>

      {/* Search and Filter Section */}
      <div className="server-discovery-filters">
        <div className="search-row">
          <div className="search-input-container">
            <input 
              type="text"
              placeholder="Search servers by name, topic, or alias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button 
              onClick={handleSearch}
              disabled={isLoading}
              className="search-button"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="filter-row">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="filter-select"
          >
            <option value="">All Topics</option>
            {TOPICS.map(topic => (
              <option key={topic} value={topic.toLowerCase()}>{topic}</option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="filter-select"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang.toLowerCase()}>{lang}</option>
            ))}
          </select>

          <div className="member-count-filter">
            <input
              type="number"
              placeholder="Min members"
              value={minMembers || ''}
              onChange={(e) => setMinMembers(Number(e.target.value) || 0)}
              min="0"
              className="member-input"
            />
            <input
              type="number"
              placeholder="Max members"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value ? Number(e.target.value) : '')}
              min="1"
              className="member-input"
            />
          </div>

          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Header with Sorting */}
      <div className="results-header">
        <div className="results-info">
          {searchResults.totalCount > 0 && (
            <span>{searchResults.totalCount} servers found</span>
          )}
        </div>

        <div className="sort-controls">
          <span>Sort by:</span>
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value as typeof sortBy)}
              className={`sort-button ${sortBy === option.value ? 'active' : ''}`}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="sort-direction">
                  {sortDirection === 'desc' ? ' ↓' : ' ↑'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Server Results */}
      <div className="server-results">
        {isLoading ? (
          <div className="loading-state">
            <p>Loading servers...</p>
          </div>
        ) : searchResults.servers.length === 0 ? (
          <div className="no-results">
            <p>No servers found matching your criteria.</p>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="server-grid">
            {searchResults.servers.map(server => (
              <ServerCard
                key={server.roomId}
                server={server}
                onPreview={() => setPreviewServerId(server.roomId)}
                discoveryService={discoveryService}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!searchResults.hasPrevious || isLoading}
            className="pagination-button"
          >
            Previous
          </button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isLoading}
                  className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!searchResults.hasNext || isLoading}
            className="pagination-button"
          >
            Next
          </button>

          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Server Preview Modal */}
      {previewServerId && (
        <ServerPreview
          roomId={previewServerId}
          discoveryService={discoveryService!}
          onClose={() => setPreviewServerId(null)}
        />
      )}
    </div>
  );
}

interface ServerCardProps {
  server: PublicServer;
  onPreview: () => void;
  discoveryService: ServerDiscoveryService | null;
}

function ServerCard({ server, onPreview, discoveryService }: ServerCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!discoveryService) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const result = await discoveryService.joinServer(server.roomId);
      if (result.success) {
        // TODO: Show success notification or redirect
        alert(`Successfully joined ${server.name}!`);
      } else {
        setJoinError(result.error || 'Failed to join server');
      }
    } catch (error) {
      setJoinError('Failed to join server');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="server-card">
      <div className="server-card-header">
        {server.avatarUrl && (
          <img 
            src={server.avatarUrl} 
            alt={`${server.name} avatar`}
            className="server-avatar"
          />
        )}
        <div className="server-info">
          <h3 className="server-name">{server.name}</h3>
          {server.canonicalAlias && (
            <p className="server-alias">{server.canonicalAlias}</p>
          )}
        </div>
      </div>

      <div className="server-card-body">
        <p className="server-topic">{server.topic || 'No description available'}</p>
        
        <div className="server-metadata">
          <div className="server-stats">
            <span className="member-count">{server.memberCount} members</span>
            {server.language && (
              <span className="server-language">{server.language}</span>
            )}
            {server.category && (
              <span className="server-category">{server.category}</span>
            )}
          </div>
        </div>

        {joinError && (
          <p className="join-error">{joinError}</p>
        )}
      </div>

      <div className="server-card-actions">
        <button 
          onClick={onPreview}
          className="preview-button"
        >
          Preview
        </button>
        <button 
          onClick={handleJoin}
          disabled={isJoining}
          className="join-button"
        >
          {isJoining ? 'Joining...' : 'Join'}
        </button>
      </div>
    </div>
  );
}
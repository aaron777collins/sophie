'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Users, Globe, MapPin, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { 
  MatrixServer, 
  ServerSearchFilters, 
  ServerDiscoveryResult,
  serverDiscovery 
} from '@/lib/matrix/server-discovery';

interface DiscoveryUIProps {
  onServerSelect?: (server: MatrixServer) => void;
  className?: string;
}

export default function DiscoveryUI({ onServerSelect, className = '' }: DiscoveryUIProps) {
  const [servers, setServers] = useState<MatrixServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServerSearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [serverHealth, setServerHealth] = useState<Map<string, boolean>>(new Map());

  const categories = useMemo(() => serverDiscovery.getServerCategories(), []);

  // Debounced search
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const searchServers = useCallback(async (newFilters: ServerSearchFilters, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const result: ServerDiscoveryResult = await serverDiscovery.searchServers(newFilters, pageNum, 20);
      
      if (append) {
        setServers(prev => [...prev, ...result.servers]);
      } else {
        setServers(result.servers);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch servers');
      if (!append) {
        setServers([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      const newFilters = { ...filters, query: value || undefined };
      setFilters(newFilters);
      searchServers(newFilters, 1, false);
    }, 300);
    
    setSearchDebounceTimer(timer);
  }, [filters, searchServers, searchDebounceTimer]);

  // Handle category selection
  const handleCategoryChange = useCallback((category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    
    const newFilters = { ...filters, category: newCategory || undefined };
    setFilters(newFilters);
    searchServers(newFilters, 1, false);
  }, [filters, selectedCategory, searchServers]);

  // Load more servers
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      searchServers(filters, page + 1, true);
    }
  }, [loading, hasMore, filters, page, searchServers]);

  // Check server health
  const checkServerHealth = useCallback(async (homeserver: string) => {
    try {
      const healthy = await serverDiscovery.checkServerHealth(homeserver);
      setServerHealth(prev => new Map(prev).set(homeserver, healthy));
    } catch (error) {
      setServerHealth(prev => new Map(prev).set(homeserver, false));
    }
  }, []);

  // Initial load
  useEffect(() => {
    searchServers({}, 1, false);
  }, [searchServers]);

  // Format user count
  const formatUserCount = (count?: number): string => {
    if (!count || count === 0) return 'Unknown';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Server item component
  const ServerItem: React.FC<{ server: MatrixServer }> = ({ server }) => {
    const [healthChecked, setHealthChecked] = useState(false);
    const isHealthy = serverHealth.get(server.homeserver);

    useEffect(() => {
      if (!healthChecked) {
        setHealthChecked(true);
        checkServerHealth(server.homeserver);
      }
    }, [server.homeserver, healthChecked, checkServerHealth]);

    return (
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onServerSelect?.(server)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            {server.avatar_url ? (
              <img 
                src={server.avatar_url} 
                alt={`${server.server_name} logo`}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {server.server_name}
                </h3>
                {isHealthy !== undefined && (
                  <div className="flex items-center">
                    {isHealthy ? (
                      <div title="Server is online">
                        <Wifi className="w-4 h-4 text-green-500" />
                      </div>
                    ) : (
                      <div title="Server appears offline">
                        <WifiOff className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {server.homeserver}
              </p>
            </div>
          </div>
          
          {server.website && (
            <a 
              href={server.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {server.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {server.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{formatUserCount(server.user_count)} users</span>
            </div>
            
            {server.country && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{server.country}</span>
              </div>
            )}
          </div>
        </div>

        {server.tags && server.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {server.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {server.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                +{server.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Matrix servers..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              showFilters || selectedCategory
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
          <button 
            onClick={() => searchServers(filters, 1, false)}
            className="mt-2 text-red-600 dark:text-red-400 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Server List */}
      <div className="space-y-4">
        {servers.map((server, index) => (
          <ServerItem key={`${server.homeserver}-${index}`} server={server} />
        ))}
      </div>

      {/* Loading States */}
      {loading && servers.length === 0 && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && servers.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && servers.length === 0 && !error && (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No servers found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or browse without filters.
          </p>
        </div>
      )}
    </div>
  );
}
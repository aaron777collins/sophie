/**
 * Not Found Component
 * 
 * Enhanced 404 page with search functionality and helpful navigation.
 * Provides user-friendly error handling for missing pages and resources.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Home, MessageSquare, Users, Settings, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface NotFoundProps {
  title?: string;
  description?: string;
  showSearch?: boolean;
  showRecentPages?: boolean;
  customActions?: Array<{
    label: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    external?: boolean;
  }>;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showSearch = true,
  showRecentPages = true,
  customActions = [],
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentPages, setRecentPages] = useState<Array<{ path: string; title: string; timestamp: number }>>([]);

  // Load recent pages from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('haos-recent-pages');
    if (stored) {
      try {
        const pages = JSON.parse(stored);
        setRecentPages(pages.slice(0, 5)); // Show only 5 most recent
      } catch (error) {
        console.error('Failed to parse recent pages:', error);
      }
    }
  }, []);

  /**
   * Common navigation suggestions
   */
  const navigationSuggestions = useMemo(() => [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      description: 'Go back to the main page'
    },
    {
      label: 'Chat',
      href: '/chat',
      icon: MessageSquare,
      description: 'Join conversations'
    },
    {
      label: 'Servers',
      href: '/servers',
      icon: Users,
      description: 'Browse communities'
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Manage your account'
    },
    ...customActions.map(action => ({
      ...action,
      description: `Go to ${action.label}`,
    }))
  ], [customActions]);

  /**
   * Filter navigation suggestions based on search query
   */
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return navigationSuggestions;
    
    const query = searchQuery.toLowerCase();
    return navigationSuggestions.filter(suggestion =>
      suggestion.label.toLowerCase().includes(query) ||
      suggestion.description.toLowerCase().includes(query)
    );
  }, [searchQuery, navigationSuggestions]);

  /**
   * Handle navigation to a page
   */
  const handleNavigate = (href: string, external = false) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  /**
   * Handle going back
   */
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  /**
   * Format recent page timestamp
   */
  const formatRecentPageTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        
        {/* Main Error Display */}
        <div className="mb-12">
          <div className="text-8xl font-bold text-gray-300 dark:text-gray-600 mb-4 select-none">
            404
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {description}
          </p>
          
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </button>
        </div>

        {/* Search Section */}
        {showSearch && (
          <div className="mb-12">
            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for a page or feature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtered Navigation Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {filteredSuggestions.map((suggestion, index) => {
                  const IconComponent = suggestion.icon || Home;
                  const isExternal = 'external' in suggestion && suggestion.external;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavigate(suggestion.href, isExternal)}
                      className="flex items-center p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                        <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {suggestion.label}
                          </h3>
                          {isExternal && (
                            <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery && filteredSuggestions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No matches found</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Try a different search term or browse the suggestions below
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Pages */}
        {showRecentPages && recentPages.length > 0 && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Pages
            </h2>
            
            <div className="space-y-2">
              {recentPages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigate(page.path)}
                  className="flex items-center justify-between w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {page.path}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 ml-3">
                    {formatRecentPageTime(page.timestamp)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!searchQuery && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleNavigate('/')}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </button>
            
            <button
              onClick={() => handleNavigate('/chat')}
              className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Chatting
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact support or check the{' '}
            <button
              onClick={() => handleNavigate('/help', false)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              help documentation
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
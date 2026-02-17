/**
 * Error Fallback Component
 * 
 * User-friendly error displays with context-aware messaging and recovery options.
 * Provides specialized error handling for different types of errors and contexts.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare, Settings, Copy, ChevronDown, ChevronUp, Wifi, WifiOff } from 'lucide-react';
import { errorReporter } from '../../lib/monitoring/error-reporter';
import type { ErrorFallbackProps } from './error-boundary';

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  level,
  name,
  enableRecovery,
  enableUserFeedback,
  context
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Get error type for specialized handling
   */
  const getErrorType = (): string => {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) return 'chunk';
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || !isOnline) return 'network';
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) return 'permission';
    if (errorName.includes('syntaxerror')) return 'syntax';
    if (errorName.includes('referenceerror')) return 'reference';
    if (errorMessage.includes('matrix') || context?.matrixRoomId) return 'matrix';
    
    return 'generic';
  };

  /**
   * Get context-aware error message and description
   */
  const getErrorContent = () => {
    const errorType = getErrorType();
    
    const content = {
      chunk: {
        title: 'Loading Error',
        description: 'Failed to load part of the application. This usually happens after an update.',
        suggestion: 'Try refreshing the page to load the latest version.',
        icon: RefreshCw,
        canRetry: true,
      },
      network: {
        title: isOnline ? 'Connection Error' : 'No Internet Connection',
        description: isOnline 
          ? 'Unable to connect to the server. Please check your internet connection.'
          : 'You appear to be offline. Please check your internet connection.',
        suggestion: isOnline 
          ? 'Try again in a moment, or check your network settings.'
          : 'Connect to the internet and try again.',
        icon: isOnline ? Wifi : WifiOff,
        canRetry: true,
      },
      permission: {
        title: 'Access Denied',
        description: 'You don\'t have permission to access this resource.',
        suggestion: 'Try logging in again or contact support if the problem persists.',
        icon: AlertTriangle,
        canRetry: false,
      },
      matrix: {
        title: 'Chat Error',
        description: 'Something went wrong with the chat system.',
        suggestion: 'Try refreshing the page or check your Matrix server connection.',
        icon: MessageSquare,
        canRetry: true,
      },
      syntax: {
        title: 'Application Error',
        description: 'A code error was encountered.',
        suggestion: 'This appears to be a bug. Please report it to help us fix it.',
        icon: AlertTriangle,
        canRetry: true,
      },
      reference: {
        title: 'Missing Component',
        description: 'A required component could not be found.',
        suggestion: 'Try refreshing the page or clearing your browser cache.',
        icon: AlertTriangle,
        canRetry: true,
      },
      generic: {
        title: 'Something went wrong',
        description: 'An unexpected error occurred.',
        suggestion: 'Try refreshing the page or contact support if the problem continues.',
        icon: AlertTriangle,
        canRetry: true,
      },
    };

    return content[errorType as keyof typeof content] || content.generic;
  };

  /**
   * Handle retry with visual feedback
   */
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Add a brief delay for visual feedback
    setTimeout(() => {
      resetError();
      setIsRetrying(false);
    }, 1000);
  };

  /**
   * Submit user feedback
   */
  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      await errorReporter.collectUserFeedback(feedback);
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  /**
   * Copy error details to clipboard
   */
  const copyErrorDetails = async () => {
    const details = `
Error: ${error.name}: ${error.message}
Boundary: ${name} (${level})
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(details);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  /**
   * Get quick actions based on error level and type
   */
  const getQuickActions = () => {
    const actions = [];
    const errorContent = getErrorContent();

    if (errorContent.canRetry && enableRecovery) {
      actions.push({
        label: isRetrying ? 'Retrying...' : retryCount > 0 ? `Try Again (${retryCount + 1})` : 'Try Again',
        onClick: handleRetry,
        primary: true,
        disabled: isRetrying,
        icon: RefreshCw,
      });
    }

    if (level === 'page' || level === 'app') {
      actions.push({
        label: 'Go Home',
        onClick: () => window.location.href = '/',
        primary: false,
        icon: Home,
      });
    }

    if (getErrorType() === 'network' && !isOnline) {
      actions.push({
        label: 'Check Connection',
        onClick: () => window.location.reload(),
        primary: false,
        icon: Wifi,
      });
    }

    return actions;
  };

  const errorContent = getErrorContent();
  const IconComponent = errorContent.icon;
  const quickActions = getQuickActions();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            getErrorType() === 'network' && !isOnline
              ? 'bg-orange-100 dark:bg-orange-900'
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            <IconComponent className={`w-8 h-8 ${
              getErrorType() === 'network' && !isOnline
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-red-600 dark:text-red-400'
            }`} />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {errorContent.title}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {errorContent.description}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {errorContent.suggestion}
          </p>

          {/* Connection status indicator */}
          {getErrorType() === 'network' && (
            <div className={`inline-flex items-center mt-4 px-3 py-1 rounded-full text-sm ${
              isOnline
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
              {isOnline ? 'Connected' : 'Offline'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6">
          {quickActions.length > 0 && (
            <div className="space-y-3 mb-6">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                    action.primary
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  } disabled:cursor-not-allowed`}
                >
                  {action.disabled && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {!action.disabled && <action.icon className="w-4 h-4 mr-2" />}
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* User feedback section */}
          {enableUserFeedback && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Help us improve
              </h3>
              
              {!feedbackSubmitted ? (
                <div className="space-y-3">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Describe what you were doing when this error occurred..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none h-20 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {feedback.length}/500
                    </span>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedback.trim()}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md disabled:cursor-not-allowed"
                    >
                      Send Feedback
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-8 h-8 mx-auto mb-2 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thank you for your feedback!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error details toggle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <span>Error Details</span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="font-medium">Error:</span> {error.name}: {error.message}
                  </div>
                  <div>
                    <span className="font-medium">Boundary:</span> {name} ({level})
                  </div>
                  {context?.feature && (
                    <div>
                      <span className="font-medium">Feature:</span> {context.feature}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Time:</span> {new Date().toLocaleString()}
                  </div>
                </div>
                
                <button
                  onClick={copyErrorDetails}
                  className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * @file Title Generator UI Component
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 */

'use client';

import React, { useState } from 'react';
import { useTitleGeneration } from '../../../lib/hooks/useTitleGeneration';
import { Platform, PLATFORM_CONFIGS, TitleSuggestion } from '../../types/ai-editing';

export interface TitleGeneratorProps {
  transcriptText: string;
  onTitleSelect?: (title: string) => void;
  className?: string;
}

export function TitleGenerator({ 
  transcriptText, 
  onTitleSelect,
  className = ''
}: TitleGeneratorProps) {
  const { result, loading, error, generateTitles, clearError } = useTitleGeneration();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  
  const handleGenerateTitles = () => {
    clearError();
    generateTitles({
      transcriptText,
      targetPlatform: selectedPlatform
    });
  };
  
  const handleSelectTitle = (suggestion: TitleSuggestion) => {
    setSelectedTitle(suggestion.title);
    onTitleSelect?.(suggestion.title);
  };
  
  const getPlatformStatus = (platform: Platform) => {
    return selectedPlatform === platform ? 'active' : 'inactive';
  };
  
  const getCharacterStatus = (title: string, platform: Platform) => {
    const config = PLATFORM_CONFIGS[platform];
    const count = title.length;
    const isOverLimit = count > config.maxLength;
    return { count, limit: config.maxLength, isOverLimit };
  };
  
  return (
    <div className={`title-generator ${className}`} data-testid="title-generator">
      <div className="mb-4">
        <button
          data-testid="generate-titles-button"
          onClick={handleGenerateTitles}
          disabled={loading || !transcriptText.trim()}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            loading || !transcriptText.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Titles'}
        </button>
      </div>
      
      {error && (
        <div 
          data-testid="ai-error-message"
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"
        >
          {error}
        </div>
      )}
      
      {result && (
        <div data-testid="title-suggestions" className="space-y-4">
          {/* Platform Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => (
              <button
                key={platform}
                data-testid={`platform-filter-${platform}`}
                onClick={() => setSelectedPlatform(platform as Platform)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {config.platform.charAt(0).toUpperCase() + config.platform.slice(1)}
                {selectedPlatform === platform && (
                  <span data-testid={`platform-active-${platform}`} className="sr-only">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Platform Description */}
          <div className="text-sm text-gray-600 mb-4">
            {PLATFORM_CONFIGS[selectedPlatform].description} 
            (max {PLATFORM_CONFIGS[selectedPlatform].maxLength} characters)
          </div>
          
          {/* Title Suggestions */}
          <div className="space-y-3">
            {result.suggestions && result.suggestions.length > 0 && result.suggestions.map((suggestion, index) => {
              const charStatus = getCharacterStatus(suggestion.title, selectedPlatform);
              
              return (
                <div
                  key={suggestion.id}
                  data-testid={`title-suggestion-${index}`}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedTitle === suggestion.title
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 flex-1 pr-4">
                      {suggestion.title}
                    </h3>
                    <button
                      data-testid="select-title-button"
                      onClick={() => handleSelectTitle(suggestion)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Select
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="capitalize">
                      {suggestion.category}
                    </span>
                    <span>
                      Score: {suggestion.engagementScore}
                    </span>
                    <span 
                      data-testid={`character-count-${index}`}
                      className={charStatus.isOverLimit ? 'text-red-600 font-medium' : ''}
                    >
                      {charStatus.count}/{charStatus.limit}
                      {charStatus.isOverLimit && ' (too long)'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Selection Feedback */}
          {selectedTitle && (
            <div 
              data-testid="selected-title-feedback"
              className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"
            >
              Title selected: "{selectedTitle}"
            </div>
          )}
          
          {/* Content Summary */}
          {result.contentSummary && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <h4 className="font-medium text-gray-900 mb-1">Content Summary</h4>
              <p className="text-sm text-gray-700">{result.contentSummary}</p>
              {result.detectedTopics.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Topics: </span>
                  {result.detectedTopics.map((topic, i) => (
                    <span key={topic} className="text-sm text-blue-600">
                      {topic}{i < result.detectedTopics.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
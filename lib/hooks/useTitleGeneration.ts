/**
 * @file React hook for AI title generation
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 */

import { useState, useCallback } from 'react';
import { TitleGenerationRequest, TitleGenerationResult } from '@/src/types/ai-editing';

export interface UseTitleGenerationReturn {
  result: TitleGenerationResult | null;
  loading: boolean;
  error: string | null;
  generateTitles: (request: TitleGenerationRequest) => Promise<void>;
  clearError: () => void;
  clearResult: () => void;
}

export function useTitleGeneration(): UseTitleGenerationReturn {
  const [result, setResult] = useState<TitleGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateTitles = useCallback(async (request: TitleGenerationRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Title generation failed (${response.status})`);
      }
      
      const titleResult = await response.json();
      setResult(titleResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Title generation failed';
      setError(errorMessage);
      console.error('Title generation error:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);
  
  return {
    result,
    loading,
    error,
    generateTitles,
    clearError,
    clearResult
  };
}
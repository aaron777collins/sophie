/**
 * @file Title Generator Panel for Editor
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 * 
 * This wrapper component integrates TitleGenerator into the editor page,
 * providing demo transcript text and handling title selection.
 */

'use client';

import React, { useState } from 'react';
import { TitleGenerator } from '../../src/components/ai/TitleGenerator';

interface TitleGeneratorPanelProps {
  initialTranscript?: string;
  onTitleSelect?: (title: string) => void;
}

export function TitleGeneratorPanel({ 
  initialTranscript = '',
  onTitleSelect 
}: TitleGeneratorPanelProps) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleSelect?.(title);
  };
  
  // Demo transcript for testing
  const demoTranscript = `Welcome to today's tutorial on making the perfect pasta. 
We'll explore traditional Italian techniques passed down through generations.
First, we start with high-quality semolina flour and fresh eggs.
The key is in the kneading - you want to develop that gluten for the perfect texture.
Let the dough rest for at least 30 minutes before rolling.
Today I'll show you my grandmother's secret sauce recipe too.`;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        AI Title Generator
      </h3>
      
      <div className="mb-4">
        <label 
          htmlFor="transcript-input" 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Transcript Text
        </label>
        <textarea
          id="transcript-input"
          data-testid="transcript-input"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Enter or paste your video transcript here..."
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setTranscript(demoTranscript)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Load demo transcript
        </button>
      </div>
      
      <TitleGenerator
        transcriptText={transcript}
        onTitleSelect={handleTitleSelect}
        className="mt-4"
      />
      
      {selectedTitle && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900">Selected Title</h4>
          <p className="text-blue-800 font-medium mt-1">{selectedTitle}</p>
        </div>
      )}
    </div>
  );
}

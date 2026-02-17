/**
 * Home Page Component
 * 
 * Main landing page for HAOS v2 application
 */

'use client';

import React from 'react';
import { PageErrorBoundary } from '../components/error/error-boundary';

export default function HomePage() {
  return (
    <PageErrorBoundary pageName="home">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            HAOS v2
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Matrix-powered chat application with comprehensive error reporting
          </p>
          
          {/* Error Reporting Test Button */}
          <button
            onClick={() => {
              throw new Error('Test error from home page');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Test Error Reporting
          </button>
        </div>
      </div>
    </PageErrorBoundary>
  );
}
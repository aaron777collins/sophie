'use client';

import React, { useEffect, createContext, useContext, useState } from 'react';

interface PerformanceTrackingContextType {
  isInitialized: boolean;
}

const PerformanceTrackingContext = createContext<PerformanceTrackingContextType | null>(null);

export function usePerformanceTracking() {
  const context = useContext(PerformanceTrackingContext);
  if (!context) {
    throw new Error('usePerformanceTracking must be used within a PerformanceTrackingProvider');
  }
  return context;
}

export function PerformanceTrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Dynamically import the performance monitor to avoid SSR issues
      import('@/lib/monitoring/performance').then(({ initializePerformanceMonitoring }) => {
        initializePerformanceMonitoring();
        setIsInitialized(true);
      });
    }
  }, []);

  const contextValue: PerformanceTrackingContextType = {
    isInitialized,
  };

  return (
    <PerformanceTrackingContext.Provider value={contextValue}>
      {children}
    </PerformanceTrackingContext.Provider>
  );
}
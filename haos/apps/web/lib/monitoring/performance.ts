/**
 * Performance monitoring and metrics collection system for HAOS
 * Tracks Web Vitals, Matrix API performance, and system resource usage
 */

import { MatrixClient } from 'matrix-js-sdk';

// Performance metrics interfaces
export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'LCP' | 'FID' | 'TTFB';
  value: number;
  timestamp: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface MatrixAPIMetric {
  endpoint: string;
  method: string;
  duration: number;
  timestamp: number;
  status: 'success' | 'error';
  errorMessage?: string;
  requestId: string;
}

export interface MemoryMetric {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface PerformanceSnapshot {
  webVitals: WebVitalsMetric[];
  matrixAPI: MatrixAPIMetric[];
  memory: MemoryMetric[];
  timestamp: number;
  sessionId: string;
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private matrixClient?: MatrixClient;
  private sessionId: string;
  private metrics: {
    webVitals: WebVitalsMetric[];
    matrixAPI: MatrixAPIMetric[];
    memory: MemoryMetric[];
  } = {
    webVitals: [],
    matrixAPI: [],
    memory: []
  };
  private observers: PerformanceObserver[] = [];
  private memoryMonitorInterval?: NodeJS.Timeout;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.startMemoryMonitoring();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize Web Vitals tracking using PerformanceObserver API
   */
  private initializeWebVitals() {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordWebVital({
            name: 'LCP',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            id: `lcp_${Date.now()}`,
            rating: this.rateWebVital('LCP', lastEntry.startTime)
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }

    // Track First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.recordWebVital({
              name: 'FCP',
              value: entry.startTime,
              timestamp: Date.now(),
              id: `fcp_${Date.now()}`,
              rating: this.rateWebVital('FCP', entry.startTime)
            });
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    } catch (error) {
      console.warn('FCP observer not supported:', error);
    }

    // Track Cumulative Layout Shift (CLS)
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        if (clsValue > 0) {
          this.recordWebVital({
            name: 'CLS',
            value: clsValue,
            timestamp: Date.now(),
            id: `cls_${Date.now()}`,
            rating: this.rateWebVital('CLS', clsValue)
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }

    // Track First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEventTiming[];
        entries.forEach(entry => {
          this.recordWebVital({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            id: `fid_${Date.now()}`,
            rating: this.rateWebVital('FID', entry.processingStart - entry.startTime)
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }

    // Track Time to First Byte (TTFB) via Navigation Timing
    try {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceNavigationTiming[];
        entries.forEach(entry => {
          const ttfb = entry.responseStart - entry.requestStart;
          this.recordWebVital({
            name: 'TTFB',
            value: ttfb,
            timestamp: Date.now(),
            id: `ttfb_${Date.now()}`,
            rating: this.rateWebVital('TTFB', ttfb)
          });
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    } catch (error) {
      console.warn('TTFB observer not supported:', error);
    }
  }

  /**
   * Rate Web Vital metrics according to Core Web Vitals thresholds
   */
  private rateWebVital(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'LCP': { good: 2500, poor: 4000 },
      'FCP': { good: 1800, poor: 3000 },
      'CLS': { good: 0.1, poor: 0.25 },
      'FID': { good: 100, poor: 300 },
      'TTFB': { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring() {
    if (typeof window === 'undefined' || typeof performance === 'undefined' || !('memory' in performance)) return;

    this.memoryMonitorInterval = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMemoryMetric({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
      }
    }, 10000); // Record every 10 seconds
  }

  /**
   * Set Matrix client for API monitoring
   */
  setMatrixClient(client: MatrixClient) {
    this.matrixClient = client;
    this.initializeMatrixAPIMonitoring();
  }

  /**
   * Initialize Matrix API performance monitoring
   */
  private initializeMatrixAPIMonitoring() {
    if (!this.matrixClient || typeof window === 'undefined' || typeof performance === 'undefined') return;

    // Wrap Matrix client HTTP requests to track performance
    const originalRequest = this.matrixClient.http.request;
    
    this.matrixClient.http.request = async (method: any, path: string, queryParams?: any, data?: any, opts?: any): Promise<any> => {
      const startTime = performance.now();
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const result = await originalRequest.call(this.matrixClient!.http, method, path, queryParams, data, opts);
        const duration = performance.now() - startTime;
        
        this.recordMatrixAPIMetric({
          endpoint: path,
          method: method.toUpperCase(),
          duration,
          timestamp: Date.now(),
          status: 'success',
          requestId
        });
        
        return result;
      } catch (error) {
        const duration = typeof performance !== 'undefined' ? performance.now() - startTime : 0;
        
        this.recordMatrixAPIMetric({
          endpoint: path,
          method: method.toUpperCase(),
          duration,
          timestamp: Date.now(),
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          requestId
        });
        
        throw error;
      }
    };
  }

  /**
   * Record a Web Vital metric
   */
  private recordWebVital(metric: WebVitalsMetric) {
    this.metrics.webVitals.push(metric);
    this.trimMetrics('webVitals', 100); // Keep last 100 web vital measurements
  }

  /**
   * Record a Matrix API metric
   */
  private recordMatrixAPIMetric(metric: MatrixAPIMetric) {
    this.metrics.matrixAPI.push(metric);
    this.trimMetrics('matrixAPI', 500); // Keep last 500 API calls
  }

  /**
   * Record a memory metric
   */
  private recordMemoryMetric(metric: MemoryMetric) {
    this.metrics.memory.push(metric);
    this.trimMetrics('memory', 288); // Keep last 48 hours at 10-second intervals
  }

  /**
   * Trim metrics arrays to prevent memory leaks
   */
  private trimMetrics(type: keyof typeof this.metrics, maxCount: number) {
    const currentMetrics = this.metrics[type];
    if (currentMetrics.length > maxCount) {
      if (type === 'webVitals') {
        this.metrics.webVitals = this.metrics.webVitals.slice(-maxCount);
      } else if (type === 'matrixAPI') {
        this.metrics.matrixAPI = this.metrics.matrixAPI.slice(-maxCount);
      } else if (type === 'memory') {
        this.metrics.memory = this.metrics.memory.slice(-maxCount);
      }
    }
  }

  /**
   * Get current performance metrics snapshot
   */
  getMetricsSnapshot(): PerformanceSnapshot {
    return {
      webVitals: [...this.metrics.webVitals],
      matrixAPI: [...this.metrics.matrixAPI],
      memory: [...this.metrics.memory],
      timestamp: Date.now(),
      sessionId: this.sessionId
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 300000;
    
    // Recent Matrix API stats
    const recentAPIMetrics = this.metrics.matrixAPI.filter(m => m.timestamp > fiveMinutesAgo);
    const apiStats = {
      totalRequests: recentAPIMetrics.length,
      successfulRequests: recentAPIMetrics.filter(m => m.status === 'success').length,
      errorRequests: recentAPIMetrics.filter(m => m.status === 'error').length,
      averageResponseTime: recentAPIMetrics.length > 0 
        ? recentAPIMetrics.reduce((sum, m) => sum + m.duration, 0) / recentAPIMetrics.length 
        : 0,
      slowestRequest: recentAPIMetrics.reduce((max, m) => m.duration > max.duration ? m : max, 
        { duration: 0, endpoint: '', method: '', timestamp: 0, status: 'success' as const, requestId: '' })
    };

    // Web Vitals stats
    const recentWebVitals = this.metrics.webVitals.filter(m => m.timestamp > oneMinuteAgo);
    const webVitalsStats = {
      'LCP': this.getLatestMetric('LCP'),
      'FCP': this.getLatestMetric('FCP'),
      'CLS': this.getLatestMetric('CLS'),
      'FID': this.getLatestMetric('FID'),
      'TTFB': this.getLatestMetric('TTFB')
    };

    // Memory stats
    const latestMemory = this.metrics.memory[this.metrics.memory.length - 1];
    const memoryStats = latestMemory ? {
      usedMB: Math.round(latestMemory.usedJSHeapSize / 1024 / 1024),
      totalMB: Math.round(latestMemory.totalJSHeapSize / 1024 / 1024),
      limitMB: Math.round(latestMemory.jsHeapSizeLimit / 1024 / 1024),
      usagePercentage: Math.round((latestMemory.usedJSHeapSize / latestMemory.jsHeapSizeLimit) * 100)
    } : null;

    const sessionTimestamp = this.sessionId.split('_')[1];
    const sessionStartTime = sessionTimestamp ? parseInt(sessionTimestamp) : Date.now();
    
    return {
      session: {
        id: this.sessionId,
        startTime: new Date(sessionStartTime).toISOString(),
        uptime: Math.round((now - sessionStartTime) / 1000)
      },
      api: apiStats,
      webVitals: webVitalsStats,
      memory: memoryStats,
      timestamp: now
    };
  }

  /**
   * Get the latest metric value for a specific Web Vital
   */
  private getLatestMetric(name: WebVitalsMetric['name']): WebVitalsMetric | null {
    const metrics = this.metrics.webVitals.filter(m => m.name === name);
    return metrics.length > 0 ? metrics[metrics.length - 1] || null : null;
  }

  /**
   * Export performance data as JSON
   */
  exportData(): string {
    const snapshot = this.getMetricsSnapshot();
    const stats = this.getPerformanceStats();
    
    return JSON.stringify({
      export: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      },
      session: stats.session,
      metrics: snapshot,
      statistics: stats
    }, null, 2);
  }

  /**
   * Clear all metrics data
   */
  clearMetrics() {
    this.metrics = {
      webVitals: [],
      matrixAPI: [],
      memory: []
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Disconnect performance observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Clear memory monitoring interval
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = undefined;
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility function to start monitoring with Matrix client
export const initializePerformanceMonitoring = (matrixClient?: MatrixClient) => {
  if (matrixClient) {
    performanceMonitor.setMatrixClient(matrixClient);
  }
  return performanceMonitor;
};

// Types are already exported above
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { performanceMonitor, PerformanceSnapshot, WebVitalsMetric, MatrixAPIMetric } from '@/lib/monitoring/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Clock,
  Download,
  MemoryStick,
  Server,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceStats {
  session: {
    id: string;
    startTime: string;
    uptime: number;
  };
  api: {
    totalRequests: number;
    successfulRequests: number;
    errorRequests: number;
    averageResponseTime: number;
    slowestRequest: {
      duration: number;
      endpoint: string;
      method: string;
    };
  };
  webVitals: {
    [key: string]: WebVitalsMetric | null;
  };
  memory: {
    usedMB: number;
    totalMB: number;
    limitMB: number;
    usagePercentage: number;
  } | null;
  timestamp: number;
}

export default function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update performance stats
  const updateStats = () => {
    try {
      const newStats = performanceMonitor.getPerformanceStats() as PerformanceStats;
      setStats(newStats);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Failed to update performance stats:', error);
    }
  };

  // Toggle live updates
  const toggleLiveUpdates = () => {
    setIsLiveUpdating(!isLiveUpdating);
  };

  // Export performance data
  const exportData = () => {
    try {
      const data = performanceMonitor.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `haos-performance-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export performance data:', error);
    }
  };

  // Clear metrics data
  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    updateStats();
  };

  // Set up live updates
  useEffect(() => {
    updateStats(); // Initial load
    
    if (isLiveUpdating) {
      intervalRef.current = setInterval(updateStats, 5000); // Update every 5 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLiveUpdating]);

  // Format duration in milliseconds
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format uptime in human readable format
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Get rating color for Web Vitals
  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (rating) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get rating badge variant
  const getRatingBadgeVariant = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading performance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Monitor HAOS application performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveUpdating ? "default" : "outline"}
            size="sm"
            onClick={toggleLiveUpdates}
          >
            <Activity className="w-4 h-4 mr-1" />
            {isLiveUpdating ? "Live" : "Paused"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => updateStats()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="destructive" size="sm" onClick={clearMetrics}>
            Clear Data
          </Button>
        </div>
      </div>

      {/* Last Update Info */}
      {lastUpdateTime && (
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      )}

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-400">Session ID</p>
              <p className="font-mono text-sm">{stats.session.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Started</p>
              <p className="text-sm">{new Date(stats.session.startTime).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Uptime</p>
              <p className="text-sm">{formatUptime(stats.session.uptime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Core Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(stats.webVitals).map(([name, metric]) => (
              <div key={name} className="text-center">
                <p className="text-sm text-gray-400 mb-2">{name}</p>
                {metric ? (
                  <div>
                    <p className={`text-lg font-semibold ${getRatingColor(metric.rating)}`}>
                      {name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
                      {name !== 'CLS' && 'ms'}
                    </p>
                    <Badge variant={getRatingBadgeVariant(metric.rating)} className="text-xs">
                      {metric.rating.replace('-', ' ')}
                    </Badge>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-500">-</p>
                    <Badge variant="outline" className="text-xs">No data</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matrix API Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Matrix API Performance (Last 5 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold">{stats.api.totalRequests}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.api.totalRequests > 0 
                  ? Math.round((stats.api.successfulRequests / stats.api.totalRequests) * 100)
                  : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Average Response</p>
              <p className="text-2xl font-bold">
                {formatDuration(stats.api.averageResponseTime)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Error Rate</p>
              <p className={`text-2xl font-bold ${stats.api.errorRequests > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stats.api.totalRequests > 0 
                  ? Math.round((stats.api.errorRequests / stats.api.totalRequests) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Request Status Indicators */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">{stats.api.successfulRequests} Successful</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm">{stats.api.errorRequests} Errors</span>
            </div>
          </div>

          {/* Slowest Request */}
          {stats.api.slowestRequest.duration > 0 && (
            <div className="mt-4 p-3 bg-gray-800 rounded-md">
              <p className="text-sm text-gray-400 mb-1">Slowest Request</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">
                  {stats.api.slowestRequest.method} {stats.api.slowestRequest.endpoint}
                </span>
                <span className="text-sm font-semibold">
                  {formatDuration(stats.api.slowestRequest.duration)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Usage */}
      {stats.memory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="w-5 h-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Heap Usage</span>
                <span className="text-sm font-semibold">
                  {stats.memory.usedMB}MB / {stats.memory.totalMB}MB ({stats.memory.usagePercentage}%)
                </span>
              </div>
              <Progress value={stats.memory.usagePercentage} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-4">
                <div>
                  <p className="text-sm text-gray-400">Used</p>
                  <p className="text-lg font-semibold">{stats.memory.usedMB}MB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Allocated</p>
                  <p className="text-lg font-semibold">{stats.memory.totalMB}MB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Limit</p>
                  <p className="text-lg font-semibold">{stats.memory.limitMB}MB</p>
                </div>
              </div>

              {stats.memory.usagePercentage > 80 && (
                <div className="flex items-center gap-2 p-3 bg-yellow-900 border border-yellow-600 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-200">
                    High memory usage detected. Consider refreshing the page if performance degrades.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Web Vitals are measured according to Core Web Vitals standards</p>
            <p>• Matrix API metrics include only the last 5 minutes for real-time monitoring</p>
            <p>• Memory usage shows JavaScript heap information from the browser</p>
            <p>• Export data to analyze performance trends over time</p>
            <p>• Clear data to reset metrics and free up browser memory</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
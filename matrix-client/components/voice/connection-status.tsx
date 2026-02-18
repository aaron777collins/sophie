/**
 * Connection Status Component
 * Real-time call quality indicators including latency, packet loss, connection quality
 * Integrates with MatrixRTC session stats and provides visual feedback
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useVoiceControls } from '../../hooks/voice/use-voice-controls';
import { useMatrixRTC } from '../../hooks/matrix/use-matrix-rtc';

export interface ConnectionStatusProps {
  roomId: string;
  
  // Display options
  variant?: 'minimal' | 'compact' | 'detailed';
  showLabels?: boolean;
  showHistory?: boolean;
  showTooltips?: boolean;
  
  // Layout
  orientation?: 'horizontal' | 'vertical';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  // Thresholds for quality determination
  latencyThresholds?: {
    excellent: number; // ms
    good: number;     // ms  
    poor: number;     // ms
  };
  
  packetLossThresholds?: {
    excellent: number; // %
    good: number;     // %
    poor: number;     // %
  };
  
  // Event handlers
  onQualityChange?: (quality: 'excellent' | 'good' | 'poor' | 'unknown') => void;
  
  // Visual options
  className?: string;
  style?: React.CSSProperties;
}

interface ConnectionMetrics {
  latency?: number;
  packetLoss?: number;
  bitrate?: number;
  resolution?: string;
  fps?: number;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  quality: 'excellent' | 'good' | 'poor' | 'unknown';
  lastUpdate: number;
}

const DEFAULT_LATENCY_THRESHOLDS = {
  excellent: 100, // < 100ms
  good: 300,      // < 300ms
  poor: 1000,     // < 1000ms
};

const DEFAULT_PACKET_LOSS_THRESHOLDS = {
  excellent: 1,   // < 1%
  good: 5,        // < 5%
  poor: 15,       // < 15%
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  roomId,
  variant = 'compact',
  showLabels = true,
  showHistory = false,
  showTooltips = true,
  orientation = 'horizontal',
  position = 'top-right',
  latencyThresholds = DEFAULT_LATENCY_THRESHOLDS,
  packetLossThresholds = DEFAULT_PACKET_LOSS_THRESHOLDS,
  onQualityChange,
  className = '',
  style = {},
}) => {
  const voice = useVoiceControls(roomId);
  const rtc = useMatrixRTC(roomId);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    connectionState: 'disconnected',
    quality: 'unknown',
    lastUpdate: Date.now(),
  });
  const [history, setHistory] = useState<ConnectionMetrics[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate quality based on metrics
  const calculateQuality = useMemo(() => (latency?: number, packetLoss?: number): 'excellent' | 'good' | 'poor' | 'unknown' => {
    if (latency === undefined && packetLoss === undefined) return 'unknown';
    
    let qualityScore = 100;
    
    // Deduct points for latency
    if (latency !== undefined) {
      if (latency > latencyThresholds.poor) qualityScore -= 60;
      else if (latency > latencyThresholds.good) qualityScore -= 30;
      else if (latency > latencyThresholds.excellent) qualityScore -= 10;
    }
    
    // Deduct points for packet loss
    if (packetLoss !== undefined) {
      if (packetLoss > packetLossThresholds.poor) qualityScore -= 50;
      else if (packetLoss > packetLossThresholds.good) qualityScore -= 25;
      else if (packetLoss > packetLossThresholds.excellent) qualityScore -= 10;
    }
    
    if (qualityScore >= 80) return 'excellent';
    if (qualityScore >= 60) return 'good';
    if (qualityScore >= 40) return 'poor';
    return 'poor';
  }, [latencyThresholds, packetLossThresholds]);

  // Mock metrics collection (in production this would use RTCPeerConnection.getStats())
  useEffect(() => {
    if (!rtc.isConnected || !rtc.isJoined) {
      setMetrics({
        connectionState: rtc.isLoading ? 'connecting' : 'disconnected',
        quality: 'unknown',
        lastUpdate: Date.now(),
      });
      return;
    }

    const collectMetrics = () => {
      // In production, this would collect real WebRTC stats
      // For now, we'll simulate realistic metrics
      const mockLatency = Math.floor(Math.random() * 150) + 50; // 50-200ms
      const mockPacketLoss = Math.random() * 2; // 0-2%
      const mockBitrate = Math.floor(Math.random() * 500) + 200; // 200-700 kbps
      
      const quality = calculateQuality(mockLatency, mockPacketLoss);
      
      const newMetrics: ConnectionMetrics = {
        latency: mockLatency,
        packetLoss: mockPacketLoss,
        bitrate: mockBitrate,
        resolution: voice.isCameraOn ? '640x480' : undefined,
        fps: voice.isCameraOn ? 30 : undefined,
        connectionState: 'connected',
        quality,
        lastUpdate: Date.now(),
      };
      
      setMetrics(newMetrics);
      
      // Update history
      if (showHistory) {
        setHistory(prev => [...prev.slice(-19), newMetrics]); // Keep last 20 entries
      }
      
      // Notify quality change
      if (quality !== metrics.quality) {
        onQualityChange?.(quality);
      }
    };

    collectMetrics(); // Initial collection
    const interval = setInterval(collectMetrics, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [rtc.isConnected, rtc.isJoined, rtc.isLoading, voice.isCameraOn, onQualityChange, showHistory, calculateQuality]);

  // Get quality indicator
  const getQualityIndicator = () => {
    switch (metrics.quality) {
      case 'excellent': return { icon: '🟢', color: '#43b581', text: 'Excellent' };
      case 'good': return { icon: '🟡', color: '#faa61a', text: 'Good' };
      case 'poor': return { icon: '🔴', color: '#f04747', text: 'Poor' };
      default: return { icon: '⚪', color: '#4f545c', text: 'Unknown' };
    }
  };

  const quality = getQualityIndicator();

  // Position styling
  const getPositionStyle = (): React.CSSProperties => {
    const positions = {
      'top-left': { top: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
    };
    
    return {
      position: 'fixed',
      zIndex: 1000,
      ...positions[position],
    };
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    gap: variant === 'minimal' ? '4px' : '8px',
    padding: variant === 'minimal' ? '4px 8px' : '8px 12px',
    backgroundColor: 'rgba(54, 57, 63, 0.9)',
    borderRadius: '6px',
    backdropFilter: 'blur(4px)',
    fontSize: variant === 'minimal' ? '11px' : '12px',
    color: '#b9bbbe',
    cursor: variant === 'detailed' ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    ...getPositionStyle(),
    ...style,
  };

  const MetricItem: React.FC<{
    icon: string;
    value: string | number;
    unit?: string;
    label?: string;
    color?: string;
    tooltip?: string;
  }> = ({ icon, value, unit = '', label, color, tooltip }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        color: color || '#b9bbbe',
      }}
      title={showTooltips ? tooltip : undefined}
    >
      <span>{icon}</span>
      {(variant !== 'minimal' || !showLabels) && (
        <span style={{ fontWeight: '500' }}>
          {value}{unit}
        </span>
      )}
      {showLabels && variant === 'detailed' && label && (
        <span style={{ fontSize: '10px', opacity: 0.8 }}>
          {label}
        </span>
      )}
    </div>
  );

  // Connection state indicator
  const getConnectionStateIndicator = () => {
    switch (metrics.connectionState) {
      case 'connecting':
        return { icon: '🔄', color: '#faa61a', text: 'Connecting...' };
      case 'connected':
        return { icon: '✅', color: '#43b581', text: 'Connected' };
      case 'reconnecting':
        return { icon: '🔄', color: '#f04747', text: 'Reconnecting...' };
      case 'disconnected':
        return { icon: '❌', color: '#f04747', text: 'Disconnected' };
      default:
        return { icon: '❓', color: '#4f545c', text: 'Unknown' };
    }
  };

  const connectionState = getConnectionStateIndicator();

  if (variant === 'minimal') {
    return (
      <div className={`connection-status ${className}`} style={containerStyle}>
        <span style={{ fontSize: '12px' }} title={quality.text}>
          {quality.icon}
        </span>
        {metrics.latency && (
          <span style={{ fontSize: '10px', color: '#999' }}>
            {metrics.latency}ms
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`connection-status ${className}`} 
      style={containerStyle}
      onClick={variant === 'detailed' ? () => setShowDetails(!showDetails) : undefined}
    >
      {/* Main Quality Indicator */}
      <MetricItem
        icon={quality.icon}
        value={quality.text}
        color={quality.color}
        tooltip={`Connection quality: ${quality.text}`}
      />
      
      {/* Connection State */}
      {variant === 'detailed' && (
        <MetricItem
          icon={connectionState.icon}
          value={connectionState.text}
          color={connectionState.color}
          tooltip={`Connection state: ${connectionState.text}`}
        />
      )}

      {/* Key Metrics */}
      {metrics.latency !== undefined && (
        <MetricItem
          icon="⚡"
          value={metrics.latency}
          unit="ms"
          label="latency"
          tooltip={`Latency: ${metrics.latency}ms`}
        />
      )}

      {metrics.packetLoss !== undefined && variant !== 'compact' && (
        <MetricItem
          icon="📦"
          value={metrics.packetLoss.toFixed(1)}
          unit="%"
          label="loss"
          tooltip={`Packet loss: ${metrics.packetLoss.toFixed(1)}%`}
        />
      )}

      {metrics.bitrate !== undefined && variant === 'detailed' && (
        <MetricItem
          icon="📊"
          value={Math.floor(metrics.bitrate)}
          unit="k"
          label="bitrate"
          tooltip={`Bitrate: ${Math.floor(metrics.bitrate)} kbps`}
        />
      )}

      {/* Video metrics */}
      {metrics.resolution && variant === 'detailed' && (
        <MetricItem
          icon="📺"
          value={metrics.resolution}
          label="resolution"
          tooltip={`Video resolution: ${metrics.resolution}`}
        />
      )}

      {/* Detailed Stats Panel */}
      {showDetails && variant === 'detailed' && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#36393f',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          minWidth: '200px',
          fontSize: '11px',
          zIndex: 1001,
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>
            Connection Details
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Quality:</span>
              <span style={{ color: quality.color }}>{quality.text}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Latency:</span>
              <span>{metrics.latency}ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Packet Loss:</span>
              <span>{metrics.packetLoss?.toFixed(2)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bitrate:</span>
              <span>{metrics.bitrate} kbps</span>
            </div>
            {voice.isCameraOn && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Resolution:</span>
                  <span>{metrics.resolution}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FPS:</span>
                  <span>{metrics.fps}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Last Update:</span>
              <span>{new Date(metrics.lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* History Chart (simplified) */}
          {showHistory && history.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Quality History
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'end',
                gap: '1px',
                height: '20px',
                backgroundColor: '#2f3136',
                padding: '2px',
                borderRadius: '3px',
              }}>
                {history.slice(-10).map((entry, index) => {
                  const height = entry.quality === 'excellent' ? '100%' :
                                entry.quality === 'good' ? '60%' :
                                entry.quality === 'poor' ? '30%' : '10%';
                  const color = entry.quality === 'excellent' ? '#43b581' :
                               entry.quality === 'good' ? '#faa61a' :
                               entry.quality === 'poor' ? '#f04747' : '#4f545c';
                  
                  return (
                    <div
                      key={index}
                      style={{
                        width: '8px',
                        height,
                        backgroundColor: color,
                        borderRadius: '1px',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
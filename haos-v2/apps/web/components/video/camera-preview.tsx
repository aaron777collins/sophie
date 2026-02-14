import React, { useRef, useEffect, useState } from 'react';
import { 
  Camera, 
  CameraOff, 
  RefreshCw, 
  Settings, 
  Play, 
  Square,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  useLocalVideo, 
  useVideoPreview, 
  CameraDevice, 
  VideoQuality 
} from '../../hooks/use-local-video';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface CameraPreviewProps {
  className?: string;
  onCameraReady?: (stream: MediaStream) => void;
  onCameraError?: (error: string) => void;
  autoStart?: boolean;
  showControls?: boolean;
  showQualitySelector?: boolean;
  initialQuality?: VideoQuality;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
}

const qualityLabels: Record<VideoQuality, string> = {
  low: 'Low (320p)',
  medium: 'Medium (480p)',  
  high: 'High (720p)',
  hd: 'HD (1080p)'
};

const aspectRatioClasses = {
  'auto': '',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square'
};

/**
 * CameraPreview component for testing and configuring camera before joining a call
 */
export const CameraPreview: React.FC<CameraPreviewProps> = ({
  className,
  onCameraReady,
  onCameraError,
  autoStart = false,
  showControls = true,
  showQualitySelector = true,
  initialQuality = 'medium',
  aspectRatio = '16:9'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarted, setIsStarted] = useState(autoStart);

  const {
    stream,
    isEnabled,
    error,
    currentDevice,
    availableDevices,
    hasMultipleCameras,
    startVideo,
    stopVideo,
    toggleVideo,
    switchCamera,
    switchToNextCamera,
    quality,
    setQuality,
    refreshDevices,
    clearError
  } = useLocalVideo(autoStart, initialQuality);

  // Set up video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      onCameraReady?.(stream);
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream, onCameraReady]);

  // Handle errors
  useEffect(() => {
    if (error) {
      onCameraError?.(error);
    }
  }, [error, onCameraError]);

  const handleStart = async () => {
    try {
      setIsStarted(true);
      await startVideo();
    } catch (err) {
      setIsStarted(false);
    }
  };

  const handleStop = () => {
    stopVideo();
    setIsStarted(false);
  };

  const handleToggle = async () => {
    try {
      const enabled = await toggleVideo();
      setIsStarted(enabled);
    } catch (err) {
      setIsStarted(false);
    }
  };

  const handleSwitchCamera = async (deviceId: string) => {
    try {
      await switchCamera(deviceId);
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  };

  const handleQualityChange = async (newQuality: VideoQuality) => {
    try {
      await setQuality(newQuality);
    } catch (err) {
      console.error('Failed to change quality:', err);
    }
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Camera Preview</span>
          {currentDevice && (
            <span className="text-sm font-normal text-muted-foreground">
              • {currentDevice.label}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* No cameras available */}
        {availableDevices.length === 0 && !error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>No cameras detected. Please check your camera permissions.</span>
              <Button variant="outline" size="sm" onClick={refreshDevices}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Video Preview */}
        <div className={cn(
          'relative bg-zinc-900 rounded-lg overflow-hidden',
          aspectRatioClasses[aspectRatio] || 'aspect-video'
        )}>
          {isEnabled && stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <CameraOff className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Camera Off</p>
                <p className="text-sm">Click the camera button to start preview</p>
              </div>
            </div>
          )}

          {/* Status indicator */}
          {isEnabled && (
            <div className="absolute top-3 left-3 flex items-center space-x-2 px-2 py-1 bg-green-500/80 text-white text-xs font-medium rounded">
              <CheckCircle2 className="h-3 w-3" />
              <span>Camera Ready</span>
            </div>
          )}

          {/* Quality indicator */}
          {isEnabled && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs font-medium rounded">
              {qualityLabels[quality]}
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center space-x-3">
            {/* Start/Stop/Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isEnabled ? 'default' : 'outline'}
                    size="icon"
                    onClick={handleToggle}
                    disabled={availableDevices.length === 0}
                  >
                    {isEnabled ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEnabled ? 'Stop' : 'Start'} Camera</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Camera Selector */}
            {hasMultipleCameras && (
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch Camera</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenuContent align="center">
                  <DropdownMenuLabel>Select Camera</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableDevices.map((device) => (
                    <DropdownMenuItem
                      key={device.deviceId}
                      onSelect={() => handleSwitchCamera(device.deviceId)}
                      className={currentDevice?.deviceId === device.deviceId ? 'bg-accent' : ''}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {device.label}
                      {currentDevice?.deviceId === device.deviceId && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={switchToNextCamera}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Switch to Next
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Quality Selector */}
            {showQualitySelector && (
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Video Quality</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenuContent align="center">
                  <DropdownMenuLabel>Video Quality</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(Object.entries(qualityLabels) as [VideoQuality, string][]).map(([qual, label]) => (
                    <DropdownMenuItem
                      key={qual}
                      onSelect={() => handleQualityChange(qual)}
                      className={quality === qual ? 'bg-accent' : ''}
                    >
                      {label}
                      {quality === qual && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Refresh Devices */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={refreshDevices}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh Cameras</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Device Info */}
        {currentDevice && isEnabled && (
          <div className="text-center text-sm text-muted-foreground">
            Using: <span className="font-medium">{currentDevice.label}</span>
            {' • '}
            Quality: <span className="font-medium">{qualityLabels[quality]}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Lightweight camera preview for modal/inline use
 */
export const CameraPreviewInline: React.FC<{
  className?: string;
  deviceId?: string;
  quality?: VideoQuality;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
  autoStart?: boolean;
}> = ({
  className,
  deviceId,
  quality = 'medium',
  aspectRatio = '16:9',
  autoStart = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { previewStream, isLoading, error, startPreview, stopPreview } = useVideoPreview(deviceId, quality);

  useEffect(() => {
    if (autoStart) {
      startPreview();
    }
    return () => stopPreview();
  }, [autoStart, startPreview, stopPreview]);

  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [previewStream]);

  return (
    <div className={cn(
      'relative bg-zinc-900 rounded-lg overflow-hidden',
      aspectRatioClasses[aspectRatio] || 'aspect-video',
      className
    )}>
      {previewStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Starting camera...</p>
          </div>
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-red-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <CameraOff className="h-8 w-8 mx-auto mb-2" />
            <p>Camera not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
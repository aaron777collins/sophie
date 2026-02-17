import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Camera,
  CameraOff,
  RotateCcw,
  Settings,
  PictureInPicture2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScreenShareControls } from './screen-share-controls';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CameraDevice, VideoQuality } from '../../hooks/use-local-video';

interface VideoControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeaveCall: () => void;
  
  // Camera controls
  currentCamera?: CameraDevice | null;
  availableCameras?: CameraDevice[];
  onSwitchCamera?: (deviceId: string) => Promise<void>;
  onSwitchToNextCamera?: () => Promise<void>;
  
  // Video quality
  videoQuality?: VideoQuality;
  onChangeVideoQuality?: (quality: VideoQuality) => Promise<void>;
  
  // Picture-in-picture
  supportsPiP?: boolean;
  isPiPActive?: boolean;
  onTogglePiP?: () => Promise<void>;
  
  // Extended controls
  showAdvancedControls?: boolean;
}

const qualityLabels: Record<VideoQuality, string> = {
  low: 'Low (320p)',
  medium: 'Medium (480p)',
  high: 'High (720p)',
  hd: 'HD (1080p)'
};

export const VideoControls: React.FC<VideoControlsProps> = ({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeaveCall,
  currentCamera,
  availableCameras = [],
  onSwitchCamera,
  onSwitchToNextCamera,
  videoQuality = 'medium',
  onChangeVideoQuality,
  supportsPiP = false,
  isPiPActive = false,
  onTogglePiP,
  showAdvancedControls = true
}) => {
  const [isChangingCamera, setIsChangingCamera] = useState(false);

  const handleSwitchCamera = async (deviceId: string) => {
    if (!onSwitchCamera || isChangingCamera) return;
    
    setIsChangingCamera(true);
    try {
      await onSwitchCamera(deviceId);
    } catch (error) {
      console.error('Failed to switch camera:', error);
    } finally {
      setIsChangingCamera(false);
    }
  };

  const handleSwitchToNextCamera = async () => {
    if (!onSwitchToNextCamera || isChangingCamera) return;
    
    setIsChangingCamera(true);
    try {
      await onSwitchToNextCamera();
    } catch (error) {
      console.error('Failed to switch to next camera:', error);
    } finally {
      setIsChangingCamera(false);
    }
  };

  const handleChangeVideoQuality = async (quality: VideoQuality) => {
    if (!onChangeVideoQuality) return;
    
    try {
      await onChangeVideoQuality(quality);
    } catch (error) {
      console.error('Failed to change video quality:', error);
    }
  };

  const handleTogglePiP = async () => {
    if (!onTogglePiP) return;
    
    try {
      await onTogglePiP();
    } catch (error) {
      console.error('Failed to toggle picture-in-picture:', error);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-3 p-4 bg-zinc-900/90 backdrop-blur-sm rounded-b-xl">
      {/* Audio Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={audioEnabled ? 'outline' : 'destructive'} 
              size="icon" 
              onClick={onToggleAudio}
              className="relative"
            >
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{audioEnabled ? 'Mute' : 'Unmute'} Microphone</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Video Toggle with Camera Switch */}
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={videoEnabled ? 'outline' : 'destructive'} 
                size="icon" 
                onClick={onToggleVideo}
              >
                {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{videoEnabled ? 'Turn Off' : 'Turn On'} Camera</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Camera Switch Button */}
        {showAdvancedControls && availableCameras.length > 1 && (
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={isChangingCamera}
                      className="px-2"
                    >
                      {isChangingCamera ? (
                        <RotateCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
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
              {availableCameras.map((camera) => (
                <DropdownMenuItem
                  key={camera.deviceId}
                  onSelect={() => handleSwitchCamera(camera.deviceId)}
                  className={currentCamera?.deviceId === camera.deviceId ? 'bg-accent' : ''}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {camera.label}
                  {currentCamera?.deviceId === camera.deviceId && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSwitchToNextCamera}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Switch to Next Camera
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Screen Share Controls */}
      <ScreenShareControls />

      {/* Picture-in-Picture */}
      {showAdvancedControls && supportsPiP && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isPiPActive ? 'default' : 'outline'} 
                size="icon" 
                onClick={handleTogglePiP}
              >
                <PictureInPicture2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPiPActive ? 'Exit' : 'Enter'} Picture-in-Picture</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Video Settings */}
      {showAdvancedControls && onChangeVideoQuality && (
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Video Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>Video Quality</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.entries(qualityLabels) as [VideoQuality, string][]).map(([quality, label]) => (
              <DropdownMenuItem
                key={quality}
                onSelect={() => handleChangeVideoQuality(quality)}
                className={videoQuality === quality ? 'bg-accent' : ''}
              >
                {label}
                {videoQuality === quality && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Leave Call */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={onLeaveCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Leave Call</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
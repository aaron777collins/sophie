import React from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScreenShareControls } from './screen-share-controls';

interface VideoControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeaveCall: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeaveCall
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-zinc-900/80 rounded-b-xl">
      {/* Audio Toggle */}
      <Button 
        variant={audioEnabled ? 'outline' : 'destructive'} 
        size="icon" 
        onClick={onToggleAudio}
      >
        {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      {/* Video Toggle */}
      <Button 
        variant={videoEnabled ? 'outline' : 'destructive'} 
        size="icon" 
        onClick={onToggleVideo}
      >
        {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      {/* Screen Share Controls */}
      <ScreenShareControls />

      {/* Leave Call */}
      <Button 
        variant="destructive" 
        size="icon" 
        onClick={onLeaveCall}
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
};
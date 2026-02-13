import React, { useState, useCallback, useMemo } from 'react';
import { useScreenShare } from '@/hooks/use-screen-share';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Window, 
  BrowserTab, 
  StopScreenShare 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ScreenShareSource = 'fullscreen' | 'window' | 'tab';

export const ScreenShareControls: React.FC = () => {
  const { 
    isScreenSharing, 
    startScreenShare, 
    stopScreenShare, 
    availableSources 
  } = useScreenShare();

  const [selectedSource, setSelectedSource] = useState<ScreenShareSource>('fullscreen');

  const sourceIcons = useMemo(() => ({
    fullscreen: Monitor,
    window: Window,
    tab: BrowserTab
  }), []);

  const handleStartScreenShare = useCallback(async (source: ScreenShareSource) => {
    try {
      setSelectedSource(source);
      await startScreenShare(source);
    } catch (error) {
      console.error('Screen share failed:', error);
      // TODO: Add user-friendly error handling (toast/notification)
    }
  }, [startScreenShare]);

  const handleStopScreenShare = useCallback(() => {
    stopScreenShare();
  }, [stopScreenShare]);

  // No sources available or screen share not supported
  if (!availableSources.length) {
    return null;
  }

  const SourceIcon = sourceIcons[selectedSource];

  return (
    <div className="flex items-center space-x-2">
      {!isScreenSharing ? (
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Monitor className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share Screen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent align="center">
            {availableSources.includes('fullscreen') && (
              <DropdownMenuItem 
                onSelect={() => handleStartScreenShare('fullscreen')}
                className="cursor-pointer flex items-center"
              >
                <Monitor className="mr-2 h-4 w-4" />
                Share Entire Screen
              </DropdownMenuItem>
            )}
            {availableSources.includes('window') && (
              <DropdownMenuItem 
                onSelect={() => handleStartScreenShare('window')}
                className="cursor-pointer flex items-center"
              >
                <Window className="mr-2 h-4 w-4" />
                Share Window
              </DropdownMenuItem>
            )}
            {availableSources.includes('tab') && (
              <DropdownMenuItem 
                onSelect={() => handleStartScreenShare('tab')}
                className="cursor-pointer flex items-center"
              >
                <BrowserTab className="mr-2 h-4 w-4" />
                Share Browser Tab
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={handleStopScreenShare}
              >
                <StopScreenShare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stop Screen Share</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {isScreenSharing && (
        <div className="text-sm text-muted-foreground flex items-center">
          <SourceIcon className="mr-2 h-4 w-4" />
          Sharing {selectedSource.replace(/^./, c => c.toUpperCase())}
        </div>
      )}
    </div>
  );
};
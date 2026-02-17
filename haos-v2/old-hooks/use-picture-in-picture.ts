import { useState, useEffect, useCallback, useRef } from 'react';

export interface PictureInPictureOptions {
  width?: number;
  height?: number;
  preferredResizeMode?: 'crop' | 'resize';
  enableUserGestures?: boolean;
}

export interface UsePictureInPictureReturn {
  // State
  isSupported: boolean;
  isActive: boolean;
  isPending: boolean;
  error: string | null;
  
  // Actions
  enterPiP: (video?: HTMLVideoElement, options?: PictureInPictureOptions) => Promise<void>;
  exitPiP: () => Promise<void>;
  toggle: (video?: HTMLVideoElement, options?: PictureInPictureOptions) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  getCurrentPiPVideo: () => HTMLVideoElement | null;
}

/**
 * Custom hook for managing Picture-in-Picture functionality
 */
export function usePictureInPicture(): UsePictureInPictureReturn {
  const [isActive, setIsActive] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);

  // Check if PiP is supported
  const isSupported = 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;

  // Handle PiP state changes
  useEffect(() => {
    if (!isSupported) return;

    const handlePiPEnter = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      currentVideoRef.current = video;
      setIsActive(true);
      setIsPending(false);
      setError(null);
      console.log('Picture-in-Picture entered');
    };

    const handlePiPExit = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      if (currentVideoRef.current === video) {
        currentVideoRef.current = null;
      }
      setIsActive(false);
      setIsPending(false);
      console.log('Picture-in-Picture exited');
    };

    // Listen for global PiP changes
    document.addEventListener('enterpictureinpicture', handlePiPEnter);
    document.addEventListener('leavepictureinpicture', handlePiPExit);

    // Check initial state
    if (document.pictureInPictureElement) {
      setIsActive(true);
      currentVideoRef.current = document.pictureInPictureElement as HTMLVideoElement;
    }

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPEnter);
      document.removeEventListener('leavepictureinpicture', handlePiPExit);
    };
  }, [isSupported]);

  // Enter Picture-in-Picture
  const enterPiP = useCallback(async (
    video?: HTMLVideoElement, 
    options: PictureInPictureOptions = {}
  ) => {
    if (!isSupported) {
      throw new Error('Picture-in-Picture is not supported');
    }

    if (isActive) {
      return; // Already active
    }

    if (isPending) {
      return; // Already pending
    }

    if (!video) {
      throw new Error('Video element is required');
    }

    setIsPending(true);
    setError(null);

    try {
      // Prepare options
      const pipOptions: any = {};
      if (options.width && options.height) {
        pipOptions.width = options.width;
        pipOptions.height = options.height;
      }

      // Enter PiP mode
      const pipWindow = await video.requestPictureInPicture();
      
      // Handle resize if needed
      if (options.width && options.height) {
        try {
          pipWindow.resizeTo(options.width, options.height);
        } catch (resizeError) {
          console.warn('Failed to resize PiP window:', resizeError);
        }
      }

      currentVideoRef.current = video;
      
      // State will be updated by event listeners
    } catch (err) {
      setIsPending(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enter Picture-in-Picture';
      setError(errorMessage);
      console.error('Picture-in-Picture error:', err);
      throw new Error(errorMessage);
    }
  }, [isSupported, isActive, isPending]);

  // Exit Picture-in-Picture
  const exitPiP = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Picture-in-Picture is not supported');
    }

    if (!isActive) {
      return; // Not active
    }

    setIsPending(true);
    setError(null);

    try {
      await document.exitPictureInPicture();
      // State will be updated by event listeners
    } catch (err) {
      setIsPending(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to exit Picture-in-Picture';
      setError(errorMessage);
      console.error('Picture-in-Picture exit error:', err);
      throw new Error(errorMessage);
    }
  }, [isSupported, isActive]);

  // Toggle Picture-in-Picture
  const toggle = useCallback(async (
    video?: HTMLVideoElement, 
    options?: PictureInPictureOptions
  ): Promise<boolean> => {
    if (isActive) {
      await exitPiP();
      return false;
    } else {
      await enterPiP(video, options);
      return true;
    }
  }, [isActive, enterPiP, exitPiP]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get current PiP video element
  const getCurrentPiPVideo = useCallback((): HTMLVideoElement | null => {
    return currentVideoRef.current;
  }, []);

  return {
    isSupported,
    isActive,
    isPending,
    error,
    enterPiP,
    exitPiP,
    toggle,
    clearError,
    getCurrentPiPVideo
  };
}

/**
 * Hook for automatically managing PiP for a specific video element
 */
export function useVideoPictureInPicture(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: PictureInPictureOptions & { autoExitOnUnmount?: boolean } = {}
): UsePictureInPictureReturn & {
  enterPiPForVideo: () => Promise<void>;
  toggleForVideo: () => Promise<boolean>;
} {
  const pip = usePictureInPicture();
  const { autoExitOnUnmount = true, ...pipOptions } = options;

  // Enter PiP for the specific video
  const enterPiPForVideo = useCallback(async () => {
    if (!videoRef.current) {
      throw new Error('Video element not available');
    }
    await pip.enterPiP(videoRef.current, pipOptions);
  }, [pip, videoRef, pipOptions]);

  // Toggle PiP for the specific video
  const toggleForVideo = useCallback(async (): Promise<boolean> => {
    if (!videoRef.current) {
      throw new Error('Video element not available');
    }
    return pip.toggle(videoRef.current, pipOptions);
  }, [pip, videoRef, pipOptions]);

  // Auto-exit on unmount
  useEffect(() => {
    if (!autoExitOnUnmount) return;

    return () => {
      if (pip.isActive && pip.getCurrentPiPVideo() === videoRef.current) {
        pip.exitPiP().catch(console.error);
      }
    };
  }, [pip, videoRef, autoExitOnUnmount]);

  return {
    ...pip,
    enterPiPForVideo,
    toggleForVideo
  };
}

/**
 * Utility function to check if an element can enter Picture-in-Picture
 */
export function canEnterPictureInPicture(video: HTMLVideoElement): boolean {
  if (!('pictureInPictureEnabled' in document) || !document.pictureInPictureEnabled) {
    return false;
  }

  // Video must have a valid source and not be picture-in-picture already
  return !video.disablePictureInPicture && 
         video.readyState >= 2 && // HAVE_CURRENT_DATA
         !document.pictureInPictureElement;
}

/**
 * Utility function to get optimal PiP dimensions based on video
 */
export function getOptimalPiPDimensions(
  video: HTMLVideoElement,
  maxWidth: number = 400,
  maxHeight: number = 300
): { width: number; height: number } {
  const videoAspectRatio = video.videoWidth / video.videoHeight;
  
  let width = maxWidth;
  let height = width / videoAspectRatio;
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * videoAspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Utility function to create a Picture-in-Picture window with custom controls
 */
export async function createCustomPiPWindow(
  video: HTMLVideoElement,
  options: PictureInPictureOptions = {}
): Promise<PictureInPictureWindow> {
  if (!canEnterPictureInPicture(video)) {
    throw new Error('Cannot enter Picture-in-Picture for this video');
  }

  const pipWindow = await video.requestPictureInPicture();
  
  // Set up custom dimensions
  if (options.width && options.height) {
    try {
      pipWindow.resizeTo(options.width, options.height);
    } catch (resizeError) {
      console.warn('Could not resize PiP window:', resizeError);
    }
  }

  return pipWindow;
}
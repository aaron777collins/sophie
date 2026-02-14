import { renderHook, act } from '@testing-library/react';
import { usePictureInPicture, useVideoPictureInPicture, canEnterPictureInPicture } from '../use-picture-in-picture';

// Mock Picture-in-Picture API
const mockRequestPictureInPicture = jest.fn();
const mockExitPictureInPicture = jest.fn();
const mockPictureInPictureWindow = {
  resizeTo: jest.fn()
};

Object.defineProperty(document, 'pictureInPictureEnabled', {
  writable: true,
  value: true
});

Object.defineProperty(document, 'pictureInPictureElement', {
  writable: true,
  value: null
});

Object.defineProperty(document, 'exitPictureInPicture', {
  writable: true,
  value: mockExitPictureInPicture
});

// Mock HTMLVideoElement
const createMockVideo = (readyState = 4) => ({
  requestPictureInPicture: mockRequestPictureInPicture,
  disablePictureInPicture: false,
  readyState,
  videoWidth: 1280,
  videoHeight: 720,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}) as unknown as HTMLVideoElement;

describe('usePictureInPicture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPictureInPicture.mockResolvedValue(mockPictureInPictureWindow);
    mockExitPictureInPicture.mockResolvedValue(undefined);
    
    // Reset document properties
    (document as any).pictureInPictureEnabled = true;
    (document as any).pictureInPictureElement = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => usePictureInPicture());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('detects PiP support correctly', () => {
    // Test when PiP is supported
    (document as any).pictureInPictureEnabled = true;
    const { result: supportedResult } = renderHook(() => usePictureInPicture());
    expect(supportedResult.current.isSupported).toBe(true);

    // Test when PiP is not supported
    (document as any).pictureInPictureEnabled = false;
    const { result: unsupportedResult } = renderHook(() => usePictureInPicture());
    expect(unsupportedResult.current.isSupported).toBe(false);
  });

  it('enters PiP successfully', async () => {
    const { result } = renderHook(() => usePictureInPicture());
    const mockVideo = createMockVideo();

    await act(async () => {
      await result.current.enterPiP(mockVideo);
    });

    expect(mockRequestPictureInPicture).toHaveBeenCalled();
    expect(result.current.getCurrentPiPVideo()).toBe(mockVideo);
  });

  it('handles PiP entry failure', async () => {
    const { result } = renderHook(() => usePictureInPicture());
    const mockVideo = createMockVideo();
    const error = new Error('PiP not allowed');
    
    mockRequestPictureInPicture.mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.enterPiP(mockVideo);
      } catch (err) {
        expect(err).toEqual(expect.objectContaining({
          message: 'PiP not allowed'
        }));
      }
    });

    expect(result.current.error).toBe('PiP not allowed');
    expect(result.current.isPending).toBe(false);
  });

  it('exits PiP successfully', async () => {
    const { result } = renderHook(() => usePictureInPicture());

    // Simulate being in PiP mode
    act(() => {
      (result.current as any).setIsActive(true);
    });

    await act(async () => {
      await result.current.exitPiP();
    });

    expect(mockExitPictureInPicture).toHaveBeenCalled();
  });

  it('handles PiP exit failure', async () => {
    const { result } = renderHook(() => usePictureInPicture());
    const error = new Error('Exit failed');
    
    mockExitPictureInPicture.mockRejectedValue(error);

    // Simulate being in PiP mode
    act(() => {
      (result.current as any).setIsActive(true);
    });

    await act(async () => {
      try {
        await result.current.exitPiP();
      } catch (err) {
        expect(err).toEqual(expect.objectContaining({
          message: 'Exit failed'
        }));
      }
    });

    expect(result.current.error).toBe('Exit failed');
  });

  it('toggles PiP state', async () => {
    const { result } = renderHook(() => usePictureInPicture());
    const mockVideo = createMockVideo();

    // Toggle to enter PiP
    await act(async () => {
      const entered = await result.current.toggle(mockVideo);
      expect(entered).toBe(true);
    });

    expect(mockRequestPictureInPicture).toHaveBeenCalled();

    // Simulate PiP state change
    act(() => {
      const event = new Event('enterpictureinpicture');
      Object.defineProperty(event, 'target', { value: mockVideo });
      document.dispatchEvent(event);
    });

    expect(result.current.isActive).toBe(true);

    // Toggle to exit PiP
    await act(async () => {
      const exited = await result.current.toggle();
      expect(exited).toBe(false);
    });

    expect(mockExitPictureInPicture).toHaveBeenCalled();
  });

  it('prevents entering PiP when not supported', async () => {
    (document as any).pictureInPictureEnabled = false;
    
    const { result } = renderHook(() => usePictureInPicture());
    const mockVideo = createMockVideo();

    await act(async () => {
      try {
        await result.current.enterPiP(mockVideo);
      } catch (err) {
        expect(err).toEqual(expect.objectContaining({
          message: 'Picture-in-Picture is not supported'
        }));
      }
    });
  });

  it('prevents entering PiP without video element', async () => {
    const { result } = renderHook(() => usePictureInPicture());

    await act(async () => {
      try {
        await result.current.enterPiP(undefined as any);
      } catch (err) {
        expect(err).toEqual(expect.objectContaining({
          message: 'Video element is required'
        }));
      }
    });
  });

  it('handles PiP events correctly', () => {
    const { result } = renderHook(() => usePictureInPicture());
    const mockVideo = createMockVideo();

    // Simulate enter PiP event
    act(() => {
      const event = new Event('enterpictureinpicture');
      Object.defineProperty(event, 'target', { value: mockVideo });
      document.dispatchEvent(event);
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.getCurrentPiPVideo()).toBe(mockVideo);

    // Simulate leave PiP event
    act(() => {
      const event = new Event('leavepictureinpicture');
      Object.defineProperty(event, 'target', { value: mockVideo });
      document.dispatchEvent(event);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.getCurrentPiPVideo()).toBeNull();
  });

  it('clears error state', () => {
    const { result } = renderHook(() => usePictureInPicture());

    // Set error state
    act(() => {
      (result.current as any).setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('handles resize options', async () => {
    const { result } = renderHook(() => usePictureInPicture());
    const mockVideo = createMockVideo();

    await act(async () => {
      await result.current.enterPiP(mockVideo, {
        width: 400,
        height: 300
      });
    });

    expect(mockPictureInPictureWindow.resizeTo).toHaveBeenCalledWith(400, 300);
  });
});

describe('useVideoPictureInPicture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPictureInPicture.mockResolvedValue(mockPictureInPictureWindow);
    mockExitPictureInPicture.mockResolvedValue(undefined);
  });

  it('enters PiP for specific video', async () => {
    const mockVideo = createMockVideo();
    const videoRef = { current: mockVideo };
    
    const { result } = renderHook(() => useVideoPictureInPicture(videoRef));

    await act(async () => {
      await result.current.enterPiPForVideo();
    });

    expect(mockRequestPictureInPicture).toHaveBeenCalled();
  });

  it('toggles PiP for specific video', async () => {
    const mockVideo = createMockVideo();
    const videoRef = { current: mockVideo };
    
    const { result } = renderHook(() => useVideoPictureInPicture(videoRef));

    await act(async () => {
      const entered = await result.current.toggleForVideo();
      expect(entered).toBe(true);
    });

    expect(mockRequestPictureInPicture).toHaveBeenCalled();
  });

  it('handles missing video element', async () => {
    const videoRef = { current: null };
    
    const { result } = renderHook(() => useVideoPictureInPicture(videoRef));

    await act(async () => {
      try {
        await result.current.enterPiPForVideo();
      } catch (err) {
        expect(err).toEqual(expect.objectContaining({
          message: 'Video element not available'
        }));
      }
    });
  });

  it('auto-exits on unmount when enabled', () => {
    const mockVideo = createMockVideo();
    const videoRef = { current: mockVideo };
    
    const { unmount } = renderHook(() => 
      useVideoPictureInPicture(videoRef, { autoExitOnUnmount: true })
    );

    // Simulate being in PiP mode
    act(() => {
      const event = new Event('enterpictureinpicture');
      Object.defineProperty(event, 'target', { value: mockVideo });
      document.dispatchEvent(event);
    });

    unmount();

    expect(mockExitPictureInPicture).toHaveBeenCalled();
  });

  it('does not auto-exit when disabled', () => {
    const mockVideo = createMockVideo();
    const videoRef = { current: mockVideo };
    
    const { unmount } = renderHook(() => 
      useVideoPictureInPicture(videoRef, { autoExitOnUnmount: false })
    );

    unmount();

    expect(mockExitPictureInPicture).not.toHaveBeenCalled();
  });
});

describe('canEnterPictureInPicture', () => {
  beforeEach(() => {
    (document as any).pictureInPictureEnabled = true;
    (document as any).pictureInPictureElement = null;
  });

  it('returns true for valid video', () => {
    const mockVideo = createMockVideo(4); // HAVE_ENOUGH_DATA
    
    expect(canEnterPictureInPicture(mockVideo)).toBe(true);
  });

  it('returns false when PiP is not supported', () => {
    (document as any).pictureInPictureEnabled = false;
    const mockVideo = createMockVideo();
    
    expect(canEnterPictureInPicture(mockVideo)).toBe(false);
  });

  it('returns false when video has insufficient data', () => {
    const mockVideo = createMockVideo(1); // HAVE_METADATA
    
    expect(canEnterPictureInPicture(mockVideo)).toBe(false);
  });

  it('returns false when PiP is disabled on video', () => {
    const mockVideo = createMockVideo();
    mockVideo.disablePictureInPicture = true;
    
    expect(canEnterPictureInPicture(mockVideo)).toBe(false);
  });

  it('returns false when already in PiP mode', () => {
    (document as any).pictureInPictureElement = createMockVideo();
    const mockVideo = createMockVideo();
    
    expect(canEnterPictureInPicture(mockVideo)).toBe(false);
  });
});
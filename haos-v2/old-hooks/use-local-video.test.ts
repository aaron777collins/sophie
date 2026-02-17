import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalVideo, useVideoPreview } from '../use-local-video';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }
});

// Mock MediaStream and MediaStreamTrack
class MockMediaStreamTrack {
  id = 'mock-track-id';
  kind = 'video';
  enabled = true;
  
  stop = jest.fn();
  getSettings = jest.fn().mockReturnValue({
    deviceId: 'mock-device-id',
    width: 640,
    height: 480
  });
}

class MockMediaStream {
  id = 'mock-stream-id';
  tracks: MockMediaStreamTrack[] = [];
  
  constructor() {
    this.tracks = [new MockMediaStreamTrack()];
  }
  
  getTracks = jest.fn(() => this.tracks);
  getVideoTracks = jest.fn(() => this.tracks.filter(t => t.kind === 'video'));
  getAudioTracks = jest.fn(() => this.tracks.filter(t => t.kind === 'audio'));
}

global.MediaStream = MockMediaStream as any;
global.MediaStreamTrack = MockMediaStreamTrack as any;

describe('useLocalVideo', () => {
  const mockDevices = [
    {
      deviceId: 'camera-1',
      groupId: 'group-1',
      kind: 'videoinput',
      label: 'Front Camera'
    },
    {
      deviceId: 'camera-2',
      groupId: 'group-2',
      kind: 'videoinput',
      label: 'Back Camera'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockEnumerateDevices.mockResolvedValue(mockDevices);
    mockGetUserMedia.mockResolvedValue(new MockMediaStream());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useLocalVideo());

    expect(result.current.stream).toBeNull();
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.currentDevice).toBeNull();
    expect(result.current.quality).toBe('medium');
  });

  it('loads available devices on mount', async () => {
    const { result } = renderHook(() => useLocalVideo());

    await waitFor(() => {
      expect(result.current.availableDevices).toHaveLength(2);
      expect(result.current.hasMultipleCameras).toBe(true);
    });

    expect(mockEnumerateDevices).toHaveBeenCalled();
  });

  it('auto-starts video when enabled', async () => {
    renderHook(() => useLocalVideo(true));

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });
  });

  it('starts video successfully', async () => {
    const { result } = renderHook(() => useLocalVideo());

    await act(async () => {
      await result.current.startVideo();
    });

    expect(result.current.stream).toBeTruthy();
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: expect.objectContaining({
        width: 640,
        height: 480,
        frameRate: 24,
        facingMode: 'user'
      }),
      audio: false
    });
  });

  it('handles video start failure', async () => {
    const { result } = renderHook(() => useLocalVideo());

    const error = new Error('Permission denied');
    mockGetUserMedia.mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.startVideo();
      } catch (err) {
        expect(err).toEqual(expect.objectContaining({
          message: expect.stringContaining('Permission denied')
        }));
      }
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.error).toContain('Permission denied');
  });

  it('stops video successfully', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Start video first
    await act(async () => {
      await result.current.startVideo();
    });

    const stream = result.current.stream;
    const tracks = stream?.getTracks() || [];

    // Stop video
    act(() => {
      result.current.stopVideo();
    });

    expect(result.current.stream).toBeNull();
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Verify tracks were stopped
    tracks.forEach(track => {
      expect(track.stop).toHaveBeenCalled();
    });
  });

  it('toggles video on/off', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Toggle on (initially off)
    await act(async () => {
      const enabled = await result.current.toggleVideo();
      expect(enabled).toBe(true);
    });

    expect(result.current.isEnabled).toBe(true);

    // Toggle off
    await act(async () => {
      const enabled = await result.current.toggleVideo();
      expect(enabled).toBe(false);
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it('switches camera by device ID', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Wait for devices to load
    await waitFor(() => {
      expect(result.current.availableDevices).toHaveLength(2);
    });

    await act(async () => {
      await result.current.switchCamera('camera-2');
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({
          deviceId: { exact: 'camera-2' }
        })
      })
    );
  });

  it('switches to next camera', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Wait for devices to load
    await waitFor(() => {
      expect(result.current.availableDevices).toHaveLength(2);
    });

    // Start with first camera
    await act(async () => {
      await result.current.startVideo();
    });

    // Switch to next
    await act(async () => {
      await result.current.switchToNextCamera();
    });

    // Should switch to second camera
    expect(mockGetUserMedia).toHaveBeenLastCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({
          deviceId: { exact: 'camera-2' }
        })
      })
    );
  });

  it('changes video quality', async () => {
    const { result } = renderHook(() => useLocalVideo());

    await act(async () => {
      await result.current.setQuality('high');
    });

    expect(result.current.quality).toBe('high');
    expect(result.current.constraints).toEqual({
      width: 1280,
      height: 720,
      frameRate: 30
    });
  });

  it('restarts video when quality changes and video is enabled', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Start video
    await act(async () => {
      await result.current.startVideo();
    });

    expect(mockGetUserMedia).toHaveBeenCalledTimes(1);

    // Change quality
    await act(async () => {
      await result.current.setQuality('high');
    });

    // Should restart video with new quality
    expect(mockGetUserMedia).toHaveBeenCalledTimes(2);
    expect(mockGetUserMedia).toHaveBeenLastCalledWith(
      expect.objectContaining({
        video: expect.objectContaining({
          width: 1280,
          height: 720,
          frameRate: 30
        })
      })
    );
  });

  it('refreshes devices list', async () => {
    const { result } = renderHook(() => useLocalVideo());

    await act(async () => {
      await result.current.refreshDevices();
    });

    expect(mockEnumerateDevices).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
  });

  it('clears error state', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Create an error
    mockGetUserMedia.mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      try {
        await result.current.startVideo();
      } catch (err) {
        // Expected to fail
      }
    });

    expect(result.current.error).toBeTruthy();

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('gets current video track', async () => {
    const { result } = renderHook(() => useLocalVideo());

    // Initially no track
    expect(result.current.getCurrentVideoTrack()).toBeNull();

    // Start video
    await act(async () => {
      await result.current.startVideo();
    });

    const track = result.current.getCurrentVideoTrack();
    expect(track).toBeTruthy();
    expect(track?.kind).toBe('video');
  });

  it('cleans up on unmount', () => {
    const { result, unmount } = renderHook(() => useLocalVideo());

    // Start video to have tracks to clean up
    act(async () => {
      await result.current.startVideo();
    });

    const stream = result.current.stream;
    const tracks = stream?.getTracks() || [];

    unmount();

    // Verify tracks were stopped
    tracks.forEach(track => {
      expect(track.stop).toHaveBeenCalled();
    });
  });
});

describe('useVideoPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(new MockMediaStream());
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useVideoPreview());

    expect(result.current.previewStream).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('starts preview successfully', async () => {
    const { result } = renderHook(() => useVideoPreview('camera-1', 'high'));

    await act(async () => {
      await result.current.startPreview();
    });

    expect(result.current.previewStream).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: expect.objectContaining({
        deviceId: { exact: 'camera-1' },
        width: 1280,
        height: 720,
        frameRate: 30
      }),
      audio: false
    });
  });

  it('handles preview start failure', async () => {
    const { result } = renderHook(() => useVideoPreview());

    const error = new Error('Camera not available');
    mockGetUserMedia.mockRejectedValue(error);

    await act(async () => {
      await result.current.startPreview();
    });

    expect(result.current.previewStream).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Camera not available');
  });

  it('stops preview and cleans up stream', async () => {
    const { result } = renderHook(() => useVideoPreview());

    // Start preview
    await act(async () => {
      await result.current.startPreview();
    });

    const stream = result.current.previewStream;
    const tracks = stream?.getTracks() || [];

    // Stop preview
    act(() => {
      result.current.stopPreview();
    });

    expect(result.current.previewStream).toBeNull();
    expect(result.current.error).toBeNull();

    // Verify tracks were stopped
    tracks.forEach(track => {
      expect(track.stop).toHaveBeenCalled();
    });
  });

  it('cleans up on unmount', () => {
    const { result, unmount } = renderHook(() => useVideoPreview());

    // Start preview to have tracks to clean up
    act(async () => {
      await result.current.startPreview();
    });

    const stream = result.current.previewStream;
    const tracks = stream?.getTracks() || [];

    unmount();

    // Verify tracks were stopped
    tracks.forEach(track => {
      expect(track.stop).toHaveBeenCalled();
    });
  });
});
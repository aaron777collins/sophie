import { renderHook, act, waitFor } from '@testing-library/react';
import { useVideoCall, useVideoCallAutoJoin } from '../use-video-call';
import { VideoCallService, getVideoCallService, resetVideoCallService } from '../../services/video-call';

// Mock the video call service
jest.mock('../../services/video-call', () => ({
  VideoCallService: jest.fn(),
  getVideoCallService: jest.fn(),
  resetVideoCallService: jest.fn()
}));

describe('useVideoCall', () => {
  let mockService: jest.Mocked<VideoCallService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock service instance
    mockService = {
      joinCall: jest.fn(),
      leaveCall: jest.fn(),
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      getParticipants: jest.fn().mockReturnValue([]),
      getLocalParticipant: jest.fn().mockReturnValue(null),
      getParticipant: jest.fn(),
      isInCall: jest.fn().mockReturnValue(false),
      isAtMaxCapacity: jest.fn().mockReturnValue(false),
      on: jest.fn(),
      off: jest.fn(),
      dispose: jest.fn()
    } as any;

    (getVideoCallService as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useVideoCall());

    expect(result.current.callState).toBe('idle');
    expect(result.current.participants).toEqual([]);
    expect(result.current.localParticipant).toBeNull();
    expect(result.current.remoteParticipants).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.participantCount).toBe(0);
    expect(result.current.isAtMaxCapacity).toBe(false);
  });

  it('sets up event listeners on mount', () => {
    renderHook(() => useVideoCall());

    expect(mockService.on).toHaveBeenCalledWith('participant-joined', expect.any(Function));
    expect(mockService.on).toHaveBeenCalledWith('participant-left', expect.any(Function));
    expect(mockService.on).toHaveBeenCalledWith('participant-updated', expect.any(Function));
    expect(mockService.on).toHaveBeenCalledWith('connection-state-changed', expect.any(Function));
    expect(mockService.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockService.on).toHaveBeenCalledWith('track-added', expect.any(Function));
    expect(mockService.on).toHaveBeenCalledWith('track-removed', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useVideoCall());

    unmount();

    expect(mockService.off).toHaveBeenCalledWith('participant-joined', expect.any(Function));
    expect(mockService.off).toHaveBeenCalledWith('participant-left', expect.any(Function));
    expect(mockService.off).toHaveBeenCalledWith('participant-updated', expect.any(Function));
    expect(mockService.off).toHaveBeenCalledWith('connection-state-changed', expect.any(Function));
    expect(mockService.off).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockService.off).toHaveBeenCalledWith('track-added', expect.any(Function));
    expect(mockService.off).toHaveBeenCalledWith('track-removed', expect.any(Function));
  });

  it('handles successful join call', async () => {
    const { result } = renderHook(() => useVideoCall());

    mockService.joinCall.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.joinCall('room-1', 'user-1', 'John Doe');
    });

    expect(mockService.joinCall).toHaveBeenCalledWith('room-1', 'user-1', 'John Doe');
  });

  it('handles join call failure', async () => {
    const { result } = renderHook(() => useVideoCall());

    const error = new Error('Failed to join');
    mockService.joinCall.mockRejectedValue(error);

    await act(async () => {
      try {
        await result.current.joinCall('room-1', 'user-1', 'John Doe');
      } catch (err) {
        expect(err).toBe(error);
      }
    });

    expect(result.current.callState).toBe('error');
    expect(result.current.error).toBe('Failed to join');
  });

  it('handles leave call', async () => {
    const { result } = renderHook(() => useVideoCall());

    mockService.leaveCall.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.leaveCall();
    });

    expect(mockService.leaveCall).toHaveBeenCalled();
  });

  it('handles toggle audio', async () => {
    const { result } = renderHook(() => useVideoCall());

    mockService.toggleAudio.mockReturnValue(true);

    await act(async () => {
      const isEnabled = result.current.toggleAudio();
      expect(isEnabled).toBe(true);
    });

    expect(mockService.toggleAudio).toHaveBeenCalled();
  });

  it('handles toggle video', async () => {
    const { result } = renderHook(() => useVideoCall());

    mockService.toggleVideo.mockReturnValue(false);

    await act(async () => {
      const isEnabled = result.current.toggleVideo();
      expect(isEnabled).toBe(false);
    });

    expect(mockService.toggleVideo).toHaveBeenCalled();
  });

  it('handles connection state changes', () => {
    const { result } = renderHook(() => useVideoCall());

    // Get the connection state change handler
    const connectionStateHandler = mockService.on.mock.calls.find(
      call => call[0] === 'connection-state-changed'
    )?.[1];

    expect(connectionStateHandler).toBeDefined();

    // Simulate connection
    act(() => {
      connectionStateHandler?.('connected' as RTCPeerConnectionState);
    });

    expect(result.current.callState).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();

    // Simulate disconnection
    act(() => {
      connectionStateHandler?.('disconnected' as RTCPeerConnectionState);
    });

    expect(result.current.callState).toBe('idle');
    expect(result.current.isConnected).toBe(false);
  });

  it('handles service errors', () => {
    const { result } = renderHook(() => useVideoCall());

    // Get the error handler
    const errorHandler = mockService.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];

    expect(errorHandler).toBeDefined();

    const testError = new Error('Service error');

    act(() => {
      errorHandler?.(testError);
    });

    expect(result.current.callState).toBe('error');
    expect(result.current.error).toBe('Service error');
  });

  it('clears error state', () => {
    const { result } = renderHook(() => useVideoCall());

    // Set error state
    const errorHandler = mockService.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];

    act(() => {
      errorHandler?.(new Error('Test error'));
    });

    expect(result.current.error).toBe('Test error');
    expect(result.current.callState).toBe('error');

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.callState).toBe('idle');
  });

  it('returns participant by ID', () => {
    const { result } = renderHook(() => useVideoCall());

    const mockParticipant = { id: 'user-1', displayName: 'John' } as any;
    mockService.getParticipant.mockReturnValue(mockParticipant);

    const participant = result.current.getParticipant('user-1');

    expect(participant).toBe(mockParticipant);
    expect(mockService.getParticipant).toHaveBeenCalledWith('user-1');
  });
});

describe('useVideoCallAutoJoin', () => {
  let mockService: jest.Mocked<VideoCallService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockService = {
      joinCall: jest.fn(),
      leaveCall: jest.fn(),
      toggleAudio: jest.fn(),
      toggleVideo: jest.fn(),
      getParticipants: jest.fn().mockReturnValue([]),
      getLocalParticipant: jest.fn().mockReturnValue(null),
      getParticipant: jest.fn(),
      isInCall: jest.fn().mockReturnValue(false),
      isAtMaxCapacity: jest.fn().mockReturnValue(false),
      on: jest.fn(),
      off: jest.fn(),
      dispose: jest.fn()
    } as any;

    (getVideoCallService as jest.Mock).mockReturnValue(mockService);
  });

  it('auto-joins when enabled', async () => {
    mockService.joinCall.mockResolvedValue(undefined);

    renderHook(() => useVideoCallAutoJoin('room-1', 'user-1', 'John Doe', true));

    await waitFor(() => {
      expect(mockService.joinCall).toHaveBeenCalledWith('room-1', 'user-1', 'John Doe');
    });
  });

  it('does not auto-join when disabled', () => {
    renderHook(() => useVideoCallAutoJoin('room-1', 'user-1', 'John Doe', false));

    expect(mockService.joinCall).not.toHaveBeenCalled();
  });

  it('does not auto-join with missing parameters', () => {
    renderHook(() => useVideoCallAutoJoin('', 'user-1', 'John Doe', true));
    
    expect(mockService.joinCall).not.toHaveBeenCalled();
  });

  it('auto-leaves on unmount when connected', () => {
    mockService.isInCall.mockReturnValue(true);
    mockService.leaveCall.mockResolvedValue(undefined);

    const { unmount } = renderHook(() => 
      useVideoCallAutoJoin('room-1', 'user-1', 'John Doe', true)
    );

    // Mock being connected
    const connectionStateHandler = mockService.on.mock.calls.find(
      call => call[0] === 'connection-state-changed'
    )?.[1];

    act(() => {
      connectionStateHandler?.('connected' as RTCPeerConnectionState);
    });

    unmount();

    // Should attempt to leave call
    expect(mockService.leaveCall).toHaveBeenCalled();
  });
});
import { VideoCallService, getVideoCallService, resetVideoCallService } from '../video-call';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia
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
  
  constructor(hasVideo = true, hasAudio = false) {
    if (hasVideo) {
      this.tracks.push(Object.assign(new MockMediaStreamTrack(), { kind: 'video' }));
    }
    if (hasAudio) {
      this.tracks.push(Object.assign(new MockMediaStreamTrack(), { kind: 'audio' }));
    }
  }
  
  getTracks = jest.fn(() => this.tracks);
  getVideoTracks = jest.fn(() => this.tracks.filter(t => t.kind === 'video'));
  getAudioTracks = jest.fn(() => this.tracks.filter(t => t.kind === 'audio'));
}

global.MediaStream = MockMediaStream as any;
global.MediaStreamTrack = MockMediaStreamTrack as any;

describe('VideoCallService', () => {
  let service: VideoCallService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VideoCallService();
    mockGetUserMedia.mockResolvedValue(new MockMediaStream(true, true));
  });

  afterEach(() => {
    service.dispose();
    resetVideoCallService();
  });

  describe('initialization', () => {
    it('initializes with default configuration', () => {
      const config = service.getConfig();
      
      expect(config.maxParticipants).toBe(12);
      expect(config.defaultVideoEnabled).toBe(true);
      expect(config.defaultAudioEnabled).toBe(true);
      expect(config.videoConstraints).toBeDefined();
      expect(config.audioConstraints).toBeDefined();
    });

    it('accepts custom configuration', () => {
      const customService = new VideoCallService({
        maxParticipants: 6,
        defaultVideoEnabled: false
      });

      const config = customService.getConfig();
      expect(config.maxParticipants).toBe(6);
      expect(config.defaultVideoEnabled).toBe(false);
      
      customService.dispose();
    });

    it('starts disconnected', () => {
      expect(service.isInCall()).toBe(false);
      expect(service.getRoomId()).toBeNull();
      expect(service.getParticipantCount()).toBe(0);
    });
  });

  describe('joining calls', () => {
    it('joins call successfully', async () => {
      const eventSpy = jest.fn();
      service.on('participant-joined', eventSpy);
      service.on('connection-state-changed', eventSpy);

      await service.joinCall('room-123', 'user-1', 'John Doe');

      expect(service.isInCall()).toBe(true);
      expect(service.getRoomId()).toBe('room-123');
      expect(service.getParticipantCount()).toBe(1);
      
      const localParticipant = service.getLocalParticipant();
      expect(localParticipant).toBeDefined();
      expect(localParticipant?.userId).toBe('user-1');
      expect(localParticipant?.displayName).toBe('John Doe');
      expect(localParticipant?.isLocal).toBe(true);

      expect(eventSpy).toHaveBeenCalledWith(localParticipant);
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    it('prevents joining when already connected', async () => {
      await service.joinCall('room-123', 'user-1', 'John Doe');

      await expect(service.joinCall('room-456', 'user-2', 'Jane Smith'))
        .rejects.toThrow('Already connected to a call');
    });

    it('handles join failure', async () => {
      const error = new Error('Permission denied');
      mockGetUserMedia.mockRejectedValue(error);

      const errorSpy = jest.fn();
      service.on('error', errorSpy);

      await expect(service.joinCall('room-123', 'user-1', 'John Doe'))
        .rejects.toThrow('Permission denied');

      expect(service.isInCall()).toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('leaving calls', () => {
    beforeEach(async () => {
      await service.joinCall('room-123', 'user-1', 'John Doe');
    });

    it('leaves call successfully', async () => {
      const eventSpy = jest.fn();
      service.on('connection-state-changed', eventSpy);

      await service.leaveCall();

      expect(service.isInCall()).toBe(false);
      expect(service.getRoomId()).toBeNull();
      expect(service.getParticipantCount()).toBe(0);
      expect(service.getLocalParticipant()).toBeNull();
      
      expect(eventSpy).toHaveBeenCalledWith('disconnected');
    });

    it('handles leaving when not connected gracefully', async () => {
      await service.leaveCall(); // Leave first time
      
      // Should not throw on second leave
      await expect(service.leaveCall()).resolves.toBeUndefined();
    });

    it('stops media tracks when leaving', async () => {
      const localParticipant = service.getLocalParticipant();
      const videoTrack = localParticipant?.videoTrack;
      const audioTrack = localParticipant?.audioTrack;

      await service.leaveCall();

      expect(videoTrack?.stop).toHaveBeenCalled();
      expect(audioTrack?.stop).toHaveBeenCalled();
    });
  });

  describe('audio and video controls', () => {
    beforeEach(async () => {
      await service.joinCall('room-123', 'user-1', 'John Doe');
    });

    it('toggles audio mute', () => {
      const eventSpy = jest.fn();
      service.on('participant-updated', eventSpy);

      const localParticipant = service.getLocalParticipant();
      expect(localParticipant?.isMuted).toBe(false);

      // Mute
      const isMuted = service.toggleAudio();
      expect(isMuted).toBe(false); // Returns enabled state (false when muted)
      expect(localParticipant?.isMuted).toBe(true);
      expect(localParticipant?.audioTrack?.enabled).toBe(false);

      // Unmute
      const isUnmuted = service.toggleAudio();
      expect(isUnmuted).toBe(true);
      expect(localParticipant?.isMuted).toBe(false);
      expect(localParticipant?.audioTrack?.enabled).toBe(true);

      expect(eventSpy).toHaveBeenCalledTimes(2);
    });

    it('toggles video enable/disable', () => {
      const eventSpy = jest.fn();
      service.on('participant-updated', eventSpy);

      const localParticipant = service.getLocalParticipant();
      expect(localParticipant?.isVideoEnabled).toBe(true);

      // Disable video
      const isDisabled = service.toggleVideo();
      expect(isDisabled).toBe(false);
      expect(localParticipant?.isVideoEnabled).toBe(false);
      expect(localParticipant?.videoTrack?.enabled).toBe(false);

      // Enable video
      const isEnabled = service.toggleVideo();
      expect(isEnabled).toBe(true);
      expect(localParticipant?.isVideoEnabled).toBe(true);
      expect(localParticipant?.videoTrack?.enabled).toBe(true);

      expect(eventSpy).toHaveBeenCalledTimes(2);
    });

    it('handles toggle when no tracks available', () => {
      // Create service without media tracks
      const serviceNoMedia = new VideoCallService();
      
      expect(serviceNoMedia.toggleAudio()).toBe(false);
      expect(serviceNoMedia.toggleVideo()).toBe(false);
      
      serviceNoMedia.dispose();
    });
  });

  describe('participant management', () => {
    beforeEach(async () => {
      await service.joinCall('room-123', 'user-1', 'John Doe');
    });

    it('adds remote participants', () => {
      const eventSpy = jest.fn();
      service.on('participant-joined', eventSpy);

      const remoteParticipant = {
        id: 'remote-user-2',
        userId: 'user-2',
        displayName: 'Jane Smith',
        isMuted: false,
        isVideoEnabled: true
      };

      service.addRemoteParticipant(remoteParticipant);

      expect(service.getParticipantCount()).toBe(2);
      const participant = service.getParticipant('remote-user-2');
      expect(participant).toBeDefined();
      expect(participant?.isLocal).toBe(false);
      
      expect(eventSpy).toHaveBeenCalledTimes(2); // Local + remote
    });

    it('removes remote participants', () => {
      const remoteParticipant = {
        id: 'remote-user-2',
        userId: 'user-2',
        displayName: 'Jane Smith',
        isMuted: false,
        isVideoEnabled: true
      };

      service.addRemoteParticipant(remoteParticipant);
      expect(service.getParticipantCount()).toBe(2);

      const eventSpy = jest.fn();
      service.on('participant-left', eventSpy);

      service.removeRemoteParticipant('remote-user-2');

      expect(service.getParticipantCount()).toBe(1);
      expect(service.getParticipant('remote-user-2')).toBeUndefined();
      expect(eventSpy).toHaveBeenCalledWith('remote-user-2');
    });

    it('does not remove local participant', () => {
      const localParticipant = service.getLocalParticipant();
      
      service.removeRemoteParticipant(localParticipant!.id);
      
      expect(service.getParticipantCount()).toBe(1);
      expect(service.getLocalParticipant()).toBe(localParticipant);
    });

    it('gets participants correctly', () => {
      const remoteParticipant = {
        id: 'remote-user-2',
        userId: 'user-2',
        displayName: 'Jane Smith',
        isMuted: false,
        isVideoEnabled: true
      };

      service.addRemoteParticipant(remoteParticipant);

      const allParticipants = service.getParticipants();
      const remoteParticipants = service.getRemoteParticipants();

      expect(allParticipants).toHaveLength(2);
      expect(remoteParticipants).toHaveLength(1);
      expect(remoteParticipants[0].isLocal).toBe(false);
    });
  });

  describe('track management', () => {
    beforeEach(async () => {
      await service.joinCall('room-123', 'user-1', 'John Doe');
    });

    it('adds tracks to participants', () => {
      const remoteParticipant = {
        id: 'remote-user-2',
        userId: 'user-2',
        displayName: 'Jane Smith',
        isMuted: false,
        isVideoEnabled: true
      };

      service.addRemoteParticipant(remoteParticipant);

      const eventSpy = jest.fn();
      service.on('track-added', eventSpy);
      service.on('participant-updated', eventSpy);

      const mockTrack = new MockMediaStreamTrack();
      const mockStream = new MockMediaStream();

      service.addTrack('remote-user-2', mockTrack, mockStream);

      const participant = service.getParticipant('remote-user-2');
      expect(participant?.videoTrack).toBe(mockTrack);
      expect(participant?.stream).toBe(mockStream);
      
      expect(eventSpy).toHaveBeenCalledWith({
        participantId: 'remote-user-2',
        track: mockTrack,
        kind: 'video'
      });
    });

    it('removes tracks from participants', () => {
      const remoteParticipant = {
        id: 'remote-user-2',
        userId: 'user-2',
        displayName: 'Jane Smith',
        isMuted: false,
        isVideoEnabled: true
      };

      service.addRemoteParticipant(remoteParticipant);

      const mockTrack = new MockMediaStreamTrack();
      const mockStream = new MockMediaStream();
      service.addTrack('remote-user-2', mockTrack, mockStream);

      const eventSpy = jest.fn();
      service.on('track-removed', eventSpy);

      service.removeTrack('remote-user-2', mockTrack.id);

      const participant = service.getParticipant('remote-user-2');
      expect(participant?.videoTrack).toBeUndefined();
      
      expect(eventSpy).toHaveBeenCalledWith({
        participantId: 'remote-user-2',
        trackId: mockTrack.id,
        kind: 'video'
      });
    });
  });

  describe('capacity management', () => {
    it('tracks max capacity', () => {
      const customService = new VideoCallService({ maxParticipants: 2 });
      
      expect(customService.isAtMaxCapacity()).toBe(false);
      
      // Add participants up to limit would require actual implementation
      // This is a placeholder test for the concept
      
      customService.dispose();
    });
  });

  describe('singleton behavior', () => {
    it('returns same instance from getVideoCallService', () => {
      const instance1 = getVideoCallService();
      const instance2 = getVideoCallService();
      
      expect(instance1).toBe(instance2);
    });

    it('creates new instance after reset', () => {
      const instance1 = getVideoCallService();
      
      resetVideoCallService();
      
      const instance2 = getVideoCallService();
      expect(instance1).not.toBe(instance2);
    });

    it('disposes service on reset', () => {
      const instance = getVideoCallService();
      const disposeSpy = jest.spyOn(instance, 'dispose');
      
      resetVideoCallService();
      
      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('emits error events', () => {
      const errorSpy = jest.fn();
      service.on('error', errorSpy);

      const testError = new Error('Test error');
      service.emit('error', testError);

      expect(errorSpy).toHaveBeenCalledWith(testError);
    });
  });

  describe('cleanup and disposal', () => {
    it('cleans up resources on dispose', async () => {
      await service.joinCall('room-123', 'user-1', 'John Doe');
      
      const localParticipant = service.getLocalParticipant();
      const videoTrack = localParticipant?.videoTrack;
      const audioTrack = localParticipant?.audioTrack;

      service.dispose();

      // Should stop tracks and clean up
      expect(videoTrack?.stop).toHaveBeenCalled();
      expect(audioTrack?.stop).toHaveBeenCalled();
    });
  });
});
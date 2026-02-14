import { getLiveKitService } from '@/services/livekit';
import { VoiceChannel, VoiceParticipant, VoiceSettings } from '@/stores/voice-store';

export interface VoiceChannelCreateOptions {
  name: string;
  serverId?: string;
  maxParticipants?: number;
  metadata?: Record<string, any>;
}

export interface VoiceChannelJoinOptions {
  identity: string;
  name?: string;
  matrixAccessToken?: string;
  autoEnableAudio?: boolean;
  autoEnableVideo?: boolean;
}

export interface VoiceChannelInfo {
  id: string;
  name: string;
  serverId?: string;
  participantCount: number;
  maxParticipants?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  groupId: string;
}

/**
 * Voice Channel Service
 * High-level service for managing voice channels and participants
 * Uses the existing LiveKit service for low-level operations
 */
export class VoiceChannelService {
  private liveKit = getLiveKitService();
  private currentChannel: VoiceChannelInfo | null = null;
  private mediaDevices: MediaDeviceInfo[] = [];
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;

  /**
   * Get available audio/video devices
   */
  async getMediaDevices(refresh = false): Promise<MediaDeviceInfo[]> {
    if (!refresh && this.mediaDevices.length > 0) {
      return this.mediaDevices;
    }

    try {
      // Request permissions first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      this.mediaDevices = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind as 'audioinput' | 'audiooutput' | 'videoinput',
        groupId: device.groupId,
      }));

      return this.mediaDevices;
    } catch (error) {
      console.error('Failed to enumerate media devices:', error);
      throw new Error(`Failed to get media devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get audio input devices (microphones)
   */
  async getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await this.getMediaDevices();
    return devices.filter(device => device.kind === 'audioinput');
  }

  /**
   * Get audio output devices (speakers/headphones)
   */
  async getAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await this.getMediaDevices();
    return devices.filter(device => device.kind === 'audiooutput');
  }

  /**
   * Get video input devices (cameras)
   */
  async getVideoInputDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await this.getMediaDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  /**
   * Create a new voice channel
   */
  async createChannel(options: VoiceChannelCreateOptions): Promise<VoiceChannelInfo> {
    try {
      // For LiveKit, creating a channel is just providing a unique room name
      const channelInfo: VoiceChannelInfo = {
        id: this.generateChannelId(options.name),
        name: options.name,
        serverId: options.serverId,
        participantCount: 0,
        maxParticipants: options.maxParticipants,
        metadata: options.metadata,
        createdAt: new Date(),
      };

      return channelInfo;
    } catch (error) {
      throw new Error(`Failed to create voice channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Join a voice channel
   */
  async joinChannel(channelId: string, options: VoiceChannelJoinOptions): Promise<void> {
    try {
      // Request token and connect
      const token = await this.liveKit.requestToken(channelId, options.identity, {
        name: options.name,
        matrixAccessToken: options.matrixAccessToken,
      });

      await this.liveKit.connectToRoom(channelId, token);

      // Set initial media states
      if (options.autoEnableAudio !== false) {
        await this.liveKit.setAudioEnabled(true);
      }
      if (options.autoEnableVideo === true) {
        await this.liveKit.setVideoEnabled(true);
      }

      this.currentChannel = {
        id: channelId,
        name: channelId, // TODO: Get actual channel name from server
        participantCount: 0, // Will be updated by participant events
      };
    } catch (error) {
      throw new Error(`Failed to join voice channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Leave the current voice channel
   */
  async leaveChannel(): Promise<void> {
    try {
      await this.liveKit.disconnect();
      this.currentChannel = null;
      
      // Clean up media resources
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
    } catch (error) {
      throw new Error(`Failed to leave voice channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current channel information
   */
  getCurrentChannel(): VoiceChannelInfo | null {
    return this.currentChannel;
  }

  /**
   * Check if currently connected to a channel
   */
  isConnected(): boolean {
    return this.liveKit.isConnected();
  }

  /**
   * Set audio input device
   */
  async setAudioInputDevice(deviceId: string): Promise<void> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      // Switch audio input device
      await room.localParticipant.setMicrophoneEnabled(true, {
        deviceId: deviceId !== 'default' ? { exact: deviceId } : undefined,
      });
    } catch (error) {
      throw new Error(`Failed to set audio input device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set audio output device (where supported)
   */
  async setAudioOutputDevice(deviceId: string): Promise<void> {
    try {
      // Note: Audio output device selection is not universally supported
      // This is a best-effort implementation
      if ('setSinkId' in HTMLAudioElement.prototype) {
        const audioElements = document.querySelectorAll('audio');
        const promises = Array.from(audioElements).map(audio => {
          if ('setSinkId' in audio) {
            return (audio as any).setSinkId(deviceId);
          }
          return Promise.resolve();
        });
        await Promise.all(promises);
      } else {
        console.warn('Audio output device selection not supported in this browser');
      }
    } catch (error) {
      throw new Error(`Failed to set audio output device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set video input device
   */
  async setVideoInputDevice(deviceId: string): Promise<void> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      // Switch video input device
      await room.localParticipant.setCameraEnabled(true, {
        deviceId: deviceId !== 'default' ? { exact: deviceId } : undefined,
      });
    } catch (error) {
      throw new Error(`Failed to set video input device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test microphone level
   */
  async testMicrophone(deviceId?: string): Promise<number> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;

      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      return new Promise((resolve) => {
        let maxLevel = 0;
        let sampleCount = 0;
        
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const level = Math.max(...dataArray) / 255;
          maxLevel = Math.max(maxLevel, level);
          sampleCount++;
          
          if (sampleCount < 30) {
            requestAnimationFrame(checkLevel);
          } else {
            stream.getTracks().forEach(track => track.stop());
            resolve(maxLevel);
          }
        };
        
        checkLevel();
      });
    } catch (error) {
      throw new Error(`Failed to test microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply voice settings
   */
  async applySettings(settings: Partial<VoiceSettings>): Promise<void> {
    try {
      if (settings.inputDevice !== undefined) {
        await this.setAudioInputDevice(settings.inputDevice || 'default');
      }

      if (settings.outputDevice !== undefined) {
        await this.setAudioOutputDevice(settings.outputDevice || 'default');
      }

      // Note: Volume, noise suppression, echo cancellation, and auto gain control
      // are typically handled at the browser/OS level or by the LiveKit client
      // Implementation would depend on browser support and LiveKit features
      
    } catch (error) {
      throw new Error(`Failed to apply voice settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a unique channel ID
   */
  private generateChannelId(name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `${sanitized}-${timestamp}-${random}`;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let voiceChannelService: VoiceChannelService | null = null;

/**
 * Get the global voice channel service instance
 */
export function getVoiceChannelService(): VoiceChannelService {
  if (!voiceChannelService) {
    voiceChannelService = new VoiceChannelService();
  }
  return voiceChannelService;
}

/**
 * Initialize voice channel service
 */
export function initializeVoiceChannelService(): VoiceChannelService {
  voiceChannelService = new VoiceChannelService();
  return voiceChannelService;
}

export default VoiceChannelService;
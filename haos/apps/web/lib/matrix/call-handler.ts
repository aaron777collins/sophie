import { MatrixClient, MatrixEvent, RoomEvent, CallEvent } from 'matrix-js-sdk';
import { useCallStore } from '@/stores/call-store';
import { useRoomStore, ActiveCall, CallParticipant } from '@/stores/room-store';
import { useVoiceStore } from '@/stores/voice-store';

export interface MatrixCallInvite {
  callId: string;
  roomId: string;
  inviter: string;
  type: 'voice' | 'video';
  sdp?: string;
  lifetime?: number;
}

export interface MatrixCallAnswer {
  callId: string;
  sdp: string;
}

export interface MatrixCallHangup {
  callId: string;
  reason?: 'user_hangup' | 'ice_failed' | 'invite_timeout' | 'unknown_error';
}

export interface MatrixCallCandidates {
  callId: string;
  candidates: RTCIceCandidate[];
}

export class MatrixCallHandler {
  private client: MatrixClient;
  private callStore: {
    addIncomingCall: (call: any) => void;
    removeIncomingCall: (callId: string) => void;
    acceptIncomingCall: (callId: string) => void;
    rejectIncomingCall: (callId: string) => void;
    getIncomingCalls: () => any[];
    startCall: (roomId: string, roomName: string, type: 'voice' | 'video') => string;
    endCall: (roomId: string) => void;
    addNotification: (notification: any) => void;
  };
  private roomStore: {
    setActiveCall: (roomId: string, call: ActiveCall | null) => void;
    updateCallStatus: (roomId: string, status: ActiveCall['status']) => void;
    isCallActive: (roomId: string) => boolean;
    addCallParticipant: (roomId: string, participant: CallParticipant) => void;
    removeCallParticipant: (roomId: string, userId: string) => void;
    isMutedCallNotifications: (roomId: string) => boolean;
  };
  private voiceStore: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    connectionState: string;
  };
  
  private activeCalls: Map<string, {
    callId: string;
    roomId: string;
    peerConnection?: RTCPeerConnection;
    localStream?: MediaStream;
    remoteStream?: MediaStream;
  }> = new Map();

  private ringtoneAudio?: HTMLAudioElement;
  private callEndAudio?: HTMLAudioElement;

  constructor(
    client: MatrixClient,
    callStore: {
      addIncomingCall: (call: any) => void;
      removeIncomingCall: (callId: string) => void;
      acceptIncomingCall: (callId: string) => void;
      rejectIncomingCall: (callId: string) => void;
      getIncomingCalls: () => any[];
      startCall: (roomId: string, roomName: string, type: 'voice' | 'video') => string;
      endCall: (roomId: string) => void;
      addNotification: (notification: any) => void;
    },
    roomStore: {
      setActiveCall: (roomId: string, call: ActiveCall | null) => void;
      updateCallStatus: (roomId: string, status: ActiveCall['status']) => void;
      isCallActive: (roomId: string) => boolean;
      addCallParticipant: (roomId: string, participant: CallParticipant) => void;
      removeCallParticipant: (roomId: string, userId: string) => void;
      isMutedCallNotifications: (roomId: string) => boolean;
    },
    voiceStore: {
      isAudioEnabled: boolean;
      isVideoEnabled: boolean;
      connectionState: string;
    }
  ) {
    this.client = client;
    this.callStore = callStore;
    this.roomStore = roomStore;
    this.voiceStore = voiceStore;
    
    this.setupEventListeners();
    this.setupAudioNotifications();
  }

  private setupEventListeners() {
    // Matrix call events
    this.client.on('event' as any, this.handleMatrixEvent.bind(this));
    
    // Room timeline events for call-related messages
    this.client.on(RoomEvent.Timeline, this.handleTimelineEvent.bind(this));
  }

  private setupAudioNotifications() {
    try {
      // Create ringtone audio element
      this.ringtoneAudio = new Audio('/sounds/ringtone.mp3');
      this.ringtoneAudio.loop = true;
      this.ringtoneAudio.volume = 0.7;
      
      // Create call end audio element
      this.callEndAudio = new Audio('/sounds/call-end.mp3');
      this.callEndAudio.volume = 0.5;
    } catch (error) {
      console.warn('Could not initialize audio notifications:', error);
    }
  }

  private async handleMatrixEvent(event: MatrixEvent) {
    if (!event.getType().startsWith('m.call.')) return;

    const roomId = event.getRoomId();
    const sender = event.getSender();
    
    if (!roomId || !sender) return;

    try {
      switch (event.getType()) {
        case 'm.call.invite':
          await this.handleCallInvite(event, roomId, sender);
          break;
        case 'm.call.answer':
          await this.handleCallAnswer(event, roomId, sender);
          break;
        case 'm.call.hangup':
          await this.handleCallHangup(event, roomId, sender);
          break;
        case 'm.call.candidates':
          await this.handleCallCandidates(event, roomId, sender);
          break;
        default:
          console.log('Unhandled call event:', event.getType());
      }
    } catch (error) {
      console.error(`Error handling ${event.getType()}:`, error);
      
      // Add error notification
      this.callStore.addNotification({
        type: 'call-error',
        roomId,
        roomName: this.getRoomName(roomId),
        message: `Call error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        autoHide: true,
        duration: 5000,
      });
    }
  }

  private async handleTimelineEvent(event: MatrixEvent, room: any) {
    // Handle other call-related events that might come through timeline
    const eventType = event.getType();
    const roomId = room.roomId;
    
    if (eventType === 'm.room.member') {
      // Track participant joins/leaves during calls
      const membership = event.getContent()['membership'];
      const userId = event.getStateKey();
      
      if (this.roomStore.isCallActive(roomId) && userId) {
        if (membership === 'join') {
          await this.handleParticipantJoined(roomId, userId, event);
        } else if (membership === 'leave' || membership === 'ban') {
          await this.handleParticipantLeft(roomId, userId);
        }
      }
    }
  }

  private async handleCallInvite(event: MatrixEvent, roomId: string, inviter: string) {
    const content = event.getContent();
    const callId = content['call_id'];
    const version = content['version'] || 0;
    
    if (!callId) {
      console.error('Call invite missing call_id');
      return;
    }

    // Determine call type from offer SDP or explicit field
    const hasVideo = content['offer']?.['sdp']?.includes('m=video') || content['type'] === 'video';
    const callType: 'voice' | 'video' = hasVideo ? 'video' : 'voice';

    // Get inviter details
    const inviterUser = this.client.getUser(inviter);
    const roomName = this.getRoomName(roomId);

    const incomingCall = {
      callId,
      roomId,
      roomName,
      type: callType,
      initiator: {
        userId: inviter,
        displayName: inviterUser?.displayName || inviter,
        avatar: inviterUser?.avatarUrl || undefined,
      },
      receivedAt: new Date(),
      timeout: content['lifetime'] ? Math.floor(content['lifetime'] / 1000) : 30, // Convert to seconds
    };

    // Add to incoming calls
    this.callStore.addIncomingCall(incomingCall);

    // Create active call in room store
    const activeCall: ActiveCall = {
      callId,
      roomId,
      type: callType,
      startTime: new Date(),
      status: 'calling',
      initiatorUserId: inviter,
    };
    
    this.roomStore.setActiveCall(roomId, activeCall);

    // Play ringtone if not muted
    if (!this.roomStore.isMutedCallNotifications(roomId) && this.ringtoneAudio) {
      try {
        await this.ringtoneAudio.play();
      } catch (error) {
        console.warn('Could not play ringtone:', error);
      }
    }

    // Auto-timeout handling
    if (content['lifetime']) {
      setTimeout(() => {
        if (this.callStore.getIncomingCalls().some(call => call.callId === callId)) {
          this.callStore.removeIncomingCall(callId);
          this.roomStore.updateCallStatus(roomId, 'ended');
          this.stopRingtone();
        }
      }, content['lifetime']);
    }

    console.log(`Incoming ${callType} call from ${inviter} in ${roomName}`);
  }

  private async handleCallAnswer(event: MatrixEvent, roomId: string, answerer: string) {
    const content = event.getContent();
    const callId = content['call_id'];
    
    if (!callId) return;

    // Stop ringtone
    this.stopRingtone();

    // Update call status
    this.roomStore.updateCallStatus(roomId, 'connecting');

    // Remove from incoming calls if it exists
    this.callStore.removeIncomingCall(callId);

    // Handle WebRTC answer (if we're the caller)
    const activeCall = this.activeCalls.get(callId);
    if (activeCall?.peerConnection && content['answer']?.['sdp']) {
      try {
        await activeCall.peerConnection.setRemoteDescription({
          type: 'answer',
          sdp: content['answer']['sdp'],
        });
        
        // Update to active status
        this.roomStore.updateCallStatus(roomId, 'active');
        
        console.log(`Call answered by ${answerer} in room ${roomId}`);
      } catch (error) {
        console.error('Failed to set remote description:', error);
        this.endCall(callId);
      }
    }
  }

  private async handleCallHangup(event: MatrixEvent, roomId: string, sender: string) {
    const content = event.getContent();
    const callId = content['call_id'];
    const reason = (content['reason'] as string) || 'user_hangup';
    
    if (!callId) return;

    console.log(`Call ${callId} ended by ${sender}: ${reason}`);

    // Stop ringtone
    this.stopRingtone();

    // Play call end sound
    if (this.callEndAudio) {
      try {
        await this.callEndAudio.play();
      } catch (error) {
        console.warn('Could not play call end sound:', error);
      }
    }

    // Clean up the call
    await this.cleanupCall(callId, roomId);

    // Update stores
    this.callStore.removeIncomingCall(callId);
    this.roomStore.setActiveCall(roomId, null);

    // Add notification about call end
    const reasonMessages: Record<string, string> = {
      'user_hangup': 'Call ended',
      'ice_failed': 'Call failed (connection error)',
      'invite_timeout': 'Call timed out',
      'unknown_error': 'Call failed (unknown error)',
    };
    const reasonMessage = reasonMessages[reason] || 'Call ended';

    this.callStore.addNotification({
      type: 'call-ended',
      roomId,
      roomName: this.getRoomName(roomId),
      message: reasonMessage,
      autoHide: true,
      duration: 3000,
    });
  }

  private async handleCallCandidates(event: MatrixEvent, roomId: string, sender: string) {
    const content = event.getContent();
    const callId = content['call_id'];
    const candidates = content['candidates'] || [];
    
    if (!callId || !candidates.length) return;

    const activeCall = this.activeCalls.get(callId);
    if (activeCall?.peerConnection) {
      for (const candidate of candidates) {
        try {
          await activeCall.peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('Failed to add ICE candidate:', error);
        }
      }
    }
  }

  private async handleParticipantJoined(roomId: string, userId: string, event: MatrixEvent) {
    const user = this.client.getUser(userId);
    const content = event.getContent();
    
    const participant: CallParticipant = {
      // VoiceParticipant fields
      identity: userId,
      name: user?.displayName || userId,
      avatar: user?.avatarUrl,
      isSpeaking: false,
      isAudioEnabled: content['currently_active'] !== false, // Default true unless explicitly false
      isVideoEnabled: false, // Start with video off
      isScreenSharing: false,
      isLocal: userId === this.client.getUserId(),
      connectionQuality: 'excellent',
      
      // CallParticipant additional fields
      userId,
      displayName: user?.displayName || userId,
      powerLevel: this.getUserPowerLevel(roomId, userId),
      joinedAt: new Date(),
      connectionState: 'connected',
      mediaState: {
        audio: content['currently_active'] !== false, // Default true unless explicitly false
        video: false, // Start with video off
        screenshare: false,
      },
    };

    this.roomStore.addCallParticipant(roomId, participant);

    console.log(`Participant ${userId} joined call in ${roomId}`);
  }

  private async handleParticipantLeft(roomId: string, userId: string) {
    this.roomStore.removeCallParticipant(roomId, userId);
    console.log(`Participant ${userId} left call in ${roomId}`);
  }

  // Public methods for call management

  public async initiateCall(roomId: string, type: 'voice' | 'video'): Promise<string> {
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          // Add TURN servers if available
        ],
      });

      // Set up media constraints
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: type === 'video',
      };

      // Get user media
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add local stream to peer connection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Store active call
      this.activeCalls.set(callId, {
        callId,
        roomId,
        peerConnection,
        localStream,
      });

      // Send Matrix call invite
      await this.client.sendEvent(roomId, 'm.call.invite' as any, {
        call_id: callId,
        lifetime: 30000, // 30 seconds
        offer: {
          type: 'offer',
          sdp: offer.sdp,
        },
        version: 1,
        type: type,
      });

      // Update stores
      const activeCall: ActiveCall = {
        callId,
        roomId,
        type,
        startTime: new Date(),
        status: 'calling',
        initiatorUserId: this.client.getUserId() || undefined,
      };

      this.roomStore.setActiveCall(roomId, activeCall);
      this.callStore.startCall(roomId, this.getRoomName(roomId), type);

      console.log(`Initiated ${type} call ${callId} in ${roomId}`);
      return callId;

    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  }

  public async answerCall(callId: string): Promise<void> {
    const incomingCall = this.callStore.getIncomingCalls().find(call => call.callId === callId);
    if (!incomingCall) {
      throw new Error('Call not found');
    }

    try {
      // Stop ringtone
      this.stopRingtone();

      // Accept the call in the store
      this.callStore.acceptIncomingCall(callId);

      // Send Matrix answer (simplified - in practice you'd set up WebRTC)
      await this.client.sendEvent(incomingCall.roomId, 'm.call.answer' as any, {
        call_id: callId,
        answer: {
          type: 'answer',
          sdp: 'placeholder-sdp', // In practice, generate real SDP
        },
        version: 1,
      });

      // Update call status
      this.roomStore.updateCallStatus(incomingCall.roomId, 'active');

      console.log(`Answered call ${callId}`);
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }

  public async rejectCall(callId: string): Promise<void> {
    const incomingCall = this.callStore.getIncomingCalls().find(call => call.callId === callId);
    if (!incomingCall) {
      throw new Error('Call not found');
    }

    try {
      // Stop ringtone
      this.stopRingtone();

      // Reject in store
      this.callStore.rejectIncomingCall(callId);

      // Send Matrix hangup
      await this.client.sendEvent(incomingCall.roomId, 'm.call.hangup' as any, {
        call_id: callId,
        reason: 'user_hangup',
        version: 1,
      });

      // Clear room call state
      this.roomStore.setActiveCall(incomingCall.roomId, null);

      console.log(`Rejected call ${callId}`);
    } catch (error) {
      console.error('Failed to reject call:', error);
      throw error;
    }
  }

  public async endCall(callId: string): Promise<void> {
    const activeCallData = Array.from(this.activeCalls.entries()).find(([, data]) => data.callId === callId);
    
    if (!activeCallData) {
      console.warn(`No active call found for callId: ${callId}`);
      return;
    }

    const [, { roomId }] = activeCallData;

    try {
      // Send Matrix hangup
      await this.client.sendEvent(roomId, 'm.call.hangup' as any, {
        call_id: callId,
        reason: 'user_hangup',
        version: 1,
      });

      // Clean up locally
      await this.cleanupCall(callId, roomId);

      console.log(`Ended call ${callId}`);
    } catch (error) {
      console.error('Failed to end call:', error);
      throw error;
    }
  }

  private async cleanupCall(callId: string, roomId: string) {
    const activeCall = this.activeCalls.get(callId);
    
    if (activeCall) {
      // Stop local stream
      if (activeCall.localStream) {
        activeCall.localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (activeCall.peerConnection) {
        activeCall.peerConnection.close();
      }

      // Remove from active calls
      this.activeCalls.delete(callId);
    }

    // Update stores
    this.roomStore.setActiveCall(roomId, null);
    this.callStore.endCall(roomId);

    // Stop ringtone
    this.stopRingtone();
  }

  private stopRingtone() {
    if (this.ringtoneAudio) {
      this.ringtoneAudio.pause();
      this.ringtoneAudio.currentTime = 0;
    }
  }

  private getRoomName(roomId: string): string {
    const room = this.client.getRoom(roomId);
    return room?.name || roomId;
  }

  private getUserPowerLevel(roomId: string, userId: string): number {
    const room = this.client.getRoom(roomId);
    if (!room) return 0;

    const powerLevelEvent = room.currentState.getStateEvents('m.room.power_levels', '');
    if (!powerLevelEvent) return 0;

    const content = powerLevelEvent.getContent();
    const userLevels = content['users'] || {};
    const defaultLevel = content['users_default'] || 0;

    return userLevels[userId] || defaultLevel;
  }

  // Cleanup method
  public destroy() {
    // Remove event listeners
    this.client.off('event' as any, this.handleMatrixEvent.bind(this));
    this.client.off(RoomEvent.Timeline, this.handleTimelineEvent.bind(this));

    // Stop ringtone
    this.stopRingtone();

    // Clean up all active calls
    for (const [callId] of this.activeCalls) {
      const activeCallData = this.activeCalls.get(callId);
      if (activeCallData) {
        this.cleanupCall(callId, activeCallData.roomId);
      }
    }
  }
}

// Global handler instance (should be initialized once in the app)
let globalCallHandler: MatrixCallHandler | null = null;

export function initializeMatrixCallHandler(
  client: MatrixClient,
  callStore: {
    addIncomingCall: (call: any) => void;
    removeIncomingCall: (callId: string) => void;
    acceptIncomingCall: (callId: string) => void;
    rejectIncomingCall: (callId: string) => void;
    getIncomingCalls: () => any[];
    startCall: (roomId: string, roomName: string, type: 'voice' | 'video') => string;
    endCall: (roomId: string) => void;
    addNotification: (notification: any) => void;
  },
  roomStore: {
    setActiveCall: (roomId: string, call: ActiveCall | null) => void;
    updateCallStatus: (roomId: string, status: ActiveCall['status']) => void;
    isCallActive: (roomId: string) => boolean;
    addCallParticipant: (roomId: string, participant: CallParticipant) => void;
    removeCallParticipant: (roomId: string, userId: string) => void;
    isMutedCallNotifications: (roomId: string) => boolean;
  },
  voiceStore: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    connectionState: string;
  }
): MatrixCallHandler {
  if (globalCallHandler) {
    globalCallHandler.destroy();
  }
  
  globalCallHandler = new MatrixCallHandler(client, callStore, roomStore, voiceStore);
  return globalCallHandler;
}

export function getMatrixCallHandler(): MatrixCallHandler | null {
  return globalCallHandler;
}

export function destroyMatrixCallHandler(): void {
  if (globalCallHandler) {
    globalCallHandler.destroy();
    globalCallHandler = null;
  }
}
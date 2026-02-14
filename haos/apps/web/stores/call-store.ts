import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VoiceParticipant } from './voice-store';

export interface RoomCall {
  roomId: string;
  roomName: string;
  callId?: string;
  type: 'voice' | 'video';
  participants: VoiceParticipant[];
  isLocalUserInCall: boolean;
  startTime: Date;
  endTime?: Date;
  status: 'calling' | 'ringing' | 'active' | 'ended';
  initiator?: {
    userId: string;
    displayName: string;
    avatar?: string;
  };
}

export interface IncomingCall {
  callId: string;
  roomId: string;
  roomName: string;
  type: 'voice' | 'video';
  initiator: {
    userId: string;
    displayName: string;
    avatar?: string;
  };
  receivedAt: Date;
  timeout?: number; // seconds
}

export interface CallNotification {
  id: string;
  type: 'call-started' | 'call-ended' | 'participant-joined' | 'participant-left' | 'call-error';
  roomId: string;
  roomName: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number; // ms
  participant?: {
    userId: string;
    displayName: string;
    avatar?: string;
  };
}

interface CallState {
  // Active calls per room
  activeCalls: Map<string, RoomCall>;
  
  // Incoming calls waiting for response
  incomingCalls: Map<string, IncomingCall>;
  
  // Call notifications queue
  notifications: CallNotification[];
  
  // Matrix presence sync settings
  syncMatrixPresence: boolean;
  
  // Actions - Call Management
  startCall: (roomId: string, roomName: string, type: 'voice' | 'video', initiator?: RoomCall['initiator']) => string;
  endCall: (roomId: string) => void;
  updateCallStatus: (roomId: string, status: RoomCall['status']) => void;
  joinCall: (roomId: string) => void;
  leaveCall: (roomId: string) => void;
  
  // Actions - Participant Management
  addParticipantToCall: (roomId: string, participant: VoiceParticipant) => void;
  removeParticipantFromCall: (roomId: string, participantId: string) => void;
  updateCallParticipant: (roomId: string, participantId: string, updates: Partial<VoiceParticipant>) => void;
  
  // Actions - Incoming Calls
  addIncomingCall: (call: IncomingCall) => void;
  removeIncomingCall: (callId: string) => void;
  acceptIncomingCall: (callId: string) => void;
  rejectIncomingCall: (callId: string) => void;
  
  // Actions - Notifications
  addNotification: (notification: Omit<CallNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: (roomId?: string) => void;
  
  // Actions - Settings
  setSyncMatrixPresence: (sync: boolean) => void;
  
  // Getters
  getCallForRoom: (roomId: string) => RoomCall | null;
  hasActiveCall: (roomId?: string) => boolean;
  getActiveCalls: () => RoomCall[];
  getIncomingCalls: () => IncomingCall[];
  getNotifications: () => CallNotification[];
}

const initialState = {
  activeCalls: new Map<string, RoomCall>(),
  incomingCalls: new Map<string, IncomingCall>(),
  notifications: [],
  syncMatrixPresence: true,
};

export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Call Management
      startCall: (roomId: string, roomName: string, type: 'voice' | 'video', initiator) => {
        const callId = `call_${roomId}_${Date.now()}`;
        const call: RoomCall = {
          roomId,
          roomName,
          callId,
          type,
          participants: [],
          isLocalUserInCall: true,
          startTime: new Date(),
          status: 'calling',
          initiator,
        };
        
        const { activeCalls } = get();
        const newActiveCalls = new Map(activeCalls);
        newActiveCalls.set(roomId, call);
        
        set({ activeCalls: newActiveCalls });
        
        // Add notification
        get().addNotification({
          type: 'call-started',
          roomId,
          roomName,
          message: `${type === 'voice' ? 'Voice' : 'Video'} call started`,
          autoHide: true,
          duration: 3000,
        });
        
        return callId;
      },

      endCall: (roomId: string) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedCall = { ...call, status: 'ended' as const, endTime: new Date() };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.delete(roomId);
          
          set({ activeCalls: newActiveCalls });
          
          // Add notification
          get().addNotification({
            type: 'call-ended',
            roomId,
            roomName: call.roomName,
            message: `${call.type === 'voice' ? 'Voice' : 'Video'} call ended`,
            autoHide: true,
            duration: 3000,
          });
        }
      },

      updateCallStatus: (roomId: string, status: RoomCall['status']) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedCall = { ...call, status };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
        }
      },

      joinCall: (roomId: string) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedCall = { ...call, isLocalUserInCall: true };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
        }
      },

      leaveCall: (roomId: string) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedCall = { ...call, isLocalUserInCall: false };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
        }
      },

      // Participant Management
      addParticipantToCall: (roomId: string, participant: VoiceParticipant) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedParticipants = [...call.participants.filter(p => p.identity !== participant.identity), participant];
          const updatedCall = { ...call, participants: updatedParticipants };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
          
          // Add notification for new participant
          get().addNotification({
            type: 'participant-joined',
            roomId,
            roomName: call.roomName,
            message: `${participant.name} joined the call`,
            participant: {
              userId: participant.identity,
              displayName: participant.name,
              avatar: participant.avatar,
            },
            autoHide: true,
            duration: 3000,
          });
        }
      },

      removeParticipantFromCall: (roomId: string, participantId: string) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const participant = call.participants.find(p => p.identity === participantId);
          const updatedParticipants = call.participants.filter(p => p.identity !== participantId);
          const updatedCall = { ...call, participants: updatedParticipants };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
          
          // Add notification for departed participant
          if (participant) {
            get().addNotification({
              type: 'participant-left',
              roomId,
              roomName: call.roomName,
              message: `${participant.name} left the call`,
              participant: {
                userId: participant.identity,
                displayName: participant.name,
                avatar: participant.avatar,
              },
              autoHide: true,
              duration: 3000,
            });
          }
        }
      },

      updateCallParticipant: (roomId: string, participantId: string, updates: Partial<VoiceParticipant>) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedParticipants = call.participants.map(p => 
            p.identity === participantId ? { ...p, ...updates } : p
          );
          const updatedCall = { ...call, participants: updatedParticipants };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
        }
      },

      // Incoming Calls
      addIncomingCall: (call: IncomingCall) => {
        const { incomingCalls } = get();
        const newIncomingCalls = new Map(incomingCalls);
        newIncomingCalls.set(call.callId, call);
        set({ incomingCalls: newIncomingCalls });
      },

      removeIncomingCall: (callId: string) => {
        const { incomingCalls } = get();
        const newIncomingCalls = new Map(incomingCalls);
        newIncomingCalls.delete(callId);
        set({ incomingCalls: newIncomingCalls });
      },

      acceptIncomingCall: (callId: string) => {
        const { incomingCalls } = get();
        const call = incomingCalls.get(callId);
        
        if (call) {
          // Remove from incoming
          get().removeIncomingCall(callId);
          
          // Start the call
          get().startCall(call.roomId, call.roomName, call.type, call.initiator);
        }
      },

      rejectIncomingCall: (callId: string) => {
        const { incomingCalls } = get();
        const call = incomingCalls.get(callId);
        
        if (call) {
          get().removeIncomingCall(callId);
          
          // Could add notification about rejected call
          get().addNotification({
            type: 'call-ended',
            roomId: call.roomId,
            roomName: call.roomName,
            message: 'Incoming call rejected',
            autoHide: true,
            duration: 2000,
          });
        }
      },

      // Notifications
      addNotification: (notification: Omit<CallNotification, 'id' | 'timestamp'>) => {
        const { notifications } = get();
        const newNotification: CallNotification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        
        set({ notifications: [...notifications, newNotification] });
        
        // Auto-hide if configured
        if (notification.autoHide && notification.duration) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, notification.duration);
        }
      },

      removeNotification: (id: string) => {
        const { notifications } = get();
        set({ notifications: notifications.filter(n => n.id !== id) });
      },

      clearNotifications: (roomId?: string) => {
        const { notifications } = get();
        if (roomId) {
          set({ notifications: notifications.filter(n => n.roomId !== roomId) });
        } else {
          set({ notifications: [] });
        }
      },

      // Settings
      setSyncMatrixPresence: (sync: boolean) => {
        set({ syncMatrixPresence: sync });
      },

      // Getters
      getCallForRoom: (roomId: string) => {
        const { activeCalls } = get();
        return activeCalls.get(roomId) || null;
      },

      hasActiveCall: (roomId?: string) => {
        const { activeCalls } = get();
        if (roomId) {
          return activeCalls.has(roomId);
        }
        return activeCalls.size > 0;
      },

      getActiveCalls: () => {
        const { activeCalls } = get();
        return Array.from(activeCalls.values());
      },

      getIncomingCalls: () => {
        const { incomingCalls } = get();
        return Array.from(incomingCalls.values());
      },

      getNotifications: () => {
        const { notifications } = get();
        return notifications;
      },
    }),
    {
      name: 'haos-call-state',
      partialize: (state) => ({
        syncMatrixPresence: state.syncMatrixPresence,
      }),
    }
  )
);

// Selectors for common queries
export const selectActiveCallsCount = (state: CallState) => state.activeCalls.size;
export const selectHasIncomingCalls = (state: CallState) => state.incomingCalls.size > 0;
export const selectUnreadNotificationsCount = (state: CallState) => state.notifications.length;
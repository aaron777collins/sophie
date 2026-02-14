import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VoiceParticipant } from './voice-store';

export interface ActiveCall {
  callId: string;
  roomId: string;
  type: 'voice' | 'video';
  startTime: Date;
  status: 'calling' | 'connecting' | 'active' | 'ended';
  initiatorUserId?: string;
}

export interface CallParticipant extends VoiceParticipant {
  userId: string;
  displayName: string;
  avatar?: string;
  powerLevel?: number;
  joinedAt: Date;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
  mediaState: {
    audio: boolean;
    video: boolean;
    screenshare: boolean;
  };
}

interface RoomState {
  // Active calls per room
  activeCalls: Map<string, ActiveCall>;
  
  // Call participants per room
  callParticipants: Map<string, CallParticipant[]>;
  
  // Room-specific UI state
  roomUIState: Map<string, {
    isCallUIExpanded: boolean;
    lastCallNotification?: Date;
    mutedCallNotifications: boolean;
  }>;

  // Actions - Call State
  setActiveCall: (roomId: string, call: ActiveCall | null) => void;
  updateCallStatus: (roomId: string, status: ActiveCall['status']) => void;
  isCallActive: (roomId: string) => boolean;
  getActiveCall: (roomId: string) => ActiveCall | null;
  hasAnyActiveCall: () => boolean;

  // Actions - Call Participants
  setCallParticipants: (roomId: string, participants: CallParticipant[]) => void;
  addCallParticipant: (roomId: string, participant: CallParticipant) => void;
  removeCallParticipant: (roomId: string, userId: string) => void;
  updateCallParticipant: (roomId: string, userId: string, updates: Partial<CallParticipant>) => void;
  getCallParticipants: (roomId: string) => CallParticipant[];
  getCallParticipantCount: (roomId: string) => number;

  // Actions - UI State
  setCallUIExpanded: (roomId: string, expanded: boolean) => void;
  isCallUIExpanded: (roomId: string) => boolean;
  setMutedCallNotifications: (roomId: string, muted: boolean) => void;
  isMutedCallNotifications: (roomId: string) => boolean;

  // Actions - Cleanup
  clearRoomState: (roomId: string) => void;
  clearAllCalls: () => void;

  // Selectors
  getActiveCallsCount: () => number;
  getAllActiveCalls: () => Array<{ roomId: string; call: ActiveCall }>;
  getRoomCallData: (roomId: string) => {
    activeCall: ActiveCall | null;
    participants: CallParticipant[];
    participantCount: number;
    isActive: boolean;
    isUIExpanded: boolean;
  };
}

const initialState = {
  activeCalls: new Map<string, ActiveCall>(),
  callParticipants: new Map<string, CallParticipant[]>(),
  roomUIState: new Map<string, {
    isCallUIExpanded: boolean;
    lastCallNotification?: Date;
    mutedCallNotifications: boolean;
  }>(),
};

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Call State Management
      setActiveCall: (roomId: string, call: ActiveCall | null) => {
        const { activeCalls } = get();
        const newActiveCalls = new Map(activeCalls);
        
        if (call) {
          newActiveCalls.set(roomId, call);
        } else {
          newActiveCalls.delete(roomId);
          // Also clear participants when call ends
          const { callParticipants } = get();
          const newParticipants = new Map(callParticipants);
          newParticipants.delete(roomId);
          set({ callParticipants: newParticipants });
        }
        
        set({ activeCalls: newActiveCalls });
      },

      updateCallStatus: (roomId: string, status: ActiveCall['status']) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        
        if (call) {
          const updatedCall = { ...call, status };
          const newActiveCalls = new Map(activeCalls);
          newActiveCalls.set(roomId, updatedCall);
          set({ activeCalls: newActiveCalls });
        }
      },

      isCallActive: (roomId: string) => {
        const { activeCalls } = get();
        const call = activeCalls.get(roomId);
        return !!(call && call.status !== 'ended');
      },

      getActiveCall: (roomId: string) => {
        const { activeCalls } = get();
        return activeCalls.get(roomId) || null;
      },

      hasAnyActiveCall: () => {
        const { activeCalls } = get();
        return Array.from(activeCalls.values()).some(call => call.status !== 'ended');
      },

      // Participant Management
      setCallParticipants: (roomId: string, participants: CallParticipant[]) => {
        const { callParticipants } = get();
        const newParticipants = new Map(callParticipants);
        newParticipants.set(roomId, participants);
        set({ callParticipants: newParticipants });
      },

      addCallParticipant: (roomId: string, participant: CallParticipant) => {
        const { callParticipants } = get();
        const currentParticipants = callParticipants.get(roomId) || [];
        
        // Remove existing participant with same userId if present
        const filteredParticipants = currentParticipants.filter(p => p.userId !== participant.userId);
        const newParticipants = [...filteredParticipants, participant];
        
        const updatedMap = new Map(callParticipants);
        updatedMap.set(roomId, newParticipants);
        set({ callParticipants: updatedMap });
      },

      removeCallParticipant: (roomId: string, userId: string) => {
        const { callParticipants } = get();
        const currentParticipants = callParticipants.get(roomId) || [];
        const filteredParticipants = currentParticipants.filter(p => p.userId !== userId);
        
        const updatedMap = new Map(callParticipants);
        if (filteredParticipants.length > 0) {
          updatedMap.set(roomId, filteredParticipants);
        } else {
          updatedMap.delete(roomId);
        }
        set({ callParticipants: updatedMap });
      },

      updateCallParticipant: (roomId: string, userId: string, updates: Partial<CallParticipant>) => {
        const { callParticipants } = get();
        const currentParticipants = callParticipants.get(roomId) || [];
        
        const updatedParticipants = currentParticipants.map(participant =>
          participant.userId === userId
            ? { ...participant, ...updates }
            : participant
        );
        
        const updatedMap = new Map(callParticipants);
        updatedMap.set(roomId, updatedParticipants);
        set({ callParticipants: updatedMap });
      },

      getCallParticipants: (roomId: string) => {
        const { callParticipants } = get();
        return callParticipants.get(roomId) || [];
      },

      getCallParticipantCount: (roomId: string) => {
        const { callParticipants } = get();
        const participants = callParticipants.get(roomId) || [];
        return participants.length;
      },

      // UI State Management
      setCallUIExpanded: (roomId: string, expanded: boolean) => {
        const { roomUIState } = get();
        const currentState = roomUIState.get(roomId) || {
          isCallUIExpanded: false,
          mutedCallNotifications: false,
        };
        
        const newUIState = new Map(roomUIState);
        newUIState.set(roomId, {
          ...currentState,
          isCallUIExpanded: expanded,
        });
        set({ roomUIState: newUIState });
      },

      isCallUIExpanded: (roomId: string) => {
        const { roomUIState } = get();
        const state = roomUIState.get(roomId);
        return state?.isCallUIExpanded || false;
      },

      setMutedCallNotifications: (roomId: string, muted: boolean) => {
        const { roomUIState } = get();
        const currentState = roomUIState.get(roomId) || {
          isCallUIExpanded: false,
          mutedCallNotifications: false,
        };
        
        const newUIState = new Map(roomUIState);
        newUIState.set(roomId, {
          ...currentState,
          mutedCallNotifications: muted,
        });
        set({ roomUIState: newUIState });
      },

      isMutedCallNotifications: (roomId: string) => {
        const { roomUIState } = get();
        const state = roomUIState.get(roomId);
        return state?.mutedCallNotifications || false;
      },

      // Cleanup
      clearRoomState: (roomId: string) => {
        const { activeCalls, callParticipants, roomUIState } = get();
        
        const newActiveCalls = new Map(activeCalls);
        const newParticipants = new Map(callParticipants);
        const newUIState = new Map(roomUIState);
        
        newActiveCalls.delete(roomId);
        newParticipants.delete(roomId);
        newUIState.delete(roomId);
        
        set({
          activeCalls: newActiveCalls,
          callParticipants: newParticipants,
          roomUIState: newUIState,
        });
      },

      clearAllCalls: () => {
        set({
          activeCalls: new Map(),
          callParticipants: new Map(),
        });
      },

      // Selectors
      getActiveCallsCount: () => {
        const { activeCalls } = get();
        return Array.from(activeCalls.values()).filter(call => call.status !== 'ended').length;
      },

      getAllActiveCalls: () => {
        const { activeCalls } = get();
        return Array.from(activeCalls.entries())
          .filter(([, call]) => call.status !== 'ended')
          .map(([roomId, call]) => ({ roomId, call }));
      },

      getRoomCallData: (roomId: string) => {
        const {
          getActiveCall,
          getCallParticipants,
          getCallParticipantCount,
          isCallActive,
          isCallUIExpanded,
        } = get();

        return {
          activeCall: getActiveCall(roomId),
          participants: getCallParticipants(roomId),
          participantCount: getCallParticipantCount(roomId),
          isActive: isCallActive(roomId),
          isUIExpanded: isCallUIExpanded(roomId),
        };
      },
    }),
    {
      name: 'haos-room-state',
      // Only persist UI preferences, not call data (that should be ephemeral)
      partialize: (state) => ({
        roomUIState: Array.from(state.roomUIState.entries()).reduce((acc, [key, value]) => {
          acc[key] = {
            mutedCallNotifications: value.mutedCallNotifications,
            // Don't persist isCallUIExpanded - start collapsed on refresh
          };
          return acc;
        }, {} as Record<string, any>),
      }),
      onRehydrateStorage: (state) => {
        return (restoredState) => {
          if (restoredState?.roomUIState) {
            // Convert back to Map and ensure proper structure
            const roomUIMap = new Map();
            Object.entries(restoredState.roomUIState).forEach(([roomId, value]) => {
              roomUIMap.set(roomId, {
                isCallUIExpanded: false, // Always start collapsed
                mutedCallNotifications: (value as any)?.mutedCallNotifications || false,
              });
            });
            restoredState.roomUIState = roomUIMap;
          }
        };
      },
    }
  )
);

// Selectors for common queries
export const selectActiveCallsCount = (state: RoomState) => state.getActiveCallsCount();
export const selectHasAnyActiveCall = (state: RoomState) => state.hasAnyActiveCall();
export const selectRoomHasActiveCall = (roomId: string) => (state: RoomState) => 
  state.isCallActive(roomId);
export const selectRoomCallParticipants = (roomId: string) => (state: RoomState) => 
  state.getCallParticipants(roomId);
export const selectRoomCallData = (roomId: string) => (state: RoomState) => 
  state.getRoomCallData(roomId);
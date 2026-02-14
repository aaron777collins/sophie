import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoiceParticipant {
  identity: string;
  name: string;
  avatar?: string;
  isSpeaking: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isLocal: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

export interface VoiceChannel {
  id: string;
  name: string;
  serverId?: string;
  participants: VoiceParticipant[];
  maxParticipants?: number;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export interface VoiceSettings {
  inputDevice: string | null;
  outputDevice: string | null;
  inputVolume: number;
  outputVolume: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  pushToTalk: boolean;
  pushToTalkKey: string;
}

interface VoiceState {
  // Connection state
  connectionState: ConnectionState;
  currentChannel: VoiceChannel | null;
  error: string | null;

  // Local user state
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;

  // Participants
  participants: Map<string, VoiceParticipant>;

  // Settings
  settings: VoiceSettings;

  // Actions
  setConnectionState: (state: ConnectionState) => void;
  setCurrentChannel: (channel: VoiceChannel | null) => void;
  setError: (error: string | null) => void;

  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setScreenSharing: (enabled: boolean) => void;
  setDeafened: (deafened: boolean) => void;
  setSpeaking: (speaking: boolean) => void;

  addParticipant: (participant: VoiceParticipant) => void;
  removeParticipant: (identity: string) => void;
  updateParticipant: (identity: string, updates: Partial<VoiceParticipant>) => void;
  clearParticipants: () => void;

  updateSettings: (settings: Partial<VoiceSettings>) => void;
  resetState: () => void;
}

const defaultSettings: VoiceSettings = {
  inputDevice: null,
  outputDevice: null,
  inputVolume: 100,
  outputVolume: 100,
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  pushToTalk: false,
  pushToTalkKey: '`',
};

const initialState = {
  connectionState: 'disconnected' as ConnectionState,
  currentChannel: null,
  error: null,
  isAudioEnabled: true,
  isVideoEnabled: false,
  isScreenSharing: false,
  isDeafened: false,
  isSpeaking: false,
  participants: new Map<string, VoiceParticipant>(),
  settings: defaultSettings,
};

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setConnectionState: (connectionState) => set({ connectionState }),
      setCurrentChannel: (currentChannel) => set({ currentChannel }),
      setError: (error) => set({ error }),

      setAudioEnabled: (isAudioEnabled) => set({ isAudioEnabled }),
      setVideoEnabled: (isVideoEnabled) => set({ isVideoEnabled }),
      setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),
      setDeafened: (isDeafened) => set({ isDeafened }),
      setSpeaking: (isSpeaking) => set({ isSpeaking }),

      addParticipant: (participant) => {
        const { participants } = get();
        const newParticipants = new Map(participants);
        newParticipants.set(participant.identity, participant);
        set({ participants: newParticipants });
      },

      removeParticipant: (identity) => {
        const { participants } = get();
        const newParticipants = new Map(participants);
        newParticipants.delete(identity);
        set({ participants: newParticipants });
      },

      updateParticipant: (identity, updates) => {
        const { participants } = get();
        const existing = participants.get(identity);
        if (existing) {
          const newParticipants = new Map(participants);
          newParticipants.set(identity, { ...existing, ...updates });
          set({ participants: newParticipants });
        }
      },

      clearParticipants: () => set({ participants: new Map() }),

      updateSettings: (newSettings) => {
        const { settings } = get();
        set({ settings: { ...settings, ...newSettings } });
      },

      resetState: () => set({
        connectionState: 'disconnected',
        currentChannel: null,
        error: null,
        isAudioEnabled: true,
        isVideoEnabled: false,
        isScreenSharing: false,
        isDeafened: false,
        isSpeaking: false,
        participants: new Map(),
      }),
    }),
    {
      name: 'haos-voice-settings',
      partialize: (state) => ({
        settings: state.settings,
        isAudioEnabled: state.isAudioEnabled,
        isVideoEnabled: state.isVideoEnabled,
      }),
    }
  )
);

// Selectors for common queries
export const selectIsConnected = (state: VoiceState) => state.connectionState === 'connected';
export const selectParticipantCount = (state: VoiceState) => state.participants.size;
export const selectSpeakingParticipants = (state: VoiceState) => 
  Array.from(state.participants.values()).filter(p => p.isSpeaking);

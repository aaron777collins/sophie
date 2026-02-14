'use client';

import { useCallback, useMemo } from 'react';
import { useVoiceStore, VoiceParticipant } from '@/stores/voice-store';

export interface UseParticipantsReturn {
  // All participants
  participants: VoiceParticipant[];
  participantCount: number;

  // Filtered lists
  localParticipant: VoiceParticipant | null;
  remoteParticipants: VoiceParticipant[];
  speakingParticipants: VoiceParticipant[];
  videoParticipants: VoiceParticipant[];
  screenShareParticipants: VoiceParticipant[];

  // Helpers
  getParticipant: (identity: string) => VoiceParticipant | undefined;
  isParticipantSpeaking: (identity: string) => boolean;
  isParticipantMuted: (identity: string) => boolean;
}

export function useParticipants(): UseParticipantsReturn {
  const participants = useVoiceStore((state) => state.participants);

  // Convert Map to array
  const participantList = useMemo(
    () => Array.from(participants.values()),
    [participants]
  );

  // Find local participant
  const localParticipant = useMemo(
    () => participantList.find((p) => p.isLocal) || null,
    [participantList]
  );

  // Remote participants (excluding local)
  const remoteParticipants = useMemo(
    () => participantList.filter((p) => !p.isLocal),
    [participantList]
  );

  // Currently speaking participants
  const speakingParticipants = useMemo(
    () => participantList.filter((p) => p.isSpeaking),
    [participantList]
  );

  // Participants with video enabled
  const videoParticipants = useMemo(
    () => participantList.filter((p) => p.isVideoEnabled),
    [participantList]
  );

  // Participants sharing their screen
  const screenShareParticipants = useMemo(
    () => participantList.filter((p) => p.isScreenSharing),
    [participantList]
  );

  // Get a specific participant
  const getParticipant = useCallback(
    (identity: string) => participants.get(identity),
    [participants]
  );

  // Check if participant is speaking
  const isParticipantSpeaking = useCallback(
    (identity: string) => participants.get(identity)?.isSpeaking || false,
    [participants]
  );

  // Check if participant is muted
  const isParticipantMuted = useCallback(
    (identity: string) => !participants.get(identity)?.isAudioEnabled,
    [participants]
  );

  return {
    participants: participantList,
    participantCount: participantList.length,
    localParticipant,
    remoteParticipants,
    speakingParticipants,
    videoParticipants,
    screenShareParticipants,
    getParticipant,
    isParticipantSpeaking,
    isParticipantMuted,
  };
}

export default useParticipants;

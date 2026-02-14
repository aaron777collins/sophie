'use client';

import React from 'react';
import { useCallStore, RoomCall } from '@/stores/call-store';
import { useVoiceStore } from '@/stores/voice-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SpeakingIndicator } from '@/components/voice';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCallBarProps {
  roomId: string;
  className?: string;
}

export function RoomCallBar({ roomId, className }: RoomCallBarProps) {
  const {
    getCallForRoom,
    joinCall,
    leaveCall,
    endCall,
  } = useCallStore();

  const {
    isAudioEnabled,
    isVideoEnabled,
    isDeafened,
    connectionState,
  } = useVoiceStore();

  const call = getCallForRoom(roomId);

  // Don't render if no active call
  if (!call || call.status === 'ended') {
    return null;
  }

  const isConnected = connectionState === 'connected';
  const participantCount = call.participants.length;
  const speakingParticipants = call.participants.filter(p => p.isSpeaking);

  const handleJoinCall = () => {
    joinCall(roomId);
  };

  const handleLeaveCall = () => {
    if (call.isLocalUserInCall) {
      leaveCall(roomId);
    }
  };

  const handleEndCall = () => {
    endCall(roomId);
  };

  const formatCallDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500",
      className
    )}>
      {/* Call Status Icon */}
      <div className="flex items-center gap-2">
        {call.type === 'video' ? (
          <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
        )}
        
        <div className="flex flex-col">
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {call.type === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <span>
              {call.status === 'calling' && 'Starting...'}
              {call.status === 'ringing' && 'Ringing...'}
              {call.status === 'active' && formatCallDuration(call.startTime)}
            </span>
            {call.status === 'active' && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-300">
                Live
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-700 dark:text-green-300">
          {participantCount}
        </span>
      </div>

      {/* Speaking Participants */}
      {speakingParticipants.length > 0 && (
        <div className="flex -space-x-2">
          {speakingParticipants.slice(0, 3).map((participant) => (
            <div key={participant.identity} className="relative">
              <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800">
                <AvatarImage 
                  src={participant.avatar} 
                  alt={participant.name} 
                />
                <AvatarFallback className="text-xs">
                  {participant.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <SpeakingIndicator 
                isSpeaking={participant.isSpeaking} 
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3"
              />
            </div>
          ))}
          {speakingParticipants.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-xs text-green-600 dark:text-green-400">
                +{speakingParticipants.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Local User Status */}
      {call.isLocalUserInCall && (
        <div className="flex items-center gap-1">
          {/* Audio status */}
          <div className={cn(
            "p-1 rounded-full",
            isAudioEnabled 
              ? "bg-green-100 dark:bg-green-900" 
              : "bg-red-100 dark:bg-red-900"
          )}>
            {isDeafened ? (
              <VolumeX className="h-3 w-3 text-red-600 dark:text-red-400" />
            ) : isAudioEnabled ? (
              <Mic className="h-3 w-3 text-green-600 dark:text-green-400" />
            ) : (
              <MicOff className="h-3 w-3 text-red-600 dark:text-red-400" />
            )}
          </div>

          {/* Video status (for video calls) */}
          {call.type === 'video' && (
            <div className={cn(
              "p-1 rounded-full",
              isVideoEnabled 
                ? "bg-green-100 dark:bg-green-900" 
                : "bg-red-100 dark:bg-red-900"
            )}>
              {isVideoEnabled ? (
                <Video className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <VideoOff className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
            </div>
          )}

          {/* Connection status */}
          <div className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
          )} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-auto">
        {!call.isLocalUserInCall ? (
          <Button 
            size="sm" 
            onClick={handleJoinCall}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={call.status !== 'active'}
          >
            <Phone className="h-3 w-3 mr-1" />
            Join Call
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleLeaveCall}
            className="border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
          >
            <PhoneOff className="h-3 w-3 mr-1" />
            Leave
          </Button>
        )}

        {/* End call button (for call initiator or if local user is in call) */}
        {(call.initiator || call.isLocalUserInCall) && (
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default RoomCallBar;
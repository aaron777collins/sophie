'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useCallStore } from '@/stores/call-store';
import { useVoiceStore, VoiceParticipant } from '@/stores/voice-store';
import { useMatrixClient } from '@/hooks/use-matrix-client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  VoiceControls,
  SpeakingIndicator,
  ParticipantTile,
} from '@/components/voice';
import { 
  Phone, 
  Video, 
  VideoOff,
  PhoneOff, 
  Settings,
  Users,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Crown,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomVoiceSidebarProps {
  roomId: string;
  roomName: string;
  className?: string;
}

interface MatrixMember {
  userId: string;
  displayName?: string;
  avatarUrl?: string | null;
  powerLevel: number;
  presence?: 'online' | 'offline' | 'unavailable';
  isInCall?: boolean;
}

export function RoomVoiceSidebar({ 
  roomId, 
  roomName,
  className,
}: RoomVoiceSidebarProps) {
  const {
    getCallForRoom,
    startCall,
    joinCall,
    leaveCall,
    endCall,
    hasActiveCall,
  } = useCallStore();

  const {
    connectionState,
    isAudioEnabled,
    isVideoEnabled,
    isDeafened,
    participants: voiceParticipants,
  } = useVoiceStore();

  const { client, isAuthenticated } = useMatrixClient();

  const [roomMembers, setRoomMembers] = useState<MatrixMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const call = getCallForRoom(roomId);
  const isInCall = call?.isLocalUserInCall || false;
  const isConnected = connectionState === 'connected';

  // Load room members
  useEffect(() => {
    const loadRoomMembers = async () => {
      if (!client || !isAuthenticated) return;

      setIsLoadingMembers(true);
      try {
        const room = client.getRoom(roomId);
        if (!room) return;

        const members = room.getJoinedMembers();
        const memberList: MatrixMember[] = members.map(member => ({
          userId: member.userId,
          displayName: member.name,
          avatarUrl: member.getAvatarUrl(client.getHomeserverUrl(), 32, 32, 'crop', false, false),
          powerLevel: room.getMember(member.userId)?.powerLevel || 0,
          presence: 'offline', // Will be updated by presence events
          isInCall: false, // Will be updated by voice participants
        }));

        setRoomMembers(memberList);
      } catch (error) {
        console.error('Failed to load room members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadRoomMembers();
  }, [client, isAuthenticated, roomId]);

  // Update member call status based on voice participants
  useEffect(() => {
    if (!call) return;

    setRoomMembers(prev => prev.map(member => ({
      ...member,
      isInCall: call.participants.some(p => p.identity === member.userId),
    })));
  }, [call?.participants]);

  const handleStartVoiceCall = useCallback(() => {
    if (!isAuthenticated) return;
    
    const callId = startCall(roomId, roomName, 'voice', {
      userId: client?.getUserId() || 'unknown',
      displayName: client?.getUser(client.getUserId() || '')?.displayName || 'Unknown',
    });
    
    // Here you would typically also send Matrix call signaling
    // For now, we'll just start the LiveKit call
  }, [isAuthenticated, startCall, roomId, roomName, client]);

  const handleStartVideoCall = useCallback(() => {
    if (!isAuthenticated) return;
    
    const callId = startCall(roomId, roomName, 'video', {
      userId: client?.getUserId() || 'unknown',
      displayName: client?.getUser(client.getUserId() || '')?.displayName || 'Unknown',
    });
    
    // Here you would typically also send Matrix call signaling
  }, [isAuthenticated, startCall, roomId, roomName, client]);

  const handleJoinCall = useCallback(() => {
    if (call) {
      joinCall(roomId);
    }
  }, [call, joinCall, roomId]);

  const handleLeaveCall = useCallback(() => {
    if (call) {
      leaveCall(roomId);
    }
  }, [call, leaveCall, roomId]);

  const handleEndCall = useCallback(() => {
    if (call) {
      endCall(roomId);
    }
  }, [call, endCall, roomId]);

  const canStartCall = isAuthenticated && !hasActiveCall(roomId);
  const canEndCall = call && (call.initiator?.userId === client?.getUserId() || isInCall);

  const getMemberParticipant = (member: MatrixMember): VoiceParticipant | null => {
    if (!call) return null;
    return call.participants.find(p => p.identity === member.userId) || null;
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700",
      className
    )}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Voice Channel
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Call Status */}
      {call ? (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {call.type === 'video' ? (
                <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {call.type === 'video' ? 'Video Call' : 'Voice Call'}
              </span>
              <Badge variant="outline" className="text-xs border-green-500">
                {call.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Users className="h-3 w-3" />
              <span>{call.participants.length}</span>
            </div>
          </div>

          <div className="flex gap-1">
            {!isInCall ? (
              <Button 
                size="sm" 
                onClick={handleJoinCall}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                disabled={call.status !== 'active'}
              >
                <Phone className="h-3 w-3 mr-1" />
                Join
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleLeaveCall}
                className="border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-950 flex-1"
              >
                <PhoneOff className="h-3 w-3 mr-1" />
                Leave
              </Button>
            )}
            
            {canEndCall && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        canStartCall && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1">
              <Button 
                size="sm" 
                onClick={handleStartVoiceCall}
                className="flex-1"
                variant="outline"
              >
                <Phone className="h-3 w-3 mr-1" />
                Voice
              </Button>
              <Button 
                size="sm" 
                onClick={handleStartVideoCall}
                className="flex-1"
              >
                <Video className="h-3 w-3 mr-1" />
                Video
              </Button>
            </div>
          </div>
        )
      )}

      {/* Voice Controls (when in call) */}
      {isInCall && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <VoiceControls />
        </div>
      )}

      {/* Participants in Call */}
      {call && call.participants.length > 0 && (
        <div className="flex-1 overflow-auto">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              In Call ({call.participants.length})
            </h4>
            <div className="space-y-2">
              {call.participants.map((participant) => (
                <div 
                  key={participant.identity}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
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
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {participant.name}
                      </span>
                      {participant.isLocal && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          (You)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Audio status */}
                    {participant.isAudioEnabled ? (
                      <Mic className="h-3 w-3 text-green-500" />
                    ) : (
                      <MicOff className="h-3 w-3 text-red-500" />
                    )}
                    
                    {/* Video status (for video calls) */}
                    {call.type === 'video' && (
                      participant.isVideoEnabled ? (
                        <Video className="h-3 w-3 text-green-500" />
                      ) : (
                        <VideoOff className="h-3 w-3 text-red-500" />
                      )
                    )}

                    {/* Connection quality indicator */}
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      participant.connectionQuality === 'excellent' && "bg-green-500",
                      participant.connectionQuality === 'good' && "bg-yellow-500",
                      participant.connectionQuality === 'poor' && "bg-red-500",
                      participant.connectionQuality === 'unknown' && "bg-gray-400"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />
        </div>
      )}

      {/* Room Members */}
      <div className="flex-1 overflow-auto">
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Room Members ({roomMembers.length})
          </h4>
          
          {isLoadingMembers ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading members...
            </div>
          ) : (
            <div className="space-y-1">
              {roomMembers.map((member) => {
                const participant = getMemberParticipant(member);
                
                return (
                  <div 
                    key={member.userId}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg transition-colors",
                      member.isInCall 
                        ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" 
                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={member.avatarUrl || undefined} 
                          alt={member.displayName || member.userId} 
                        />
                        <AvatarFallback className="text-xs">
                          {(member.displayName || member.userId).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Speaking indicator if in call */}
                      {participant && (
                        <SpeakingIndicator 
                          isSpeaking={participant.isSpeaking} 
                          className="absolute -bottom-0.5 -right-0.5 h-2 w-2"
                        />
                      )}
                      
                      {/* Presence indicator */}
                      <div className={cn(
                        "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-gray-800",
                        member.presence === 'online' && "bg-green-500",
                        member.presence === 'unavailable' && "bg-yellow-500",
                        member.presence === 'offline' && "bg-gray-400"
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {member.displayName || member.userId}
                        </span>
                        {member.powerLevel >= 50 && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </div>

                    {member.isInCall && participant && (
                      <div className="flex items-center gap-0.5">
                        {participant.isAudioEnabled ? (
                          <Mic className="h-3 w-3 text-green-500" />
                        ) : (
                          <MicOff className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomVoiceSidebar;
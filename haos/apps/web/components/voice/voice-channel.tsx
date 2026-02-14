'use client';

import { useState } from 'react';
import { Volume2, Users, PhoneCall, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Settings, AlertCircle } from 'lucide-react';
import { useVoiceChannel } from '@/hooks/use-voice-channel';
import { VoiceChannelPanel } from './voice-channel-panel';
import { ConnectedUsersDisplay } from './connected-users-display';
import { VoiceControls } from './voice-controls';
import { useVoiceStore } from '@/stores/voice-store';

export interface VoiceChannelProps {
  channelId: string;
  channelName: string;
  serverId?: string;
  userId: string;
  userName?: string;
  matrixAccessToken?: string;
  className?: string;
  compact?: boolean;
}

export function VoiceChannel({
  channelId,
  channelName,
  serverId,
  userId,
  userName,
  matrixAccessToken,
  className = '',
  compact = false,
}: VoiceChannelProps) {
  const [showVideoGrid, setShowVideoGrid] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Use voice channel hook for LiveKit integration
  const voiceChannel = useVoiceChannel({
    roomName: `${serverId || 'server'}_${channelId}`,
    userId,
    userName,
    matrixAccessToken,
    autoConnect: false,
  });

  const { currentChannel } = useVoiceStore();

  const {
    isConnected,
    isConnecting,
    connectionState,
    participants,
    error,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isDeafened,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleDeafen,
  } = voiceChannel;

  const handleJoinVoice = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to join voice channel:', err);
    }
  };

  const handleLeaveVoice = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Failed to leave voice channel:', err);
    }
  };

  const connectedParticipantCount = participants.length;
  const isInThisChannel = currentChannel?.id === `${serverId || 'server'}_${channelId}`;

  if (compact) {
    return (
      <div className={`bg-[#2f3136] rounded-lg p-3 ${className}`}>
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-white truncate">{channelName}</span>
            {connectedParticipantCount > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{connectedParticipantCount}</span>
              </div>
            )}
          </div>
          
          {!isInThisChannel ? (
            <button
              onClick={handleJoinVoice}
              disabled={isConnecting}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white text-sm rounded transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{isConnecting ? 'Joining...' : 'Join'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="text-xs text-green-400 font-medium">Connected</div>
              <button
                onClick={handleLeaveVoice}
                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <PhoneOff className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Connected Users Display */}
        {isInThisChannel && connectedParticipantCount > 0 && (
          <div className="mb-3">
            <ConnectedUsersDisplay participants={participants} />
          </div>
        )}

        {/* Voice Controls */}
        {isInThisChannel && (
          <VoiceControls
            roomName={`${serverId || 'server'}_${channelId}`}
            userId={userId}
            compact
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-[#36393f] border border-[#40444b] rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#40444b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">{channelName}</h2>
              {serverId && (
                <div className="text-sm text-gray-400">{serverId}</div>
              )}
            </div>
          </div>

          {/* Join/Leave Button */}
          <div className="flex items-center space-x-2">
            {connectedParticipantCount > 0 && (
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-sm">{connectedParticipantCount} connected</span>
              </div>
            )}
            
            {!isInThisChannel ? (
              <button
                onClick={handleJoinVoice}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-medium rounded transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isConnecting ? 'Joining...' : 'Join Voice'}</span>
              </button>
            ) : (
              <button
                onClick={handleLeaveVoice}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave</span>
              </button>
            )}
          </div>
        </div>

        {/* Connection Status */}
        {isInThisChannel && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionState === 'connected' ? 'bg-green-400' :
                connectionState === 'connecting' || connectionState === 'reconnecting' ? 'bg-yellow-400 animate-pulse' :
                connectionState === 'error' ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-300">
                {connectionState === 'connected' ? 'Connected' :
                 connectionState === 'connecting' ? 'Connecting...' :
                 connectionState === 'reconnecting' ? 'Reconnecting...' :
                 connectionState === 'error' ? 'Connection Error' :
                 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVideoGrid(!showVideoGrid)}
                className={`p-2 rounded transition-colors ${
                  showVideoGrid ? 'bg-blue-600 text-white' : 'bg-[#40444b] text-gray-400 hover:text-white hover:bg-[#4a4d52]'
                }`}
                title="Toggle video grid"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded transition-colors ${
                  showSettings ? 'bg-blue-600 text-white' : 'bg-[#40444b] text-gray-400 hover:text-white hover:bg-[#4a4d52]'
                }`}
                title="Voice settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isInThisChannel ? (
          <>
            {/* Voice Channel Panel */}
            <div className="mb-4">
              <VoiceChannelPanel 
                showVideoGrid={showVideoGrid}
                className="border-0 bg-transparent"
              />
            </div>

            {/* Voice Controls */}
            <div className="border-t border-[#40444b] pt-4">
              <VoiceControls
                roomName={`${serverId || 'server'}_${channelId}`}
                userId={userId}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Volume2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              {channelName}
            </h3>
            <p className="text-gray-400 mb-6">
              {connectedParticipantCount > 0 
                ? `${connectedParticipantCount} ${connectedParticipantCount === 1 ? 'person is' : 'people are'} in this voice channel`
                : 'No one is in this voice channel yet'
              }
            </p>
            <button
              onClick={handleJoinVoice}
              disabled={isConnecting}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors mx-auto"
            >
              <PhoneCall className="w-5 h-5" />
              <span>{isConnecting ? 'Joining Voice Channel...' : 'Join Voice Channel'}</span>
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-300">Connection Error</div>
                <div className="text-sm text-red-400 mt-1">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceChannel;
'use client';

import { Volume2, Users, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { ParticipantTile } from './participant-tile';
import { useVoiceStore, ConnectionState } from '@/stores/voice-store';

interface VoiceChannelPanelProps {
  className?: string;
  showVideoGrid?: boolean;
}

export function VoiceChannelPanel({ className = '', showVideoGrid = false }: VoiceChannelPanelProps) {
  const { 
    currentChannel, 
    connectionState, 
    participants, 
    error 
  } = useVoiceStore();

  const participantList = Array.from(participants.values());

  const getConnectionIcon = (state: ConnectionState) => {
    switch (state) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'connecting':
      case 'reconnecting':
        return <Wifi className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionText = (state: ConnectionState) => {
    switch (state) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const getConnectionColor = (state: ConnectionState) => {
    switch (state) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!currentChannel) {
    return (
      <div className={`bg-[#36393f] border border-[#40444b] text-gray-300 rounded-lg ${className}`}>
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <Volume2 className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Voice Channel</h3>
          <p className="text-sm text-gray-500 text-center">
            Join a voice channel to see participants and controls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#36393f] border border-[#40444b] text-gray-300 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#40444b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">{currentChannel.name}</h2>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            {getConnectionIcon(connectionState)}
            <span className={`text-sm font-medium ${getConnectionColor(connectionState)}`}>
              {getConnectionText(connectionState)}
            </span>
          </div>
        </div>
        
        {/* Channel info */}
        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{participantList.length} participant{participantList.length !== 1 ? 's' : ''}</span>
          </div>
          
          {currentChannel.maxParticipants && (
            <span>• Max {currentChannel.maxParticipants}</span>
          )}
          
          {currentChannel.serverId && (
            <span className="border border-gray-600 text-gray-400 px-2 py-1 rounded text-xs">
              {currentChannel.serverId}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Participants */}
        {participantList.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Participants</span>
              <div className="flex-1 h-px bg-[#40444b]" />
            </div>
            
            {showVideoGrid ? (
              // Video grid layout
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {participantList.map((participant) => (
                  <ParticipantTile
                    key={participant.identity}
                    participant={participant}
                    size="lg"
                    showVideo={true}
                  />
                ))}
              </div>
            ) : (
              // List layout
              <div className="space-y-2">
                {participantList.map((participant) => (
                  <ParticipantTile
                    key={participant.identity}
                    participant={participant}
                    size="md"
                    className="p-2 rounded hover:bg-[#2f3136] transition-colors"
                  />
                ))}
              </div>
            )}
          </div>
        ) : connectionState === 'connected' ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">You're alone here</h4>
            <p className="text-sm text-gray-500">
              Invite others to join the voice channel
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default VoiceChannelPanel;
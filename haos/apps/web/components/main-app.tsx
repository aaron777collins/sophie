'use client';

import { useState, useCallback } from 'react';
import { Hash, Volume2, Settings, Plus, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { ServerDiscoveryModal } from './server-discovery/server-discovery-modal';
import { VoiceChannelList, VoiceChannelItem } from './voice/voice-channel-list';
import { VoiceChannelPanel } from './voice/voice-channel-panel';
import { VoiceControls } from './voice/voice-controls';
import { ConnectedUsersDisplay } from './voice/connected-users-display';
import { useVoiceStore } from '@/stores/voice-store';

// Mock data for demonstration
const mockVoiceChannels: VoiceChannelItem[] = [
  {
    id: 'vc-1',
    name: 'General',
    participants: [],
  },
  {
    id: 'vc-2',
    name: 'Gaming',
    participants: [
      {
        identity: 'user-1',
        name: 'Alice',
        isSpeaking: true,
        isAudioEnabled: true,
        isVideoEnabled: false,
        isScreenSharing: false,
        isLocal: false,
        connectionQuality: 'excellent',
      },
      {
        identity: 'user-2',
        name: 'Bob',
        isSpeaking: false,
        isAudioEnabled: true,
        isVideoEnabled: false,
        isScreenSharing: false,
        isLocal: false,
        connectionQuality: 'good',
      },
    ],
  },
  {
    id: 'vc-3',
    name: 'Music',
    isLocked: true,
    maxParticipants: 10,
    participants: [],
  },
];

const mockTextChannels = [
  { id: 'tc-1', name: 'general', unread: 5 },
  { id: 'tc-2', name: 'announcements', unread: 0 },
  { id: 'tc-3', name: 'random', unread: 12 },
];

export function MainApp() {
  const [showServerDiscovery, setShowServerDiscovery] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [voiceChannelsExpanded, setVoiceChannelsExpanded] = useState(true);
  const [textChannelsExpanded, setTextChannelsExpanded] = useState(true);
  
  const { 
    currentChannel, 
    participants,
    connectionState,
  } = useVoiceStore();

  const participantList = Array.from(participants.values());
  const isConnected = connectionState === 'connected';

  const handleJoinVoiceChannel = useCallback((channelId: string) => {
    console.log('Joining voice channel:', channelId);
    // This would trigger the actual voice connection
    setShowVoicePanel(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    console.log('Opening voice settings');
    // This would open a settings modal
  }, []);

  return (
    <div className="min-h-screen bg-discord-dark flex">
      {/* Server List Sidebar (narrow) */}
      <nav 
        className="w-[72px] bg-discord-darker flex flex-col items-center py-3 gap-2 flex-shrink-0"
        aria-label="Servers"
      >
        {/* Home button */}
        <button
          className="w-12 h-12 rounded-2xl bg-discord-accent hover:bg-[#5865f2]/90 transition-all hover:rounded-xl flex items-center justify-center text-white"
          aria-label="Home"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
        </button>

        <div className="w-8 h-0.5 bg-discord-light rounded-full my-1" aria-hidden="true" />

        {/* Sample server icons */}
        <button
          className="w-12 h-12 rounded-2xl bg-discord-light hover:bg-discord-accent transition-all hover:rounded-xl flex items-center justify-center text-white font-semibold"
          aria-label="HAOS Server"
        >
          H
        </button>

        {/* Add server button */}
        <button
          onClick={() => setShowServerDiscovery(true)}
          className="w-12 h-12 rounded-2xl bg-discord-light hover:bg-green-600 transition-all hover:rounded-xl flex items-center justify-center text-green-500 hover:text-white"
          aria-label="Add a Server"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setShowServerDiscovery(true)}
          className="w-12 h-12 rounded-2xl bg-discord-light hover:bg-green-600 transition-all hover:rounded-xl flex items-center justify-center text-green-500 hover:text-white"
          aria-label="Explore Servers"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zm-.5-14.5v5l4.28 2.54.72-1.21-3.5-2.08V6.5z"/>
          </svg>
        </button>
      </nav>

      {/* Channel Sidebar */}
      <aside 
        className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0"
        aria-label="Channel list"
      >
        {/* Server header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-black/20 shadow-sm">
          <h2 className="font-semibold text-white truncate">HAOS Development</h2>
          <button 
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
            aria-label="Server settings"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Text Channels */}
          <div>
            <button
              onClick={() => setTextChannelsExpanded(!textChannelsExpanded)}
              className="flex items-center w-full px-1 py-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide"
              aria-expanded={textChannelsExpanded}
            >
              {textChannelsExpanded ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              Text Channels
            </button>
            
            {textChannelsExpanded && (
              <div className="mt-1 space-y-0.5">
                {mockTextChannels.map((channel) => (
                  <button
                    key={channel.id}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-[#36393f] transition-colors"
                  >
                    <Hash className="w-5 h-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                    <span className="flex-1 truncate text-sm text-left">{channel.name}</span>
                    {channel.unread > 0 && (
                      <span 
                        className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                        aria-label={`${channel.unread} unread messages`}
                      >
                        {channel.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Channels */}
          <div>
            <button
              onClick={() => setVoiceChannelsExpanded(!voiceChannelsExpanded)}
              className="flex items-center w-full px-1 py-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide"
              aria-expanded={voiceChannelsExpanded}
            >
              {voiceChannelsExpanded ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              Voice Channels
            </button>
            
            {voiceChannelsExpanded && (
              <div className="mt-1">
                <VoiceChannelList
                  channels={mockVoiceChannels}
                  currentChannelId={currentChannel?.id}
                  onJoinChannel={handleJoinVoiceChannel}
                />
              </div>
            )}
          </div>
        </div>

        {/* User panel at bottom (voice connected state) */}
        {isConnected && currentChannel && (
          <div className="p-2 bg-[#232428] border-t border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Volume2 className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-green-400 truncate">
                    Voice Connected
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {currentChannel.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowVoicePanel(true)}
                className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                aria-label="Open voice channel panel"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* User area */}
        <div className="p-2 bg-[#232428] flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-sm font-semibold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Username</div>
            <div className="text-xs text-gray-400 truncate">Online</div>
          </div>
          <button 
            onClick={handleSettingsClick}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            aria-label="User settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col bg-discord-light min-w-0">
        {/* Channel header */}
        <header className="h-12 px-4 flex items-center justify-between border-b border-black/20 shadow-sm bg-[#313338]">
          <div className="flex items-center gap-2">
            <Hash className="w-6 h-6 text-gray-400" aria-hidden="true" />
            <h1 className="font-semibold text-white">general</h1>
          </div>
          
          {/* Connected users display in header */}
          {isConnected && participantList.length > 0 && (
            <ConnectedUsersDisplay
              participants={participantList}
              maxVisible={4}
              onUserClick={(p) => console.log('Clicked user:', p.name)}
            />
          )}
        </header>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Chat area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-4">
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to HAOS v2</h2>
              <p className="text-gray-400 mb-6">
                A Discord-style Matrix client with voice chat powered by LiveKit
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowServerDiscovery(true)}
                  className="discord-button px-6 py-2.5 bg-discord-accent hover:bg-[#4752c4] text-white font-medium rounded transition-colors"
                >
                  Discover Servers
                </button>
                <button
                  onClick={() => handleJoinVoiceChannel('vc-2')}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Join Voice
                </button>
              </div>
            </div>
          </div>

          {/* Voice panel (shown when connected and panel open) */}
          {showVoicePanel && (
            <aside className="w-80 border-l border-black/20 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Voice Channel</h3>
                  <button
                    onClick={() => setShowVoicePanel(false)}
                    className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"
                    aria-label="Close voice panel"
                  >
                    ×
                  </button>
                </div>
                <VoiceChannelPanel showVideoGrid={false} />
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Voice controls (fixed at bottom when connected) */}
      {isConnected && (
        <VoiceControls
          roomName={currentChannel?.id}
          userId="current-user"
          onSettingsClick={handleSettingsClick}
        />
      )}

      {/* Modals */}
      <ServerDiscoveryModal
        open={showServerDiscovery}
        onOpenChange={setShowServerDiscovery}
      />
    </div>
  );
}

export default MainApp;

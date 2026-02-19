'use client';

import React, { useState } from 'react';
import { ChatHeader } from '@/components/chat-header';

export default function ChatHeaderDemo() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEncryption, setShowEncryption] = useState(true);
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [encryptionState, setEncryptionState] = useState<'verified' | 'unverified' | 'unencrypted'>('verified');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Chat Header Component Demo</h1>
        
        {/* Controls */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Channel Type</label>
              <select 
                className="w-full p-2 bg-gray-700 rounded"
                value={channelType}
                onChange={(e) => setChannelType(e.target.value as 'text' | 'voice')}
              >
                <option value="text">Text Channel</option>
                <option value="voice">Voice Channel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notifications</label>
              <button
                className={`w-full p-2 rounded ${notificationsEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Show Encryption</label>
              <button
                className={`w-full p-2 rounded ${showEncryption ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => setShowEncryption(!showEncryption)}
              >
                {showEncryption ? 'Visible' : 'Hidden'}
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Encryption State</label>
              <select 
                className="w-full p-2 bg-gray-700 rounded"
                value={encryptionState}
                onChange={(e) => setEncryptionState(e.target.value as any)}
              >
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="unencrypted">Unencrypted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Demo Scenarios */}
        <div className="space-y-8">
          {/* Basic Text Channel */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold p-4 bg-gray-700">Basic Text Channel</h3>
            <ChatHeader
              channelName="general"
              roomId="!general:matrix.org"
              description="General discussion for the team"
              isVoiceChannel={channelType === 'voice'}
              onlineMembers={12}
              totalMembers={45}
              notificationsEnabled={notificationsEnabled}
              showEncryption={showEncryption}
              onOpenSettings={() => alert('Opening settings...')}
              onOpenMembers={() => alert('Opening members list...')}
              onOpenSearch={() => alert('Opening search...')}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <div className="p-4 text-sm text-gray-400">
              This shows a basic text channel with member count and description.
            </div>
          </div>

          {/* Long Channel Name */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold p-4 bg-gray-700">Long Channel Name (Truncation Test)</h3>
            <ChatHeader
              channelName="very-long-channel-name-that-should-be-truncated-properly"
              roomId="!long:matrix.org"
              description="This is a very long description that should also be truncated properly when the space is limited"
              isVoiceChannel={channelType === 'voice'}
              notificationsEnabled={notificationsEnabled}
              showEncryption={showEncryption}
              onOpenSettings={() => alert('Opening settings...')}
              onOpenMembers={() => alert('Opening members list...')}
              onOpenSearch={() => alert('Opening search...')}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <div className="p-4 text-sm text-gray-400">
              This tests text truncation for long names and descriptions.
            </div>
          </div>

          {/* Minimal Configuration */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold p-4 bg-gray-700">Minimal Configuration</h3>
            <ChatHeader
              channelName="random"
              roomId="!random:matrix.org"
              isVoiceChannel={channelType === 'voice'}
              notificationsEnabled={notificationsEnabled}
              showEncryption={showEncryption}
              onOpenSettings={() => alert('Opening settings...')}
              onOpenMembers={() => alert('Opening members list...')}
              onOpenSearch={() => alert('Opening search...')}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <div className="p-4 text-sm text-gray-400">
              This shows minimal configuration without description or member counts.
            </div>
          </div>

          {/* Voice Channel */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <h3 className="text-lg font-semibold p-4 bg-gray-700">Voice Channel</h3>
            <ChatHeader
              channelName="Voice Lounge"
              roomId="!voice:matrix.org"
              description="Voice chat for casual conversations"
              isVoiceChannel={true}
              onlineMembers={3}
              totalMembers={20}
              notificationsEnabled={notificationsEnabled}
              showEncryption={showEncryption}
              onOpenSettings={() => alert('Opening settings...')}
              onOpenMembers={() => alert('Opening members list...')}
              onOpenSearch={() => alert('Opening search...')}
              onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <div className="p-4 text-sm text-gray-400">
              This shows a voice channel with the voice indicator.
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Use the controls above to test different states</p>
            <p>• Click buttons in the header to see interaction alerts</p>
            <p>• The encryption status shows different states based on the control above</p>
            <p>• Try toggling between text and voice channel types</p>
            <p>• The pinned messages button only appears when there are pinned messages in the room</p>
            <p>• All components are responsive and follow Discord's design patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
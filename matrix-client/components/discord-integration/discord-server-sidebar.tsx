'use client';

import React, { useState, useEffect } from 'react';
import { useMatrixServers, useMatrixChannels } from '@/lib/matrix/matrix-backend-hooks';
import { useVoiceChannels, useDirectMessages, useServerTemplates } from '@/hooks/matrix/use-discord-features';
import { ServerData, ChannelData } from '@/lib/matrix/matrix-backend-hooks';

interface DiscordServerSidebarProps {
  currentUserId: string;
  selectedServerId?: string;
  selectedChannelId?: string;
  onServerSelect: (serverId: string) => void;
  onChannelSelect: (channelId: string) => void;
  onDirectMessageSelect: (dmId: string) => void;
}

export function DiscordServerSidebar({
  currentUserId,
  selectedServerId,
  selectedChannelId,
  onServerSelect,
  onChannelSelect,
  onDirectMessageSelect
}: DiscordServerSidebarProps) {
  // Matrix backend hooks
  const { servers, loading: serversLoading, joinServer, leaveServer, createServer } = useMatrixServers();
  const { channels, categories, createChannel, deleteChannel } = useMatrixChannels(selectedServerId || '');
  
  // Discord features hooks
  const { voiceChannels, connectedChannel, joinVoiceChannel, leaveVoiceChannel } = useVoiceChannels(selectedServerId || '');
  const { directMessages, createDirectMessage } = useDirectMessages();
  const { createServerFromTemplate, getAvailableTemplates } = useServerTemplates();

  // Component state
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const currentServer = servers.find(s => s.id === selectedServerId);

  // Toggle category collapse
  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  return (
    <div className="flex h-full bg-gray-900">
      {/* Server List */}
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-2 space-y-2">
        {/* Direct Messages */}
        <button
          onClick={() => onServerSelect('dm')}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
            selectedServerId === 'dm' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title="Direct Messages"
        >
          💬
        </button>

        {/* Server Icons */}
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isSelected={selectedServerId === server.id}
            onClick={() => onServerSelect(server.id)}
          />
        ))}

        {/* Add Server Button */}
        <button
          onClick={() => setShowCreateServer(true)}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-green-400 text-xl transition-all"
          title="Add Server"
        >
          +
        </button>
      </div>

      {/* Channel/DM List */}
      <div className="w-60 bg-gray-800 flex flex-col">
        {selectedServerId === 'dm' ? (
          <DirectMessagesList
            directMessages={directMessages}
            onSelect={onDirectMessageSelect}
            onCreateNew={createDirectMessage}
            selectedDmId={selectedChannelId}
          />
        ) : currentServer ? (
          <ServerChannelsList
            server={currentServer}
            channels={channels}
            categories={categories}
            voiceChannels={voiceChannels}
            connectedVoiceChannel={connectedChannel}
            selectedChannelId={selectedChannelId}
            collapsedCategories={collapsedCategories}
            onChannelSelect={onChannelSelect}
            onCategoryToggle={toggleCategory}
            onCreateChannel={() => setShowCreateChannel(true)}
            onJoinVoice={joinVoiceChannel}
            onLeaveVoice={leaveVoiceChannel}
            onDeleteChannel={deleteChannel}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a server to view channels
          </div>
        )}
      </div>

      {/* Create Server Modal */}
      {showCreateServer && (
        <CreateServerModal
          onClose={() => setShowCreateServer(false)}
          onCreate={createServer}
          onCreateFromTemplate={createServerFromTemplate}
          templates={getAvailableTemplates()}
          onShowTemplates={() => setShowTemplates(true)}
        />
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && selectedServerId && (
        <CreateChannelModal
          serverId={selectedServerId}
          onClose={() => setShowCreateChannel(false)}
          onCreate={createChannel}
        />
      )}
    </div>
  );
}

// Server icon component
interface ServerIconProps {
  server: ServerData;
  isSelected: boolean;
  onClick: () => void;
}

function ServerIcon({ server, isSelected, onClick }: ServerIconProps) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden transition-all ${
          isSelected ? 'rounded-lg' : 'hover:rounded-lg'
        }`}
        title={server.name}
      >
        {server.avatar ? (
          <img src={server.avatar} alt={server.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white font-bold">
            {server.name.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Notification badges */}
      {server.mentionCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {server.mentionCount > 9 ? '9+' : server.mentionCount}
        </div>
      )}
      {server.unreadCount > 0 && server.mentionCount === 0 && (
        <div className="absolute -top-1 -right-1 bg-gray-400 rounded-full w-3 h-3" />
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r" />
      )}
    </div>
  );
}

// Direct messages list component
interface DirectMessagesListProps {
  directMessages: any[];
  onSelect: (dmId: string) => void;
  onCreateNew: (userId: string) => void;
  selectedDmId?: string;
}

function DirectMessagesList({ directMessages, onSelect, onCreateNew, selectedDmId }: DirectMessagesListProps) {
  const [showAddDM, setShowAddDM] = useState(false);
  const [newDMUser, setNewDMUser] = useState('');

  const handleCreateDM = async () => {
    if (!newDMUser.trim()) return;
    
    try {
      await onCreateNew(newDMUser);
      setNewDMUser('');
      setShowAddDM(false);
    } catch (error) {
      console.error('Failed to create DM:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Direct Messages</h2>
          <button
            onClick={() => setShowAddDM(true)}
            className="text-gray-400 hover:text-white"
            title="Create DM"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {directMessages.map((dm) => (
          <button
            key={dm.id}
            onClick={() => onSelect(dm.id)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-gray-700 transition-colors ${
              selectedDmId === dm.id ? 'bg-gray-700' : ''
            }`}
          >
            <div className="relative">
              <img
                src={dm.avatar || '/default-avatar.png'}
                alt={dm.displayName}
                className="w-8 h-8 rounded-full"
              />
              {dm.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
              )}
            </div>
            
            <div className="flex-1 text-left">
              <div className="text-white text-sm font-medium">{dm.displayName}</div>
              {dm.lastMessage && (
                <div className="text-gray-400 text-xs truncate">
                  {dm.lastMessage.content}
                </div>
              )}
            </div>

            {dm.unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {dm.unreadCount}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Add DM Modal */}
      {showAddDM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-white text-lg font-semibold mb-4">Start Direct Message</h3>
            <input
              type="text"
              value={newDMUser}
              onChange={(e) => setNewDMUser(e.target.value)}
              placeholder="Enter user ID (e.g., @user:server.com)"
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateDM}
                disabled={!newDMUser.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded"
              >
                Create DM
              </button>
              <button
                onClick={() => {
                  setShowAddDM(false);
                  setNewDMUser('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Server channels list component
interface ServerChannelsListProps {
  server: ServerData;
  channels: ChannelData[];
  categories: any[];
  voiceChannels: any[];
  connectedVoiceChannel: string | null;
  selectedChannelId?: string;
  collapsedCategories: Set<string>;
  onChannelSelect: (channelId: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onCreateChannel: () => void;
  onJoinVoice: (channelId: string) => void;
  onLeaveVoice: () => void;
  onDeleteChannel: (channelId: string) => void;
}

function ServerChannelsList({
  server,
  channels,
  categories,
  voiceChannels,
  connectedVoiceChannel,
  selectedChannelId,
  collapsedCategories,
  onChannelSelect,
  onCategoryToggle,
  onCreateChannel,
  onJoinVoice,
  onLeaveVoice,
  onDeleteChannel
}: ServerChannelsListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold truncate">{server.name}</h2>
          <button
            onClick={onCreateChannel}
            className="text-gray-400 hover:text-white"
            title="Create Channel"
          >
            +
          </button>
        </div>
        <div className="text-sm text-gray-400">{server.memberCount} members</div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <button
              onClick={() => onCategoryToggle(category.id)}
              className="w-full flex items-center justify-between p-1 text-gray-400 hover:text-white text-xs font-semibold uppercase"
            >
              <span>{category.name}</span>
              <span className={`transform transition-transform ${collapsedCategories.has(category.id) ? '' : 'rotate-90'}`}>
                ▶
              </span>
            </button>

            {!collapsedCategories.has(category.id) && (
              <div className="ml-2 space-y-1">
                {channels
                  .filter(channel => category.channels.includes(channel.id))
                  .map((channel) => (
                    <ChannelItem
                      key={channel.id}
                      channel={channel}
                      isSelected={selectedChannelId === channel.id}
                      onClick={() => onChannelSelect(channel.id)}
                      onDelete={() => onDeleteChannel(channel.id)}
                    />
                  ))}

                {voiceChannels
                  .filter(channel => category.channels.includes(channel.id))
                  .map((channel) => (
                    <VoiceChannelItem
                      key={channel.id}
                      channel={channel}
                      isConnected={connectedVoiceChannel === channel.id}
                      onJoin={() => onJoinVoice(channel.id)}
                      onLeave={onLeaveVoice}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}

        {/* Uncategorized channels */}
        {channels.filter(channel => !categories.some(cat => cat.channels.includes(channel.id))).map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={selectedChannelId === channel.id}
            onClick={() => onChannelSelect(channel.id)}
            onDelete={() => onDeleteChannel(channel.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Individual channel item
interface ChannelItemProps {
  channel: ChannelData;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function ChannelItem({ channel, isSelected, onClick, onDelete }: ChannelItemProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group flex items-center justify-between p-2 rounded hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-gray-700' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <button onClick={onClick} className="flex-1 flex items-center gap-2 text-left">
        <span className="text-gray-400">#</span>
        <span className="text-gray-300">{channel.name}</span>
        {channel.unreadCount > 0 && (
          <div className="bg-red-500 text-white text-xs px-1 rounded">
            {channel.unreadCount}
          </div>
        )}
      </button>

      {showActions && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1"
          title="Delete Channel"
        >
          🗑️
        </button>
      )}
    </div>
  );
}

// Voice channel item
interface VoiceChannelItemProps {
  channel: any;
  isConnected: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

function VoiceChannelItem({ channel, isConnected, onJoin, onLeave }: VoiceChannelItemProps) {
  return (
    <div className={`flex items-center justify-between p-2 rounded hover:bg-gray-700 transition-colors ${
      isConnected ? 'bg-green-900/30' : ''
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-gray-400">🔊</span>
        <span className="text-gray-300">{channel.name}</span>
        {channel.connectedUsers > 0 && (
          <span className="text-xs text-gray-400">({channel.connectedUsers})</span>
        )}
      </div>

      <button
        onClick={isConnected ? onLeave : onJoin}
        className={`text-xs px-2 py-1 rounded ${
          isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isConnected ? 'Leave' : 'Join'}
      </button>
    </div>
  );
}

// Create server modal (simplified)
interface CreateServerModalProps {
  onClose: () => void;
  onCreate: (name: string, avatar?: File) => Promise<string>;
  onCreateFromTemplate: (templateKey: string, name?: string) => Promise<string>;
  templates: any[];
  onShowTemplates: () => void;
}

function CreateServerModal({ onClose, onCreate, onCreateFromTemplate, templates }: CreateServerModalProps) {
  const [serverName, setServerName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!serverName.trim()) return;

    setIsCreating(true);
    try {
      if (selectedTemplate) {
        await onCreateFromTemplate(selectedTemplate, serverName);
      } else {
        await onCreate(serverName);
      }
      onClose();
    } catch (error) {
      console.error('Failed to create server:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
        <h3 className="text-white text-lg font-semibold mb-4">Create Server</h3>
        
        <input
          type="text"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          placeholder="Server name"
          className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500 mb-4"
          autoFocus
        />

        <div className="mb-4">
          <label className="text-gray-300 text-sm mb-2 block">Template (optional)</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600"
          >
            <option value="">No template</option>
            {templates.map((template) => (
              <option key={template.key} value={template.key}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={!serverName.trim() || isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded"
          >
            {isCreating ? 'Creating...' : 'Create Server'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Create channel modal (simplified)
interface CreateChannelModalProps {
  serverId: string;
  onClose: () => void;
  onCreate: (name: string, type: 'text' | 'voice', categoryId?: string) => Promise<string>;
}

function CreateChannelModal({ serverId, onClose, onCreate }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!channelName.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(channelName, channelType);
      onClose();
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-white text-lg font-semibold mb-4">Create Channel</h3>
        
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          placeholder="Channel name"
          className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-blue-500 mb-4"
          autoFocus
        />

        <div className="mb-4">
          <label className="text-gray-300 text-sm mb-2 block">Channel Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setChannelType('text')}
              className={`flex-1 p-2 rounded ${channelType === 'text' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              # Text
            </button>
            <button
              onClick={() => setChannelType('voice')}
              className={`flex-1 p-2 rounded ${channelType === 'voice' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              🔊 Voice
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            disabled={!channelName.trim() || isCreating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded"
          >
            {isCreating ? 'Creating...' : 'Create Channel'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
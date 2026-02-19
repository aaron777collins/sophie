'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMatrixMessages, useMatrixChannels } from '@/lib/matrix/matrix-backend-hooks';
import { useFileUpload, useSlashCommands, useThreads } from '@/hooks/matrix/use-discord-features';
import { MessageData } from '@/lib/matrix/matrix-backend-hooks';

interface DiscordChatInterfaceProps {
  serverId: string;
  channelId: string;
  currentUserId: string;
}

export function DiscordChatInterface({ serverId, channelId, currentUserId }: DiscordChatInterfaceProps) {
  // Matrix backend hooks
  const { messages, loading: messagesLoading, sendMessage, editMessage, deleteMessage, addReaction } = useMatrixMessages(channelId);
  const { channels } = useMatrixChannels(serverId);
  
  // Discord features hooks
  const { uploads, uploadFile } = useFileUpload();
  const { executeCommand, getAvailableCommands, isExecuting } = useSlashCommands();
  const { threads, createThread } = useThreads(channelId);
  
  // Component state
  const [messageInput, setMessageInput] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<MessageData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      // Check if it's a slash command
      if (messageInput.startsWith('/')) {
        await executeCommand(messageInput, channelId);
        setMessageInput('');
        return;
      }

      // Send regular message
      await sendMessage(messageInput, replyToMessage?.id);
      setMessageInput('');
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error (show toast, etc.)
    }
  };

  // Handle file uploads
  const handleFileUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        await uploadFile(file, channelId);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Handle message reactions
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await addReaction(messageId, emoji);
      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  // Handle thread creation
  const handleCreateThread = async (parentMessage: MessageData) => {
    const threadContent = prompt('Enter your first message in this thread:');
    if (!threadContent) return;

    try {
      await createThread(parentMessage.id, threadContent);
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  // Get current channel info
  const currentChannel = channels.find(c => c.id === channelId);

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Channel Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">#</span>
          <h2 className="text-white font-semibold">{currentChannel?.name || 'Unknown Channel'}</h2>
          {currentChannel?.unreadCount && currentChannel.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {currentChannel.unreadCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          {currentChannel?.topic && (
            <span className="text-sm">{currentChannel.topic}</span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className={`flex-1 overflow-y-auto p-4 space-y-4 ${dragOver ? 'bg-blue-900/20 border-2 border-blue-500 border-dashed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onEdit={(id, content) => editMessage(id, content)}
                onDelete={(id) => deleteMessage(id)}
                onReact={(id, emoji) => handleAddReaction(id, emoji)}
                onReply={(msg) => setReplyToMessage(msg)}
                onThread={(msg) => handleCreateThread(msg)}
                threadInfo={threads.find(t => t.parentMessageId === message.id)}
              />
            ))}
            
            {/* Upload Progress */}
            {uploads.filter(u => u.status === 'uploading').map((upload) => (
              <div key={upload.id} className="bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">{upload.file.name}</span>
                  <span className="text-gray-400 text-sm">{Math.round(upload.progress)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div ref={messageEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-gray-700 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-blue-400">Replying to {replyToMessage.sender.name}</span>
              <p className="text-gray-300 truncate">{replyToMessage.content}</p>
            </div>
            <button 
              onClick={() => setReplyToMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-gray-700">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-gray-600 rounded-lg overflow-hidden">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message #${currentChannel?.name || 'channel'}`}
              className="w-full bg-transparent text-white p-3 resize-none focus:outline-none"
              rows={1}
              disabled={isExecuting}
            />
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white"
            title="Upload file"
          >
            📎
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isExecuting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            {isExecuting ? '...' : 'Send'}
          </button>
        </div>
        
        {/* Command suggestions */}
        {messageInput.startsWith('/') && messageInput.length > 1 && (
          <div className="mt-2 bg-gray-800 rounded-lg p-2">
            <div className="text-sm text-gray-400 mb-1">Available commands:</div>
            {getAvailableCommands()
              .filter(cmd => cmd.name.startsWith(messageInput.slice(1)))
              .map(cmd => (
                <div key={cmd.name} className="text-sm text-gray-300 py-1">
                  <span className="text-blue-400">{cmd.usage}</span> - {cmd.description}
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

// Individual message component
interface MessageComponentProps {
  message: MessageData;
  currentUserId: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: (message: MessageData) => void;
  onThread: (message: MessageData) => void;
  threadInfo?: { parentMessageId: string; messageCount: number; participants: string[]; lastActivity: number };
}

function MessageComponent({ 
  message, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onReact, 
  onReply, 
  onThread,
  threadInfo 
}: MessageComponentProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const isOwnMessage = message.sender.id === currentUserId;
  const timeAgo = new Date(message.timestamp).toLocaleTimeString();

  return (
    <div 
      className="group hover:bg-gray-700/50 p-2 rounded"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        <img
          src={message.sender.avatar || '/default-avatar.png'}
          alt={message.sender.name}
          className="w-10 h-10 rounded-full"
        />
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-white">{message.sender.name}</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
            {message.edited && <span className="text-xs text-gray-400">(edited)</span>}
          </div>
          
          {message.replyTo && (
            <div className="text-sm text-gray-400 mb-2 border-l-2 border-gray-600 pl-2">
              Replying to a message
            </div>
          )}
          
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="flex-1 bg-gray-600 text-white p-2 rounded"
                autoFocus
              />
              <button onClick={handleEdit} className="text-green-400">✓</button>
              <button onClick={() => setIsEditing(false)} className="text-red-400">×</button>
            </div>
          ) : (
            <div className="text-gray-100">{message.content}</div>
          )}
          
          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="bg-gray-700 p-2 rounded flex items-center gap-2">
                  <span className="text-blue-400">📎</span>
                  <span className="text-white">{attachment.name}</span>
                  <span className="text-gray-400 text-sm">({(attachment.size / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <button
                  key={idx}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    reaction.hasReacted ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}
          
          {/* Thread info */}
          {threadInfo && threadInfo.messageCount > 0 && (
            <div className="mt-2 text-sm text-blue-400 cursor-pointer hover:underline">
              🧵 {threadInfo.messageCount} replies • {threadInfo.participants.length} participants
            </div>
          )}
        </div>
        
        {/* Message actions */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onReact(message.id, '👍')}
              className="p-1 hover:bg-gray-600 rounded text-sm"
              title="Add reaction"
            >
              👍
            </button>
            <button
              onClick={() => onReply(message)}
              className="p-1 hover:bg-gray-600 rounded text-sm"
              title="Reply"
            >
              💬
            </button>
            <button
              onClick={() => onThread(message)}
              className="p-1 hover:bg-gray-600 rounded text-sm"
              title="Start thread"
            >
              🧵
            </button>
            {isOwnMessage && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-600 rounded text-sm"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 hover:bg-gray-600 rounded text-sm text-red-400"
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
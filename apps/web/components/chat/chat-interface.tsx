'use client';

import React, { useState, useEffect } from 'react';
import { ChatInput } from './chat-input';
import { ChatItem, shouldGroupMessages } from './chat-item';
import { MediaMessage } from './media-message';
import { MediaViewer } from './media-viewer';
import { MediaUploadResult, getMessageType } from '@/lib/matrix/media';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  roomId: string;
  type: 'text' | 'media';
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  avatarUrl?: string;
  senderDisplayName?: string;
  editedAt?: Date;
  pinned?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
    senderDisplayName?: string;
  };
  mediaAttachment?: {
    contentUri: string;
    filename: string;
    mimetype: string;
    size: number;
  };
}

interface ChatInterfaceProps {
  roomId: string;
  messages?: Message[];
  matrixClient?: any; // MatrixClient instance
  onSendMessage?: (content: string, attachments?: MediaUploadResult[]) => void;
  className?: string;
}

export function ChatInterface({
  roomId,
  messages = [],
  matrixClient,
  onSendMessage,
  className = ''
}: ChatInterfaceProps) {
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    contentUri?: string;
    filename?: string;
    mimetype?: string;
    size?: number;
  }>({
    isOpen: false
  });

  // Auto-scroll to bottom when new messages arrive
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, attachments?: MediaUploadResult[]) => {
    try {
      if (attachments && attachments.length > 0) {
        // Send each attachment as a separate message
        for (const attachment of attachments) {
          if (onSendMessage) {
            // For actual implementation, you'd send the media message to Matrix
            onSendMessage('', [attachment]);
          }
        }
      }

      // Send text message if content exists
      if (content.trim() && onSendMessage) {
        onSendMessage(content, []);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show an error toast here
    }
  };

  const handleMediaClick = (contentUri: string, mimetype: string) => {
    // Find the message to get filename and size
    const mediaMessage = messages.find(m => 
      m.mediaAttachment?.contentUri === contentUri
    );

    if (mediaMessage?.mediaAttachment) {
      setMediaViewer({
        isOpen: true,
        contentUri,
        filename: mediaMessage.mediaAttachment.filename,
        mimetype,
        size: mediaMessage.mediaAttachment.size
      });
    }
  };

  const closeMediaViewer = () => {
    setMediaViewer({ isOpen: false });
  };

  // Group messages for Discord-style display
  const groupedMessages = messages.map((message, index) => {
    const previousMessage = index > 0 ? messages[index - 1] : undefined;
    const isGrouped = shouldGroupMessages(
      { sender: message.sender, timestamp: message.timestamp.getTime() },
      previousMessage ? { sender: previousMessage.sender, timestamp: previousMessage.timestamp.getTime() } : undefined
    );
    
    // Check if this is the first message in a group (for avatar display)
    const isFirstInGroup = !isGrouped;
    
    return {
      ...message,
      isGrouped,
      showAvatar: isFirstInGroup,
      isFirstInGroup
    };
  });

  return (
    <div className={`flex flex-col h-full discord-chat-container ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto discord-messages-area">
        {messages.length === 0 ? (
          <div className="discord-empty-state">
            <div className="discord-empty-icon">💬</div>
            <p className="discord-empty-text">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          groupedMessages.map((message) => (
            <ChatItem
              key={message.id}
              message={{
                id: message.id,
                content: message.content,
                sender: message.sender,
                timestamp: message.timestamp.getTime(),
                roomId: message.roomId,
                reactions: message.reactions,
                avatarUrl: message.avatarUrl,
                senderDisplayName: message.senderDisplayName,
                editedAt: message.editedAt?.getTime(),
                pinned: message.pinned,
                replyTo: message.replyTo
              }}
              matrixClient={matrixClient}
              currentUserId={matrixClient?.getUserId() || ''}
              isGrouped={message.isGrouped}
              showAvatar={message.showAvatar}
              isFirstInGroup={message.isFirstInGroup}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        matrixClient={matrixClient}
        placeholder="Type a message..."
      />

      {/* Media Viewer Modal */}
      {mediaViewer.isOpen && mediaViewer.contentUri && (
        <MediaViewer
          isOpen={mediaViewer.isOpen}
          onClose={closeMediaViewer}
          contentUri={mediaViewer.contentUri}
          filename={mediaViewer.filename || 'Unknown file'}
          mimetype={mediaViewer.mimetype || 'application/octet-stream'}
          size={mediaViewer.size || 0}
          matrixClient={matrixClient}
        />
      )}
    </div>
  );
}

export default ChatInterface;
'use client';

import React, { useState, useEffect } from 'react';
import { ChatInput } from './chat-input';
import { MediaMessage } from './media-message';
import { MediaViewer } from './media-viewer';
import { MediaUploadResult, getMessageType } from '@/lib/matrix/media';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'media';
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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {message.sender.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {/* Text Content */}
                {message.content && (
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}

                {/* Media Content */}
                {message.type === 'media' && message.mediaAttachment && (
                  <div className="mt-2">
                    <MediaMessage
                      contentUri={message.mediaAttachment.contentUri}
                      filename={message.mediaAttachment.filename}
                      mimetype={message.mediaAttachment.mimetype}
                      size={message.mediaAttachment.size}
                      matrixClient={matrixClient}
                      onMediaClick={handleMediaClick}
                    />
                  </div>
                )}
              </div>
            </div>
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
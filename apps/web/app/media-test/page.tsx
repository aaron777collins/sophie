'use client';

import React, { useState, useEffect } from 'react';
import { ChatInterface, MediaUploadResult } from '../../components/chat';

// Force dynamic rendering to avoid SSR issues with Matrix client
export const dynamic = 'force-dynamic';

// Mock Matrix client for testing
const mockMatrixClient = {
  getHomeserverUrl: () => 'https://matrix.example.com',
  getAccessToken: () => 'mock_access_token'
};

// Mock messages for testing
const mockMessages = [
  {
    id: '1',
    sender: 'Alice',
    content: 'Hey everyone! Check out this image I found:',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text' as const
  },
  {
    id: '2',
    sender: 'Alice',
    content: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    type: 'media' as const,
    mediaAttachment: {
      contentUri: 'https://picsum.photos/400/300',
      filename: 'beautiful-landscape.jpg',
      mimetype: 'image/jpeg',
      size: 245760
    }
  },
  {
    id: '3',
    sender: 'Bob',
    content: 'Nice! Here\'s a video I recorded yesterday:',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'text' as const
  },
  {
    id: '4',
    sender: 'Bob',
    content: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    type: 'media' as const,
    mediaAttachment: {
      contentUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      filename: 'my-video.mp4',
      mimetype: 'video/mp4',
      size: 5242880
    }
  },
  {
    id: '5',
    sender: 'Charlie',
    content: 'And here\'s a document with some important info:',
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
    type: 'text' as const
  },
  {
    id: '6',
    sender: 'Charlie',
    content: '',
    timestamp: new Date(Date.now() - 1000 * 30),
    type: 'media' as const,
    mediaAttachment: {
      contentUri: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      filename: 'project-report.pdf',
      mimetype: 'application/pdf',
      size: 13264
    }
  }
];

export default function MediaTestPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  const handleSendMessage = (content: string, attachments?: MediaUploadResult[]) => {
    const timestamp = new Date();
    
    // Add text message if content exists
    if (content.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'You',
        content: content.trim(),
        timestamp,
        type: 'text' as const
      };
      setMessages(prev => [...prev, newMessage]);
    }

    // Add media messages for attachments
    if (attachments && attachments.length > 0) {
      const mediaMessages = attachments.map((attachment, index) => ({
        id: `${Date.now()}-${index}`,
        sender: 'You',
        content: '',
        timestamp: new Date(timestamp.getTime() + index * 100), // Slight offset for ordering
        type: 'media' as const,
        mediaAttachment: {
          contentUri: attachment.contentUri,
          filename: attachment.filename,
          mimetype: attachment.mimetype,
          size: attachment.size
        }
      }));
      
      setMessages(prev => [...prev, ...mediaMessages]);
    }

    console.log('Message sent:', { content, attachments });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e5e5', 
        padding: '1rem' 
      }}>
        <h1 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#1f2937',
          margin: '0 0 0.25rem 0'
        }}>
          Media Upload Test Room
        </h1>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280',
          margin: 0
        }}>
          Test file uploads, image previews, and media rendering
        </p>
      </div>

      {/* Chat Interface */}
      <div style={{ height: 'calc(100vh - 80px)' }}>
        <ChatInterface
          roomId="!test-room:example.com"
          messages={messages}
          matrixClient={mockMatrixClient}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Instructions */}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        background: '#3b82f6',
        color: 'white',
        padding: '0.75rem',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '20rem',
        fontSize: '0.875rem'
      }}>
        <strong>Test Instructions:</strong>
        <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
          <li>• Try drag-and-drop file upload</li>
          <li>• Click paperclip to browse files</li>
          <li>• Click images for lightbox view</li>
          <li>• Test video/audio playback</li>
          <li>• Download file attachments</li>
        </ul>
      </div>
    </div>
  );
}
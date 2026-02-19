'use client';

import React from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import '@/components/chat/discord-chat-item.css';

// Mock Matrix client for testing
const mockMatrixClient = {
  getUserId: () => '@alice:matrix.org',
  sendEvent: async (roomId: string, eventType: string, content: any) => {
    console.log('Mock sending event:', { roomId, eventType, content });
    return { event_id: 'mock_event_' + Date.now() };
  },
  relations: async (roomId: string, eventId: string, relationType: string, eventType: string) => {
    console.log('Mock getting relations:', { roomId, eventId, relationType, eventType });
    return { events: [] };
  },
  redactEvent: async (roomId: string, eventId: string) => {
    console.log('Mock redacting event:', { roomId, eventId });
    return { event_id: eventId };
  }
};

// Mock messages to demonstrate Discord-style grouping
const mockMessages = [
  {
    id: '1',
    sender: '@alice:matrix.org',
    content: 'Hey everyone! 👋',
    timestamp: new Date('2024-02-18T10:00:00Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Alice',
    avatarUrl: undefined
  },
  {
    id: '2',
    sender: '@alice:matrix.org',
    content: 'How is everyone doing today?',
    timestamp: new Date('2024-02-18T10:01:00Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Alice',
    avatarUrl: undefined
  },
  {
    id: '3',
    sender: '@bob:matrix.org',
    content: 'Pretty good! Just working on some Matrix integration stuff',
    timestamp: new Date('2024-02-18T10:02:30Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Bob',
    avatarUrl: undefined,
    reactions: [
      {
        emoji: '👍',
        users: ['@alice:matrix.org', '@charlie:matrix.org']
      },
      {
        emoji: '🚀',
        users: ['@alice:matrix.org']
      }
    ]
  },
  {
    id: '4',
    sender: '@bob:matrix.org',
    content: 'The new Discord-style UI is looking great!',
    timestamp: new Date('2024-02-18T10:03:00Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Bob',
    avatarUrl: undefined
  },
  {
    id: '5',
    sender: '@charlie:matrix.org',
    content: 'Agreed! The message grouping works perfectly',
    timestamp: new Date('2024-02-18T10:05:00Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Charlie',
    avatarUrl: undefined
  },
  {
    id: '6',
    sender: '@alice:matrix.org',
    content: 'Thanks! The implementation follows the Discord UI Component Map exactly.',
    timestamp: new Date('2024-02-18T10:15:00Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Alice',
    avatarUrl: undefined,
    replyTo: {
      id: '5',
      content: 'Agreed! The message grouping works perfectly',
      sender: '@charlie:matrix.org',
      senderDisplayName: 'Charlie'
    }
  },
  {
    id: '7',
    sender: '@alice:matrix.org',
    content: 'Color scheme, typography, layout - everything matches Discord! 🎨',
    timestamp: new Date('2024-02-18T10:15:30Z'),
    roomId: '!test:matrix.org',
    type: 'text' as const,
    senderDisplayName: 'Alice',
    avatarUrl: undefined
  }
];

export default function DiscordChatTestPage() {
  const handleSendMessage = (content: string, attachments?: any[]) => {
    console.log('Sending message:', { content, attachments });
    // In a real app, this would send to Matrix
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      {/* Discord-like header */}
      <div style={{
        backgroundColor: 'var(--discord-bg-secondary)',
        borderBottom: '1px solid var(--discord-divider)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        color: 'var(--discord-text-normal)',
        fontFamily: 'var(--discord-font-primary)'
      }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>#</span>
        <span style={{ fontWeight: '600' }}>general</span>
        <div style={{ marginLeft: '16px', color: 'var(--discord-text-muted)' }}>
          Discord-style MELO V2 Chat Interface
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1" style={{ height: 'calc(100vh - 60px)' }}>
        <ChatInterface
          roomId="!test:matrix.org"
          messages={mockMessages}
          matrixClient={mockMatrixClient}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
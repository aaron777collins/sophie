'use client';

import React from 'react';
import { ChatMessages } from '@/components/chat-messages';

// Mock data for visual testing
const mockMessages = [
  {
    id: '1',
    content: 'Hey everyone! 👋 How is everyone doing today?',
    sender: {
      id: 'user1',
      name: 'Alice Cooper',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b6fcd0c4?w=64&h=64&fit=crop&crop=face'
    },
    timestamp: new Date('2024-02-18T09:00:00Z'),
    eventId: 'event1',
    reactions: [
      {
        emoji: '👋',
        count: 3,
        users: ['user2', 'user3', 'user4']
      },
      {
        emoji: '❤️',
        count: 1,
        users: ['user5']
      }
    ]
  },
  {
    id: '2',
    content: 'I\'m doing great! Just finished a big project at work. Feeling accomplished! 🎉',
    sender: {
      id: 'user2',
      name: 'Bob Dylan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    timestamp: new Date('2024-02-18T09:15:00Z'),
    eventId: 'event2',
    reactions: [
      {
        emoji: '🎉',
        count: 5,
        users: ['user1', 'user3', 'user4', 'user5', 'current-user']
      }
    ]
  },
  {
    id: '3',
    content: 'Congratulations Bob! That sounds amazing. What kind of project was it?',
    sender: {
      id: 'user3',
      name: 'Charlie Brown'
    },
    timestamp: new Date('2024-02-18T09:16:00Z'),
    eventId: 'event3'
  },
  {
    id: '4',
    content: 'Thanks! It was a complete redesign of our company\'s main dashboard. Took about 3 months but the result is incredible.',
    sender: {
      id: 'user2',
      name: 'Bob Dylan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    timestamp: new Date('2024-02-18T09:18:00Z'),
    eventId: 'event4',
    isEdited: true
  },
  {
    id: '5',
    content: 'That sounds like a lot of work! I\'m working on something similar right now. Any tips?',
    sender: {
      id: 'current-user',
      name: 'Current User'
    },
    timestamp: new Date('2024-02-18T09:20:00Z'),
    eventId: 'event5'
  },
  {
    id: '6',
    content: 'Great advice! Thanks Bob 🙏',
    sender: {
      id: 'current-user',
      name: 'Current User'
    },
    timestamp: new Date('2024-02-18T09:26:00Z'),
    eventId: 'event7',
    reactions: [
      {
        emoji: '🙏',
        count: 1,
        users: ['user2']
      }
    ]
  }
];

export default function ChatMessagesDemo() {
  const [messages, setMessages] = React.useState(mockMessages);

  const handleReaction = async (messageId: string, emoji: string) => {
    console.log('Add reaction:', { messageId, emoji });
  };

  const handleReply = (messageId: string) => {
    console.log('Reply to message:', messageId);
  };

  const handleEdit = (messageId: string, content: string) => {
    console.log('Edit message:', { messageId, content });
  };

  const handleDelete = (messageId: string) => {
    console.log('Delete message:', messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleRefresh = async () => {
    console.log('Refresh messages');
    // Simulate loading more messages
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="h-screen bg-[#313338] flex flex-col">
      <div className="bg-[#313338] border-b border-gray-600 p-4">
        <h1 className="text-white text-xl font-semibold">Chat Messages Demo</h1>
        <p className="text-gray-400 text-sm">
          This demo shows the chat messages component with Matrix authentication integration
        </p>
      </div>
      
      <div className="flex-1 flex">
        <div className="w-full max-w-4xl mx-auto border-x border-gray-600">
          <ChatMessages
            messages={messages}
            currentUserId="current-user"
            roomId="demo-room"
            onMessageReply={handleReply}
            onMessageEdit={handleEdit}
            onMessageDelete={handleDelete}
            onRefresh={handleRefresh}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
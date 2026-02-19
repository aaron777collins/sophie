import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatMessages } from '../chat-messages';
import { useMatrixMessaging } from '@/hooks/use-matrix-messaging';
import { MatrixClient } from 'matrix-js-sdk';

// Mock the Matrix messaging hook
jest.mock('@/hooks/use-matrix-messaging');
const mockUseMatrixMessaging = useMatrixMessaging as jest.MockedFunction<typeof useMatrixMessaging>;

// Mock scrollIntoView which is not available in JSDOM
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

// Mock Matrix client
const mockMatrixClient = {
  sendMessage: jest.fn(),
  sendEvent: jest.fn(),
} as unknown as MatrixClient;

// Comprehensive mock data for visual testing
const visualTestMessages = [
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
      },
      {
        emoji: '👏',
        count: 2,
        users: ['user1', 'current-user']
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
    content: 'Absolutely! The key is to break it down into smaller, manageable phases. Start with user research, then wireframes, then high-fidelity designs. Don\'t try to do everything at once!',
    sender: {
      id: 'user2',
      name: 'Bob Dylan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    timestamp: new Date('2024-02-18T09:25:00Z'),
    eventId: 'event6'
  },
  {
    id: '7',
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
  },
  {
    id: '8',
    content: 'Has anyone tried the new Matrix features? The encryption improvements are really impressive!',
    sender: {
      id: 'user4',
      name: 'Diana Prince',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    },
    timestamp: new Date('2024-02-18T09:30:00Z'),
    eventId: 'event8'
  },
  {
    id: '9',
    content: 'Yes! The E2E encryption is so much faster now. And the cross-signing verification process is much smoother.',
    sender: {
      id: 'current-user',
      name: 'Current User'
    },
    timestamp: new Date('2024-02-18T09:32:00Z'),
    eventId: 'event9'
  },
  {
    id: '10',
    content: 'This is a really long message to test how the chat handles text wrapping and layout with longer content. Sometimes users write really detailed explanations or share stories that span multiple lines. The message bubble should expand appropriately and maintain good readability. What do you think about the formatting?',
    sender: {
      id: 'user5',
      name: 'Frank Miller'
    },
    timestamp: new Date('2024-02-18T09:35:00Z'),
    eventId: 'event10',
    reactions: [
      {
        emoji: '📝',
        count: 2,
        users: ['user1', 'current-user']
      },
      {
        emoji: '👍',
        count: 4,
        users: ['user1', 'user2', 'user3', 'current-user']
      }
    ]
  }
];

const defaultProps = {
  messages: visualTestMessages,
  currentUserId: 'current-user',
  roomId: 'room123',
  client: mockMatrixClient,
};

describe('ChatMessages Visual Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMatrixMessaging.mockReturnValue({
      sendMessage: jest.fn(),
      sendFormattedMessage: jest.fn(),
      sendReaction: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });
  });

  describe('Message Layout Visual Tests', () => {
    it('renders standard message layout', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '600px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('standard-message-layout');
    });

    it('renders mobile layout', () => {
      const { container } = render(
        <div style={{ width: '375px', height: '667px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('mobile-message-layout');
    });

    it('renders tablet layout', () => {
      const { container } = render(
        <div style={{ width: '768px', height: '1024px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('tablet-message-layout');
    });
  });

  describe('Message States Visual Tests', () => {
    it('renders loading state', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '600px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} isLoading={true} messages={[]} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('loading-state');
    });

    it('renders empty state', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '600px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={[]} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('empty-state');
    });

    it('renders single message', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '600px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={[visualTestMessages[0]]} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('single-message');
    });
  });

  describe('Message Types Visual Tests', () => {
    it('renders own messages', () => {
      const ownMessages = visualTestMessages.filter(m => m.sender.id === 'current-user');
      const { container } = render(
        <div style={{ width: '400px', height: '400px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={ownMessages} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('own-messages');
    });

    it('renders other users messages', () => {
      const otherMessages = visualTestMessages.filter(m => m.sender.id !== 'current-user').slice(0, 3);
      const { container } = render(
        <div style={{ width: '400px', height: '400px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={otherMessages} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('other-messages');
    });

    it('renders messages with avatars', () => {
      const messagesWithAvatars = visualTestMessages.filter(m => m.sender.avatar).slice(0, 3);
      const { container } = render(
        <div style={{ width: '400px', height: '400px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={messagesWithAvatars} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('messages-with-avatars');
    });

    it('renders messages without avatars', () => {
      const messagesWithoutAvatars = visualTestMessages.filter(m => !m.sender.avatar).slice(0, 3);
      const { container } = render(
        <div style={{ width: '400px', height: '400px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={messagesWithoutAvatars} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('messages-without-avatars');
    });

    it('renders edited messages', () => {
      const editedMessages = visualTestMessages.filter(m => m.isEdited);
      const { container } = render(
        <div style={{ width: '400px', height: '300px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={editedMessages} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('edited-messages');
    });

    it('renders long messages', () => {
      const longMessages = visualTestMessages.filter(m => m.content.length > 100);
      const { container } = render(
        <div style={{ width: '400px', height: '300px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={longMessages} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('long-messages');
    });
  });

  describe('Reactions Visual Tests', () => {
    it('renders messages with reactions', () => {
      const messagesWithReactions = visualTestMessages.filter(m => m.reactions && m.reactions.length > 0);
      const { container } = render(
        <div style={{ width: '400px', height: '500px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={messagesWithReactions} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('messages-with-reactions');
    });

    it('renders single reaction', () => {
      const messageWithSingleReaction = [visualTestMessages.find(m => m.reactions?.length === 1)!];
      const { container } = render(
        <div style={{ width: '400px', height: '200px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={messageWithSingleReaction} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('single-reaction');
    });

    it('renders multiple reactions', () => {
      const messageWithMultipleReactions = [visualTestMessages.find(m => m.reactions && m.reactions.length > 1)!];
      const { container } = render(
        <div style={{ width: '400px', height: '200px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={messageWithMultipleReactions} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('multiple-reactions');
    });
  });

  describe('Dark Theme Visual Tests', () => {
    it('renders in dark theme', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '600px', backgroundColor: '#313338' }} className="dark">
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('dark-theme');
    });
  });

  describe('Responsive Visual Tests', () => {
    it('renders on small mobile (320px)', () => {
      const { container } = render(
        <div style={{ width: '320px', height: '568px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('small-mobile-320px');
    });

    it('renders on large mobile (414px)', () => {
      const { container } = render(
        <div style={{ width: '414px', height: '896px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('large-mobile-414px');
    });

    it('renders on desktop (1200px)', () => {
      const { container } = render(
        <div style={{ width: '1200px', height: '800px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} />
        </div>
      );
      
      expect(container.firstChild).toMatchSnapshot('desktop-1200px');
    });
  });

  describe('Interaction States Visual Tests', () => {
    it('renders message with hover state simulation', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '200px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={[visualTestMessages[0]]} />
        </div>
      );
      
      // Add hover class to simulate hover state
      const messageElement = container.querySelector('.cursor-pointer');
      if (messageElement) {
        messageElement.classList.add('hover:scale-105');
      }
      
      expect(container.firstChild).toMatchSnapshot('message-hover-state');
    });

    it('renders pressed state simulation', () => {
      const { container } = render(
        <div style={{ width: '400px', height: '200px', backgroundColor: '#313338' }}>
          <ChatMessages {...defaultProps} messages={[visualTestMessages[0]]} />
        </div>
      );
      
      // Add pressed class to simulate pressed state
      const messageElement = container.querySelector('.cursor-pointer');
      if (messageElement) {
        messageElement.classList.add('opacity-75', 'scale-98');
      }
      
      expect(container.firstChild).toMatchSnapshot('message-pressed-state');
    });
  });
});
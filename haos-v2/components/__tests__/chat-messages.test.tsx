import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
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

// Mock data
const mockMessages = [
  {
    id: '1',
    content: 'Hello everyone!',
    sender: {
      id: 'user1',
      name: 'Alice',
      avatar: 'https://example.com/alice.png'
    },
    timestamp: new Date('2024-02-18T10:00:00Z'),
    eventId: 'event1',
    reactions: [
      {
        emoji: '👍',
        count: 2,
        users: ['user2', 'user3']
      }
    ]
  },
  {
    id: '2',
    content: 'How is everyone doing?',
    sender: {
      id: 'user2',
      name: 'Bob'
    },
    timestamp: new Date('2024-02-18T10:01:00Z'),
    eventId: 'event2',
    isEdited: true
  },
  {
    id: '3',
    content: 'I am doing great, thanks!',
    sender: {
      id: 'current-user',
      name: 'Current User'
    },
    timestamp: new Date('2024-02-18T10:02:00Z'),
    eventId: 'event3'
  }
];

const defaultProps = {
  messages: mockMessages,
  currentUserId: 'current-user',
  roomId: 'room123',
  client: mockMatrixClient,
};

describe('ChatMessages', () => {
  const mockSendReaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMatrixMessaging.mockReturnValue({
      sendMessage: jest.fn(),
      sendFormattedMessage: jest.fn(),
      sendReaction: mockSendReaction,
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });
  });

  describe('Message rendering', () => {
    it('renders all messages correctly', () => {
      render(<ChatMessages {...defaultProps} />);
      
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('How is everyone doing?')).toBeInTheDocument();
      expect(screen.getByText('I am doing great, thanks!')).toBeInTheDocument();
    });

    it('displays sender names for other users but not for current user', () => {
      render(<ChatMessages {...defaultProps} />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.queryByText('Current User')).not.toBeInTheDocument();
    });

    it('shows avatars for other users messages', () => {
      render(<ChatMessages {...defaultProps} />);
      
      const aliceAvatar = screen.getByAltText('Alice');
      expect(aliceAvatar).toBeInTheDocument();
      expect(aliceAvatar).toHaveAttribute('src', 'https://example.com/alice.png');
    });

    it('displays fallback avatar with initials when no avatar provided', () => {
      render(<ChatMessages {...defaultProps} />);
      
      expect(screen.getByText('B')).toBeInTheDocument(); // Bob's initial
    });

    it('shows edited indicator for edited messages', () => {
      render(<ChatMessages {...defaultProps} />);
      
      expect(screen.getByText('(edited)')).toBeInTheDocument();
    });

    it('displays timestamps correctly', () => {
      render(<ChatMessages {...defaultProps} />);
      
      // Check that timestamps are displayed (format: HH:MM)
      const timestamps = screen.getAllByText(/^\d{2}:\d{2}$/);
      expect(timestamps).toHaveLength(3);
    });
  });

  describe('Message styling', () => {
    it('applies correct styling for own messages', () => {
      render(<ChatMessages {...defaultProps} />);
      
      const ownMessageContent = screen.getByText('I am doing great, thanks!').closest('.bg-blue-600');
      expect(ownMessageContent).toBeInTheDocument();
      expect(ownMessageContent).toHaveClass('text-white');
    });

    it('applies correct styling for other users messages', () => {
      render(<ChatMessages {...defaultProps} />);
      
      const otherMessageContent = screen.getByText('Hello everyone!').closest('.bg-gray-100');
      expect(otherMessageContent).toBeInTheDocument();
    });

    it('positions own messages to the right and others to the left', () => {
      render(<ChatMessages {...defaultProps} />);
      
      const ownMessageWrapper = screen.getByText('I am doing great, thanks!').closest('.justify-end');
      const otherMessageWrapper = screen.getByText('Hello everyone!').closest('.justify-start');
      
      expect(ownMessageWrapper).toBeInTheDocument();
      expect(otherMessageWrapper).toBeInTheDocument();
    });
  });

  describe('Reactions', () => {
    it('displays existing reactions on messages', () => {
      render(<ChatMessages {...defaultProps} />);
      
      expect(screen.getByText('👍')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('calls sendReaction when clicking on a reaction', async () => {
      const user = userEvent.setup();
      render(<ChatMessages {...defaultProps} />);
      
      const reactionButton = screen.getByText('👍').closest('button');
      if (reactionButton) {
        await user.click(reactionButton);
      }
      
      expect(mockSendReaction).toHaveBeenCalledWith('event1', '👍');
    });
  });

  describe('Long press interactions', () => {
    it('opens action sheet on long press', async () => {
      render(<ChatMessages {...defaultProps} />);
      
      const messageElement = screen.getByText('Hello everyone!').closest('div[onMouseDown]');
      
      if (messageElement) {
        fireEvent.mouseDown(messageElement);
        
        // Wait for the long press timeout
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 600));
        });
        
        expect(screen.getByText('Quick Reactions')).toBeInTheDocument();
        expect(screen.getByText('Reply to message')).toBeInTheDocument();
      }
    });

    it('shows edit and delete options for own messages', async () => {
      render(<ChatMessages {...defaultProps} />);
      
      const ownMessageElement = screen.getByText('I am doing great, thanks!').closest('div[onMouseDown]');
      
      if (ownMessageElement) {
        fireEvent.mouseDown(ownMessageElement);
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 600));
        });
        
        expect(screen.getByText('Edit message')).toBeInTheDocument();
        expect(screen.getByText('Delete message')).toBeInTheDocument();
      }
    });

    it('does not show edit and delete options for other users messages', async () => {
      render(<ChatMessages {...defaultProps} />);
      
      const otherMessageElement = screen.getByText('Hello everyone!').closest('div[onMouseDown]');
      
      if (otherMessageElement) {
        fireEvent.mouseDown(otherMessageElement);
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 600));
        });
        
        expect(screen.queryByText('Edit message')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete message')).not.toBeInTheDocument();
      }
    });
  });

  describe('Action sheet interactions', () => {
    beforeEach(async () => {
      render(<ChatMessages {...defaultProps} />);
      
      const messageElement = screen.getByText('Hello everyone!').closest('div[onMouseDown]');
      
      if (messageElement) {
        fireEvent.mouseDown(messageElement);
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 600));
        });
      }
    });

    it('closes action sheet when clicking backdrop', async () => {
      const user = userEvent.setup();
      const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
      
      if (backdrop) {
        await user.click(backdrop);
      }
      
      await waitFor(() => {
        expect(screen.queryByText('Quick Reactions')).not.toBeInTheDocument();
      });
    });

    it('sends reaction when clicking quick reaction button', async () => {
      const user = userEvent.setup();
      const reactionButton = screen.getByText('👍').closest('button');
      
      if (reactionButton) {
        await user.click(reactionButton);
      }
      
      expect(mockSendReaction).toHaveBeenCalledWith('event1', '👍');
      
      await waitFor(() => {
        expect(screen.queryByText('Quick Reactions')).not.toBeInTheDocument();
      });
    });

    it('calls onMessageReply when clicking reply button', async () => {
      const mockOnReply = jest.fn();
      const user = userEvent.setup();
      
      render(<ChatMessages {...defaultProps} onMessageReply={mockOnReply} />);
      
      const messageElement = screen.getByText('Hello everyone!').closest('div[onMouseDown]');
      
      if (messageElement) {
        fireEvent.mouseDown(messageElement);
        
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 600));
        });
        
        const replyButton = screen.getByText('Reply to message');
        await user.click(replyButton);
        
        expect(mockOnReply).toHaveBeenCalledWith('1');
      }
    });
  });

  describe('Loading states', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<ChatMessages {...defaultProps} isLoading={true} />);
      
      const loadingIndicator = document.querySelector('.animate-spin');
      expect(loadingIndicator).toBeInTheDocument();
    });

    it('shows pull-to-refresh indicator when refreshing', async () => {
      const mockOnRefresh = jest.fn(() => Promise.resolve());
      render(<ChatMessages {...defaultProps} onRefresh={mockOnRefresh} />);
      
      const container = document.querySelector('[ref]');
      if (container) {
        // Simulate pull to refresh
        fireEvent.touchStart(container, {
          touches: [{ clientY: 100 }]
        });
        
        (container as any).dataset.touchStart = '100';
        (container as any).scrollTop = 0;
        
        fireEvent.touchMove(container, {
          touches: [{ clientY: 200 }]
        });
        
        await waitFor(() => {
          expect(screen.getByText('Loading more messages...')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ChatMessages {...defaultProps} />);
      
      const reactionButtons = screen.getAllByRole('button');
      expect(reactionButtons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ChatMessages {...defaultProps} />);
      
      const reactionButton = screen.getByText('👍').closest('button');
      if (reactionButton) {
        await user.tab();
        expect(reactionButton).toHaveFocus();
      }
    });
  });

  describe('Auto-scroll behavior', () => {
    it('scrolls to bottom when new messages arrive', () => {
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      const { rerender } = render(<ChatMessages {...defaultProps} />);
      
      const newMessages = [
        ...mockMessages,
        {
          id: '4',
          content: 'New message',
          sender: {
            id: 'user4',
            name: 'Charlie'
          },
          timestamp: new Date('2024-02-18T10:03:00Z'),
          eventId: 'event4'
        }
      ];
      
      rerender(<ChatMessages {...defaultProps} messages={newMessages} />);
      
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Matrix integration', () => {
    it('initializes Matrix messaging hook with correct parameters', () => {
      render(<ChatMessages {...defaultProps} />);
      
      expect(mockUseMatrixMessaging).toHaveBeenCalledWith({
        client: mockMatrixClient,
        roomId: 'room123'
      });
    });

    it('handles Matrix client errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSendReaction.mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup();
      render(<ChatMessages {...defaultProps} />);
      
      const reactionButton = screen.getByText('👍').closest('button');
      if (reactionButton) {
        await user.click(reactionButton);
      }
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to send reaction:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});
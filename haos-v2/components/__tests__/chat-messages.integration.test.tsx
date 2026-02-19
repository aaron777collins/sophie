import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Simple mock data for integration testing
const integrationTestMessages = [
  {
    id: 'msg1',
    content: 'Hello from Alice!',
    sender: {
      id: 'alice',
      name: 'Alice',
      avatar: 'https://example.com/alice.png'
    },
    timestamp: new Date('2024-02-18T10:00:00Z'),
    eventId: 'matrix-event-1',
    reactions: [
      {
        emoji: '👍',
        count: 2,
        users: ['bob', 'charlie']
      }
    ]
  },
  {
    id: 'msg2',
    content: 'Reply from current user',
    sender: {
      id: 'current-user',
      name: 'You'
    },
    timestamp: new Date('2024-02-18T10:01:00Z'),
    eventId: 'matrix-event-2'
  }
];

describe('ChatMessages Integration Tests', () => {
  const mockSendReaction = jest.fn();
  const mockOnReply = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

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

  const renderChatMessages = (props = {}) => {
    return render(
      <ChatMessages
        messages={integrationTestMessages}
        currentUserId="current-user"
        roomId="test-room"
        client={mockMatrixClient}
        onMessageReply={mockOnReply}
        onMessageEdit={mockOnEdit}
        onMessageDelete={mockOnDelete}
        {...props}
      />
    );
  };

  it('renders messages correctly and displays content', () => {
    renderChatMessages();
    
    // Check messages are displayed
    expect(screen.getByText('Hello from Alice!')).toBeInTheDocument();
    expect(screen.getByText('Reply from current user')).toBeInTheDocument();
    
    // Check sender names
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('You')).not.toBeInTheDocument(); // Own messages don't show sender name
    
    // Check reactions
    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles Matrix messaging integration', () => {
    renderChatMessages();
    
    // Verify the Matrix messaging hook was called with correct parameters
    expect(mockUseMatrixMessaging).toHaveBeenCalledWith({
      client: mockMatrixClient,
      roomId: 'test-room'
    });
  });

  it('supports clicking on reactions', async () => {
    const user = userEvent.setup();
    renderChatMessages();
    
    // Find and click the reaction button
    const reactionButton = screen.getByRole('button', { name: /👍/ });
    await user.click(reactionButton);
    
    // Verify the sendReaction was called
    expect(mockSendReaction).toHaveBeenCalledWith('matrix-event-1', '👍');
  });

  it('displays loading state correctly', () => {
    renderChatMessages({ isLoading: true });
    
    // Should show loading spinner
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('handles empty message list', () => {
    renderChatMessages({ messages: [] });
    
    // Should render without errors
    expect(screen.queryByText('Hello from Alice!')).not.toBeInTheDocument();
  });

  it('supports long press interaction flow', async () => {
    renderChatMessages();
    
    // Find a message element and simulate mouseDown
    const messageText = screen.getByText('Hello from Alice!');
    const messageElement = messageText.closest('div');
    
    if (messageElement) {
      // Simulate long press
      fireEvent.mouseDown(messageElement);
      
      // Wait for action sheet to appear
      await waitFor(() => {
        expect(screen.getByText('Quick Reactions')).toBeInTheDocument();
      });
      
      // Check action sheet content
      expect(screen.getByText('Reply to message')).toBeInTheDocument();
    }
  });

  it('handles pull-to-refresh functionality', async () => {
    const mockOnRefresh = jest.fn().mockResolvedValue(undefined);
    renderChatMessages({ onRefresh: mockOnRefresh });
    
    const container = document.querySelector('[data-testid="chat-container"]') || 
                    document.querySelector('.overflow-hidden');
    
    if (container) {
      // Simulate touch events for pull-to-refresh
      fireEvent.touchStart(container, {
        touches: [{ clientY: 100 }]
      });
      
      fireEvent.touchMove(container, {
        touches: [{ clientY: 200 }] // Move down 100px
      });
      
      fireEvent.touchEnd(container);
      
      // Wait for refresh to be called
      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    }
  });

  it('renders different message styles correctly', () => {
    renderChatMessages();
    
    // Check own message styling
    const ownMessage = screen.getByText('Reply from current user');
    const ownMessageBubble = ownMessage.closest('.bg-blue-600');
    expect(ownMessageBubble).toBeInTheDocument();
    
    // Check other user message styling  
    const otherMessage = screen.getByText('Hello from Alice!');
    const otherMessageBubble = otherMessage.closest('.bg-gray-100');
    expect(otherMessageBubble).toBeInTheDocument();
  });

  it('supports accessibility features', () => {
    renderChatMessages();
    
    // Check that interactive elements have proper roles
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check that images have alt text
    const avatar = screen.getByAltText('Alice');
    expect(avatar).toBeInTheDocument();
  });

  it('handles Matrix client errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSendReaction.mockRejectedValue(new Error('Matrix client error'));
    
    const user = userEvent.setup();
    renderChatMessages();
    
    // Click reaction button
    const reactionButton = screen.getByRole('button', { name: /👍/ });
    await user.click(reactionButton);
    
    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to send reaction:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('auto-scrolls when new messages arrive', () => {
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;
    
    const { rerender } = renderChatMessages();
    
    // Add new message
    const newMessages = [
      ...integrationTestMessages,
      {
        id: 'msg3',
        content: 'New message',
        sender: { id: 'bob', name: 'Bob' },
        timestamp: new Date(),
        eventId: 'matrix-event-3'
      }
    ];
    
    rerender(
      <ChatMessages
        messages={newMessages}
        currentUserId="current-user"
        roomId="test-room"
        client={mockMatrixClient}
      />
    );
    
    // Should call scrollIntoView for auto-scroll
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
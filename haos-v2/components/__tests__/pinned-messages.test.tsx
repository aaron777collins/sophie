import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PinnedMessagesModal } from '../pinned-messages';

// Mock the hooks
jest.mock('../../hooks/use-pins', () => ({
  usePins: jest.fn(() => ({
    pinnedMessages: [],
    isLoading: false,
    error: null,
  }))
}));

// Import mocked hook for testing
import { usePins } from '../../hooks/use-pins';

const mockUsePins = usePins as jest.MockedFunction<typeof usePins>;

describe('PinnedMessagesModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    roomId: '!test:matrix.org',
    onJumpToMessage: jest.fn(),
  };

  const mockPinnedMessage = {
    id: '1',
    content: 'This is a test pinned message',
    sender: '@testuser:matrix.org',
    timestamp: new Date('2023-01-01T12:00:00Z'),
    eventId: '$event1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default mock values
    mockUsePins.mockReturnValue({
      pinnedMessages: [],
      isLoading: false,
      error: null,
    });
  });

  describe('Modal Behavior', () => {
    it('renders when open is true', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Pinned Messages')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<PinnedMessagesModal {...defaultProps} open={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('calls onOpenChange when close button is clicked', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);
      
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [],
        isLoading: true,
        error: null,
      });

      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('Loading pinned messages...')).toBeInTheDocument();
      // Check for the spinning animation (loading spinner is a div with animate-spin class)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when there is an error', () => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [],
        isLoading: false,
        error: 'Network connection failed',
      });

      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('Failed to load pinned messages')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no pinned messages', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('No pinned messages')).toBeInTheDocument();
      expect(screen.getByText(/Pinned messages will appear here/)).toBeInTheDocument();
    });
  });

  describe('Pinned Messages Display', () => {
    beforeEach(() => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [mockPinnedMessage],
        isLoading: false,
        error: null,
      });
    });

    it('displays pinned message count in header', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('(1)')).toBeInTheDocument();
    });

    it('displays message content', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('This is a test pinned message')).toBeInTheDocument();
    });

    it('displays sender information', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('@testuser:matrix.org')).toBeInTheDocument();
    });

    it('displays formatted timestamp', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      // The timestamp should be formatted as "Jan 1, 2023 at 12:00 PM" or similar
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    });

    it('displays sender avatar with initials', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      // Should show first two characters of sender as initials
      expect(screen.getByText('@T')).toBeInTheDocument();
    });

    it('shows pin icon for each message', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      // Pin icon should be present (lucide-react Pin component renders as SVG)
      const pinIcons = document.querySelectorAll('svg');
      expect(pinIcons.length).toBeGreaterThan(0); // Should have pin icon SVGs
    });

    it('calls onJumpToMessage when Jump to Message is clicked', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const jumpButton = screen.getByRole('button', { name: 'Jump to Message' });
      fireEvent.click(jumpButton);
      
      expect(defaultProps.onJumpToMessage).toHaveBeenCalledWith('$event1');
    });
  });

  describe('Multiple Messages', () => {
    const multiplePinnedMessages = [
      {
        id: '1',
        content: 'First pinned message',
        sender: '@user1:matrix.org',
        timestamp: new Date('2023-01-01T12:00:00Z'),
        eventId: '$event1'
      },
      {
        id: '2',
        content: 'Second pinned message',
        sender: '@user2:matrix.org',
        timestamp: new Date('2023-01-02T15:30:00Z'),
        eventId: '$event2'
      },
      {
        id: '3',
        content: 'Third pinned message with a very long content that should wrap properly and not break the layout',
        sender: '@user3:matrix.org',
        timestamp: new Date('2023-01-03T09:15:00Z'),
        eventId: '$event3'
      }
    ];

    beforeEach(() => {
      mockUsePins.mockReturnValue({
        pinnedMessages: multiplePinnedMessages,
        isLoading: false,
        error: null,
      });
    });

    it('displays correct count for multiple messages', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });

    it('displays all pinned messages', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      expect(screen.getByText('First pinned message')).toBeInTheDocument();
      expect(screen.getByText('Second pinned message')).toBeInTheDocument();
      expect(screen.getByText(/Third pinned message with a very long content/)).toBeInTheDocument();
    });

    it('handles long message content properly', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const longMessage = screen.getByText(/Third pinned message with a very long content/);
      expect(longMessage).toBeInTheDocument();
      // Should have word breaking classes applied to the message paragraph
      expect(longMessage).toHaveClass('break-words');
    });

    it('creates individual jump buttons for each message', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const jumpButtons = screen.getAllByRole('button', { name: 'Jump to Message' });
      expect(jumpButtons).toHaveLength(3);
      
      // Test that each button calls with the correct event ID
      fireEvent.click(jumpButtons[0]);
      expect(defaultProps.onJumpToMessage).toHaveBeenCalledWith('$event1');
      
      fireEvent.click(jumpButtons[1]);
      expect(defaultProps.onJumpToMessage).toHaveBeenCalledWith('$event2');
      
      fireEvent.click(jumpButtons[2]);
      expect(defaultProps.onJumpToMessage).toHaveBeenCalledWith('$event3');
    });
  });

  describe('Message Formatting', () => {
    it('preserves whitespace in message content', () => {
      const messageWithWhitespace = {
        id: '1',
        content: 'Line 1\n\nLine 3 with  multiple  spaces',
        sender: '@user:matrix.org',
        timestamp: new Date('2023-01-01T12:00:00Z'),
        eventId: '$event1'
      };

      mockUsePins.mockReturnValue({
        pinnedMessages: [messageWithWhitespace],
        isLoading: false,
        error: null,
      });

      render(<PinnedMessagesModal {...defaultProps} />);
      
      const messageContent = screen.getByText(/Line 1.*Line 3/);
      expect(messageContent).toHaveClass('whitespace-pre-wrap');
    });

    it('handles different timestamp formats correctly', () => {
      const messageWithRecentTime = {
        id: '1',
        content: 'Recent message',
        sender: '@user:matrix.org',
        timestamp: new Date(),
        eventId: '$event1'
      };

      mockUsePins.mockReturnValue({
        pinnedMessages: [messageWithRecentTime],
        isLoading: false,
        error: null,
      });

      render(<PinnedMessagesModal {...defaultProps} />);
      
      // Should show current date
      const currentDate = new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(new Date());
      
      expect(screen.getByText(new RegExp(currentDate))).toBeInTheDocument();
    });
  });

  describe('Scrolling Behavior', () => {
    it('has scrollable container for many messages', () => {
      const manyMessages = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        content: `Message ${i + 1}`,
        sender: `@user${i + 1}:matrix.org`,
        timestamp: new Date(`2023-01-0${(i % 9) + 1}T12:00:00Z`),
        eventId: `$event${i + 1}`
      }));

      mockUsePins.mockReturnValue({
        pinnedMessages: manyMessages,
        isLoading: false,
        error: null,
      });

      render(<PinnedMessagesModal {...defaultProps} />);
      
      const messagesContainer = screen.getByRole('dialog').querySelector('.overflow-y-auto');
      expect(messagesContainer).toBeInTheDocument();
      expect(messagesContainer).toHaveClass('max-h-96');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [mockPinnedMessage],
        isLoading: false,
        error: null,
      });
    });

    it('has proper dialog role and title', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Pinned Messages')).toBeInTheDocument();
    });

    it('has accessible close button', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('has accessible jump buttons', () => {
      render(<PinnedMessagesModal {...defaultProps} />);
      
      const jumpButton = screen.getByRole('button', { name: 'Jump to Message' });
      expect(jumpButton).toBeInTheDocument();
    });
  });
});
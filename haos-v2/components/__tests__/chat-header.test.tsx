import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatHeader } from '../chat-header';

// Mock the hooks
jest.mock('../../hooks/use-pins', () => ({
  usePins: jest.fn(() => ({
    pinnedMessages: [],
    isLoading: false,
    error: null,
  }))
}));

jest.mock('../../hooks/use-crypto-status', () => ({
  useCryptoStatus: jest.fn(() => ({
    state: 'verified',
    statusMessage: 'Verified & Encrypted',
    detailedMessage: 'All devices in this room have been verified. Your messages are secure.',
    isLoading: false,
    error: null,
  }))
}));

// Import mocked hooks for testing
import { usePins } from '../../hooks/use-pins';
import { useCryptoStatus } from '../../hooks/use-crypto-status';

const mockUsePins = usePins as jest.MockedFunction<typeof usePins>;
const mockUseCryptoStatus = useCryptoStatus as jest.MockedFunction<typeof useCryptoStatus>;

describe('ChatHeader', () => {
  const defaultProps = {
    channelName: 'general',
    roomId: '!test:matrix.org',
    description: 'General discussion',
    onOpenSettings: jest.fn(),
    onOpenMembers: jest.fn(),
    onOpenSearch: jest.fn(),
    onToggleNotifications: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default mock values
    mockUsePins.mockReturnValue({
      pinnedMessages: [],
      isLoading: false,
      error: null,
    });
    mockUseCryptoStatus.mockReturnValue({
      state: 'verified',
      statusMessage: 'Verified & Encrypted',
      detailedMessage: 'All devices in this room have been verified. Your messages are secure.',
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('renders the channel name correctly', () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText('general')).toBeInTheDocument();
    });

    it('renders the hash icon for text channels', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      const hashIcon = container.querySelector('.lucide-hash');
      expect(hashIcon).toBeInTheDocument();
    });

    it('renders the voice indicator for voice channels', () => {
      render(<ChatHeader {...defaultProps} isVoiceChannel={true} />);
      const voiceIndicator = screen.getByRole('banner').querySelector('.bg-green-500\\/20');
      expect(voiceIndicator).toBeInTheDocument();
    });

    it('renders the channel description when provided', () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText('General discussion')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      const propsWithoutDescription = { ...defaultProps };
      delete propsWithoutDescription.description;
      render(<ChatHeader {...propsWithoutDescription} />);
      expect(screen.queryByText('General discussion')).not.toBeInTheDocument();
    });
  });

  describe('Encryption Status', () => {
    it('shows verified encryption status', () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByLabelText('Encryption status: Verified & Encrypted')).toBeInTheDocument();
    });

    it('shows unverified encryption status', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unverified',
        statusMessage: 'Encrypted',
        detailedMessage: 'Messages are encrypted, but some devices haven\'t been verified.',
        isLoading: false,
        error: null,
      });

      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText('E2E')).toBeInTheDocument();
      expect(screen.getByLabelText('Encryption status: Encrypted')).toBeInTheDocument();
    });

    it('shows unencrypted status', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unencrypted',
        statusMessage: 'Not Encrypted',
        detailedMessage: 'Messages in this room are not encrypted.',
        isLoading: false,
        error: null,
      });

      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText('Unencrypted')).toBeInTheDocument();
      expect(screen.getByLabelText('Encryption status: Not Encrypted')).toBeInTheDocument();
    });

    it('shows loading indicator when crypto status is loading', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unknown',
        statusMessage: 'Checking...',
        detailedMessage: 'Checking encryption status...',
        isLoading: true,
        error: null,
      });

      render(<ChatHeader {...defaultProps} />);
      const loadingIndicator = screen.getByRole('banner').querySelector('.animate-pulse');
      expect(loadingIndicator).toBeInTheDocument();
    });

    it('can be hidden with showEncryption prop', () => {
      render(<ChatHeader {...defaultProps} showEncryption={false} />);
      expect(screen.queryByLabelText(/Encryption status/)).not.toBeInTheDocument();
    });
  });

  describe('Pinned Messages', () => {
    it('shows pinned messages button when there are pinned messages', () => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [
          {
            id: '1',
            content: 'Test pinned message',
            sender: '@user:matrix.org',
            timestamp: new Date(),
            eventId: '$test1'
          }
        ],
        isLoading: false,
        error: null,
      });

      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByLabelText('View 1 pinned messages')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not show pinned messages button when there are no pinned messages', () => {
      render(<ChatHeader {...defaultProps} />);
      expect(screen.queryByLabelText(/View.*pinned messages/)).not.toBeInTheDocument();
    });

    it('opens pinned messages modal when clicked', async () => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [
          {
            id: '1',
            content: 'Test pinned message',
            sender: '@user:matrix.org',
            timestamp: new Date(),
            eventId: '$test1'
          }
        ],
        isLoading: false,
        error: null,
      });

      render(<ChatHeader {...defaultProps} />);
      
      const pinButton = screen.getByLabelText('View 1 pinned messages');
      fireEvent.click(pinButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Pinned Messages')).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('renders all action buttons', () => {
      render(<ChatHeader {...defaultProps} />);
      
      expect(screen.getByLabelText('Disable notifications')).toBeInTheDocument(); // Default is true
      expect(screen.getByLabelText('Search messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Member list')).toBeInTheDocument();
      expect(screen.getByLabelText('Help')).toBeInTheDocument();
      expect(screen.getByLabelText('Channel settings')).toBeInTheDocument();
    });

    it('calls onToggleNotifications when notifications button is clicked', () => {
      render(<ChatHeader {...defaultProps} />);
      
      const notificationButton = screen.getByLabelText('Disable notifications');
      fireEvent.click(notificationButton);
      
      expect(defaultProps.onToggleNotifications).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenSearch when search button is clicked', () => {
      render(<ChatHeader {...defaultProps} />);
      
      const searchButton = screen.getByLabelText('Search messages');
      fireEvent.click(searchButton);
      
      expect(defaultProps.onOpenSearch).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenMembers when members button is clicked', () => {
      render(<ChatHeader {...defaultProps} />);
      
      const membersButton = screen.getByLabelText('Member list');
      fireEvent.click(membersButton);
      
      expect(defaultProps.onOpenMembers).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenSettings when settings button is clicked', () => {
      render(<ChatHeader {...defaultProps} />);
      
      const settingsButton = screen.getByLabelText('Channel settings');
      fireEvent.click(settingsButton);
      
      expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('shows notification disabled state', () => {
      render(<ChatHeader {...defaultProps} notificationsEnabled={false} />);
      
      const notificationButton = screen.getByLabelText('Enable notifications');
      const bellIcon = notificationButton.querySelector('svg');
      expect(bellIcon).toHaveClass('opacity-50');
    });
  });

  describe('Member Count Display', () => {
    it('displays online/total member count when both are provided', () => {
      render(<ChatHeader {...defaultProps} onlineMembers={5} totalMembers={10} />);
      expect(screen.getByText('5/10')).toBeInTheDocument();
    });

    it('displays only total members when online count is not provided', () => {
      render(<ChatHeader {...defaultProps} totalMembers={10} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('displays only online members when total count is not provided', () => {
      render(<ChatHeader {...defaultProps} onlineMembers={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not display member count when neither is provided', () => {
      render(<ChatHeader {...defaultProps} />);
      const membersButton = screen.getByLabelText('Member list');
      expect(membersButton.textContent).not.toMatch(/\d/);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      render(<ChatHeader {...defaultProps} />);
      
      expect(screen.getByLabelText('Disable notifications')).toBeInTheDocument(); // Default is true
      expect(screen.getByLabelText('Search messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Member list')).toBeInTheDocument();
      expect(screen.getByLabelText('Help')).toBeInTheDocument();
      expect(screen.getByLabelText('Channel settings')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      render(<ChatHeader {...defaultProps} />);
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('general');
    });

    it('encryption status has proper role and aria-label', () => {
      render(<ChatHeader {...defaultProps} />);
      
      const encryptionStatus = screen.getByRole('status');
      expect(encryptionStatus).toHaveAttribute('aria-label', 'Encryption status: Verified & Encrypted');
    });
  });

  describe('Error Handling', () => {
    it('handles pins loading error gracefully', () => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [],
        isLoading: false,
        error: 'Failed to fetch pins',
      });

      render(<ChatHeader {...defaultProps} />);
      // Component should still render without throwing
      expect(screen.getByText('general')).toBeInTheDocument();
    });

    it('handles crypto status error gracefully', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unknown',
        statusMessage: 'Error',
        detailedMessage: 'Failed to check encryption status',
        isLoading: false,
        error: 'Network error',
      });

      render(<ChatHeader {...defaultProps} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByLabelText('Encryption status: Error')).toBeInTheDocument();
    });
  });
});
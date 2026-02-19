import React from 'react';
import { render } from '@testing-library/react';
import { ChatHeader } from '../chat-header';

// Mock the hooks with different states for visual testing
jest.mock('../../hooks/use-pins', () => ({
  usePins: jest.fn()
}));

jest.mock('../../hooks/use-crypto-status', () => ({
  useCryptoStatus: jest.fn()
}));

import { usePins } from '../../hooks/use-pins';
import { useCryptoStatus } from '../../hooks/use-crypto-status';

const mockUsePins = usePins as jest.MockedFunction<typeof usePins>;
const mockUseCryptoStatus = useCryptoStatus as jest.MockedFunction<typeof useCryptoStatus>;

describe('ChatHeader Visual Tests', () => {
  const defaultProps = {
    channelName: 'general',
    roomId: '!test:matrix.org',
    description: 'General discussion channel',
    onOpenSettings: jest.fn(),
    onOpenMembers: jest.fn(),
    onOpenSearch: jest.fn(),
    onToggleNotifications: jest.fn(),
  };

  beforeEach(() => {
    // Default mock setup
    mockUsePins.mockReturnValue({
      pinnedMessages: [],
      isLoading: false,
      error: null,
    });
    mockUseCryptoStatus.mockReturnValue({
      state: 'verified',
      statusMessage: 'Verified & Encrypted',
      detailedMessage: 'All devices verified',
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout and Structure', () => {
    it('renders with correct basic layout', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const header = container.querySelector('header');
      expect(header).toHaveClass('h-12', 'px-4', 'flex', 'items-center', 'justify-between');
      expect(header).toHaveClass('border-b', 'border-black/20', 'bg-[#313338]');
    });

    it('renders left side elements correctly', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      // Check for hash icon (lucide-react uses different class structure)
      const hashIcon = container.querySelector('.lucide-hash');
      expect(hashIcon).toBeTruthy();
      
      // Check for channel name
      const channelName = container.querySelector('h1');
      expect(channelName).toHaveTextContent('general');
      expect(channelName).toHaveClass('font-semibold', 'text-white', 'truncate');
    });

    it('renders right side action buttons correctly', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      // Count action buttons
      const actionButtons = container.querySelectorAll('button');
      expect(actionButtons.length).toBeGreaterThanOrEqual(5); // At least: notifications, search, members, help, settings
      
      // Check button styling
      actionButtons.forEach(button => {
        expect(button).toHaveClass('h-8', 'px-2');
      });
    });
  });

  describe('Voice Channel Styling', () => {
    it('renders voice channel indicator correctly', () => {
      const { container } = render(<ChatHeader {...defaultProps} isVoiceChannel={true} />);
      
      const voiceIndicator = container.querySelector('.bg-green-500\\/20');
      expect(voiceIndicator).toBeTruthy();
      expect(voiceIndicator?.querySelector('.bg-green-500')).toBeTruthy();
    });
  });

  describe('Encryption Status Visual States', () => {
    it('renders verified encryption status with correct styling', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const encryptionStatus = container.querySelector('[role="status"]');
      expect(encryptionStatus).toBeTruthy();
      
      const verifiedIcon = encryptionStatus?.querySelector('.text-green-400');
      expect(verifiedIcon).toBeTruthy();
    });

    it('renders unverified encryption status with correct styling', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unverified',
        statusMessage: 'Encrypted',
        detailedMessage: 'Some devices unverified',
        isLoading: false,
        error: null,
      });

      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const encryptionStatus = container.querySelector('[role="status"]');
      expect(encryptionStatus).toBeTruthy();
      
      const unverifiedIcon = encryptionStatus?.querySelector('.text-yellow-400');
      expect(unverifiedIcon).toBeTruthy();
    });

    it('renders unencrypted status with correct styling', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unencrypted',
        statusMessage: 'Not Encrypted',
        detailedMessage: 'Room is not encrypted',
        isLoading: false,
        error: null,
      });

      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const encryptionStatus = container.querySelector('[role="status"]');
      expect(encryptionStatus).toBeTruthy();
      
      const unencryptedIcon = encryptionStatus?.querySelector('.text-red-400');
      expect(unencryptedIcon).toBeTruthy();
    });

    it('renders loading state with pulse animation', () => {
      mockUseCryptoStatus.mockReturnValue({
        state: 'unknown',
        statusMessage: 'Checking...',
        detailedMessage: 'Checking encryption status...',
        isLoading: true,
        error: null,
      });

      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const loadingIndicator = container.querySelector('.animate-pulse');
      expect(loadingIndicator).toBeTruthy();
    });
  });

  describe('Pinned Messages Visual States', () => {
    it('shows pinned message badge with correct styling', () => {
      mockUsePins.mockReturnValue({
        pinnedMessages: [
          {
            id: '1',
            content: 'Test',
            sender: 'user',
            timestamp: new Date(),
            eventId: '$1'
          },
          {
            id: '2',
            content: 'Test2',
            sender: 'user',
            timestamp: new Date(),
            eventId: '$2'
          }
        ],
        isLoading: false,
        error: null,
      });

      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const pinButton = container.querySelector('button[aria-label*="pinned messages"]');
      expect(pinButton).toBeTruthy();
      
      const badge = pinButton?.querySelector('.bg-blue-500');
      expect(badge).toBeTruthy();
      expect(badge).toHaveTextContent('2');
      expect(badge).toHaveClass('rounded-full', 'h-5', 'w-5');
    });

    it('hides pinned message button when no pins', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const pinButton = container.querySelector('button[aria-label*="pinned messages"]');
      expect(pinButton).toBeNull();
    });
  });

  describe('Member Count Visual Display', () => {
    it('displays member count with correct formatting', () => {
      const { container } = render(
        <ChatHeader {...defaultProps} onlineMembers={5} totalMembers={10} />
      );
      
      const membersButton = container.querySelector('button[aria-label="Member list"]');
      expect(membersButton).toHaveTextContent('5/10');
    });

    it('displays single member count correctly', () => {
      const { container } = render(
        <ChatHeader {...defaultProps} totalMembers={15} />
      );
      
      const membersButton = container.querySelector('button[aria-label="Member list"]');
      expect(membersButton).toHaveTextContent('15');
    });
  });

  describe('Notification State Visual Feedback', () => {
    it('shows enabled notification button normally', () => {
      const { container } = render(<ChatHeader {...defaultProps} notificationsEnabled={true} />);
      
      const notificationButton = container.querySelector('button[aria-label*="notifications"]');
      const bellIcon = notificationButton?.querySelector('svg');
      expect(bellIcon).not.toHaveClass('opacity-50');
    });

    it('shows disabled notification button with opacity', () => {
      const { container } = render(<ChatHeader {...defaultProps} notificationsEnabled={false} />);
      
      const notificationButton = container.querySelector('button[aria-label*="notifications"]');
      const bellIcon = notificationButton?.querySelector('svg');
      expect(bellIcon).toHaveClass('opacity-50');
    });
  });

  describe('Description Display', () => {
    it('shows description with proper separator', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      // Check for separator line
      const separator = container.querySelector('.w-px.bg-gray-600');
      expect(separator).toBeTruthy();
      
      // Check description text (more specific selector)
      const description = container.querySelector('p.text-sm.text-gray-400');
      expect(description).toHaveTextContent('General discussion channel');
      expect(description).toHaveClass('truncate', 'max-w-xs');
    });

    it('hides separator when no description', () => {
      const propsWithoutDescription = { ...defaultProps };
      delete propsWithoutDescription.description;
      
      const { container } = render(<ChatHeader {...propsWithoutDescription} />);
      
      const separator = container.querySelector('.w-px.bg-gray-600');
      expect(separator).toBeNull();
    });
  });

  describe('Responsive Design Elements', () => {
    it('hides encryption text on small screens', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      const encryptionText = container.querySelector('.hidden.md\\:inline');
      expect(encryptionText).toBeTruthy();
      expect(encryptionText).toHaveTextContent('Verified');
    });

    it('ensures proper text truncation on small screens', () => {
      const longChannelName = 'very-long-channel-name-that-should-truncate-properly';
      const { container } = render(
        <ChatHeader {...defaultProps} channelName={longChannelName} />
      );
      
      const channelTitle = container.querySelector('h1');
      expect(channelTitle).toHaveClass('truncate');
    });
  });

  describe('Color Theme Compliance', () => {
    it('uses correct Discord-like colors', () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      
      // Check header background
      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-[#313338]');
      
      // Check text colors
      const channelName = container.querySelector('h1');
      expect(channelName).toHaveClass('text-white');
      
      // Check button hover states
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('text-gray-400', 'hover:text-white', 'hover:bg-gray-700/50');
      });
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerPreview } from '../../../components/servers/server-preview';
import { ServerDiscoveryService, ServerPreview as ServerPreviewData } from '../../../lib/matrix/server-discovery';

// Mock ServerDiscoveryService
const mockDiscoveryService = {
  getServerPreview: jest.fn(),
  joinServer: jest.fn()
} as jest.Mocked<ServerDiscoveryService>;

const mockServerData: ServerPreviewData = {
  roomId: '!test:example.com',
  name: 'Test Server',
  topic: 'A test server for unit testing',
  memberCount: 250,
  avatarUrl: 'mxc://example.com/avatar',
  canonicalAlias: '#test:example.com',
  isEncrypted: true,
  description: 'Detailed description of the test server',
  language: 'english',
  category: 'technology'
};

describe('ServerPreview', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDiscoveryService.getServerPreview.mockResolvedValue(mockServerData);
  });

  it('should render loading state initially', () => {
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Loading server details...')).toBeInTheDocument();
    expect(screen.getByText('Server Preview')).toBeInTheDocument();
  });

  it('should load and display server details', async () => {
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    expect(mockDiscoveryService.getServerPreview).toHaveBeenCalledWith('!test:example.com');
    
    // Check server details
    expect(screen.getByText('A test server for unit testing')).toBeInTheDocument();
    expect(screen.getByText('👥 250 members')).toBeInTheDocument();
    expect(screen.getByText('🔒 Encrypted')).toBeInTheDocument();
    expect(screen.getAllByText('#test:example.com')).toHaveLength(2); // Appears in both alias and metadata sections
  });

  it('should display server language and category', async () => {
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('english')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('technology')).toBeInTheDocument();
  });

  it('should show server avatar when available', async () => {
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      const avatar = screen.getByAltText('Test Server avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'mxc://example.com/avatar');
    });
  });

  it('should show placeholder avatar when no avatar URL', async () => {
    const serverWithoutAvatar = { ...mockServerData, avatarUrl: undefined };
    mockDiscoveryService.getServerPreview.mockResolvedValue(serverWithoutAvatar);

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // First letter placeholder
    });
  });

  it('should display recent messages when available', async () => {
    const serverWithMessages = {
      ...mockServerData,
      recentMessages: [
        {
          sender: 'alice',
          content: 'Hello everyone!',
          timestamp: new Date('2024-01-01T10:00:00Z')
        },
        {
          sender: 'bob',
          content: 'How is everyone doing?',
          timestamp: new Date('2024-01-01T10:05:00Z')
        }
      ]
    };
    mockDiscoveryService.getServerPreview.mockResolvedValue(serverWithMessages);

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Messages')).toBeInTheDocument();
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('How is everyone doing?')).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  it('should display joined members when available', async () => {
    const serverWithMembers = {
      ...mockServerData,
      joinedMembers: ['alice', 'bob', 'charlie', 'dave', 'eve', 'frank']
    };
    mockDiscoveryService.getServerPreview.mockResolvedValue(serverWithMembers);

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Some Members')).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
      expect(screen.getByText('and 1 others...')).toBeInTheDocument(); // Shows only first 5
    });
  });

  it('should handle join server successfully', async () => {
    const user = userEvent.setup();
    mockDiscoveryService.joinServer.mockResolvedValue({ success: true });

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const joinButton = screen.getByText('Join Test Server');
    await act(async () => {
      await user.click(joinButton);
    });

    expect(mockDiscoveryService.joinServer).toHaveBeenCalledWith('!test:example.com');

    await waitFor(() => {
      expect(screen.getByText('✓ Successfully joined Test Server!')).toBeInTheDocument();
    });

    // Should auto-close after successful join
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should handle join server error', async () => {
    const user = userEvent.setup();
    mockDiscoveryService.joinServer.mockResolvedValue({
      success: false,
      error: 'You are not allowed to join this room'
    });

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const joinButton = screen.getByText('Join Test Server');
    await user.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('✗ You are not allowed to join this room')).toBeInTheDocument();
    });
  });

  it('should show loading state during join', async () => {
    const user = userEvent.setup();
    mockDiscoveryService.joinServer.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    const joinButton = screen.getByText('Join Test Server');
    await user.click(joinButton);

    expect(screen.getByText('Joining...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('✓ Successfully joined Test Server!')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close preview');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when clicking overlay', async () => {
    const user = userEvent.setup();
    
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    const overlay = screen.getByText('Server Preview').closest('.server-preview-overlay');
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should handle preview loading error', async () => {
    mockDiscoveryService.getServerPreview.mockResolvedValue(null);

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load server details')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('should retry loading when retry button is clicked', async () => {
    const user = userEvent.setup();
    mockDiscoveryService.getServerPreview
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockServerData);

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Try Again');
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });

    expect(mockDiscoveryService.getServerPreview).toHaveBeenCalledTimes(2);
  });

  it('should format large member counts correctly', async () => {
    const serverWithManyMembers = { ...mockServerData, memberCount: 1500 };
    mockDiscoveryService.getServerPreview.mockResolvedValue(serverWithManyMembers);

    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('👥 1.5k members')).toBeInTheDocument();
    });
  });

  it('should show room metadata', async () => {
    render(
      <ServerPreview
        roomId="!test:example.com"
        discoveryService={mockDiscoveryService}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Room ID:')).toBeInTheDocument();
      expect(screen.getByText('!test:example.com')).toBeInTheDocument();
      expect(screen.getByText('Address:')).toBeInTheDocument();
      expect(screen.getAllByText('#test:example.com')).toHaveLength(2); // Appears in alias and metadata
    });
  });
});
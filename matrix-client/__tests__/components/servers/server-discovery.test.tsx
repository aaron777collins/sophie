import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerDiscovery } from '../../../components/servers/server-discovery';
import { ServerDiscoveryService } from '../../../lib/matrix/server-discovery';

// Mock the matrix context
const mockMatrixClient = {};
jest.mock('../../../lib/matrix/matrix-context', () => ({
  useMatrixClient: () => mockMatrixClient
}));

// Mock the ServerDiscoveryService
jest.mock('../../../lib/matrix/server-discovery');
const MockedServerDiscoveryService = ServerDiscoveryService as jest.MockedClass<typeof ServerDiscoveryService>;

// Mock the ServerPreview component
jest.mock('../../../components/servers/server-preview', () => ({
  ServerPreview: ({ roomId, onClose }: { roomId: string; onClose: () => void }) => (
    <div data-testid="server-preview">
      <p>Preview for {roomId}</p>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe('ServerDiscovery', () => {
  let mockDiscoveryService: jest.Mocked<ServerDiscoveryService>;

  const mockSearchResults = {
    servers: [
      {
        roomId: '!room1:example.com',
        name: 'Gaming Community',
        topic: 'A place for gamers to chat',
        memberCount: 150,
        canonicalAlias: '#gaming:example.com',
        avatarUrl: 'mxc://example.com/avatar1'
      },
      {
        roomId: '!room2:example.com',
        name: 'Tech Talk',
        topic: 'Discussion about programming',
        memberCount: 300,
        canonicalAlias: '#tech:example.com'
      }
    ],
    totalCount: 2,
    page: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false
  };

  beforeEach(() => {
    mockDiscoveryService = {
      searchServers: jest.fn(),
      getServerPreview: jest.fn(),
      joinServer: jest.fn()
    } as any;

    MockedServerDiscoveryService.mockImplementation(() => mockDiscoveryService);
    mockDiscoveryService.searchServers.mockResolvedValue(mockSearchResults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render search interface', async () => {
    render(<ServerDiscovery />);

    expect(screen.getByText('Explore Servers')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search servers by name, topic, or alias...')).toBeInTheDocument();
    expect(screen.getByText('All Topics')).toBeInTheDocument();
    expect(screen.getByText('All Languages')).toBeInTheDocument();
  });

  it('should load initial search results', async () => {
    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
      expect(screen.getByText('Tech Talk')).toBeInTheDocument();
    });

    expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith({
      searchTerm: undefined,
      topic: undefined,
      language: undefined,
      minMemberCount: undefined,
      maxMemberCount: undefined,
      sortBy: 'members',
      sortDirection: 'desc',
      page: 1,
      limit: 20
    });
  });

  it('should perform search when search button is clicked', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByText('Search')).toBeInTheDocument();
    }, { timeout: 3000 });

    const searchInput = screen.getByPlaceholderText('Search servers by name, topic, or alias...');
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'gaming');
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'gaming'
        })
      );
    });
  });

  it('should search when Enter is pressed in search input', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    const searchInput = screen.getByPlaceholderText('Search servers by name, topic, or alias...');
    await user.type(searchInput, 'programming');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'programming'
        })
      );
    });
  });

  it('should apply filters correctly', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    // Set topic filter
    const topicSelect = screen.getByDisplayValue('All Topics');
    await user.selectOptions(topicSelect, 'gaming');

    // Set language filter
    const languageSelect = screen.getByDisplayValue('All Languages');
    await user.selectOptions(languageSelect, 'english');

    // Set member count filter
    const minMembersInput = screen.getByPlaceholderText('Min members');
    await user.type(minMembersInput, '100');

    // Search
    const searchButton = screen.getByText('Search');
    await user.click(searchButton);

    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'gaming',
          language: 'english',
          minMemberCount: 100
        })
      );
    });
  });

  it('should handle sorting', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    // Wait for initial load and Search button to be ready
    await waitFor(() => {
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    // Clear the mock to start fresh
    mockDiscoveryService.searchServers.mockClear();

    // Click name sort button
    const nameSortButton = screen.getByText('Name');
    await user.click(nameSortButton);

    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'desc'
        })
      );
    });

    // Click again to reverse sort direction
    await user.click(nameSortButton);

    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'asc'
        })
      );
    });
  });

  it('should clear filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    // Wait for initial load and set some filters
    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search servers by name, topic, or alias...');
    await user.type(searchInput, 'test');

    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('should display server cards correctly', async () => {
    render(<ServerDiscovery />);

    await waitFor(() => {
      // Check first server card
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
      expect(screen.getByText('A place for gamers to chat')).toBeInTheDocument();
      expect(screen.getByText('150 members')).toBeInTheDocument();
      expect(screen.getByText('#gaming:example.com')).toBeInTheDocument();

      // Check second server card
      expect(screen.getByText('Tech Talk')).toBeInTheDocument();
      expect(screen.getByText('Discussion about programming')).toBeInTheDocument();
      expect(screen.getByText('300 members')).toBeInTheDocument();
    });
  });

  it('should open server preview when preview button is clicked', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    const previewButtons = screen.getAllByText('Preview');
    await user.click(previewButtons[0]);

    expect(screen.getByTestId('server-preview')).toBeInTheDocument();
    expect(screen.getByText('Preview for !room1:example.com')).toBeInTheDocument();
  });

  it('should close server preview when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    // Open preview
    const previewButtons = screen.getAllByText('Preview');
    await user.click(previewButtons[0]);

    expect(screen.getByTestId('server-preview')).toBeInTheDocument();

    // Close preview
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(screen.queryByTestId('server-preview')).not.toBeInTheDocument();
  });

  it('should handle join server action', async () => {
    const user = userEvent.setup();
    mockDiscoveryService.joinServer.mockResolvedValue({ success: true });

    // Mock window.alert
    window.alert = jest.fn();

    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    const joinButtons = screen.getAllByText('Join');
    await user.click(joinButtons[0]);

    await waitFor(() => {
      expect(mockDiscoveryService.joinServer).toHaveBeenCalledWith('!room1:example.com');
      expect(window.alert).toHaveBeenCalledWith('Successfully joined Gaming Community!');
    });
  });

  it('should handle join server error', async () => {
    const user = userEvent.setup();
    mockDiscoveryService.joinServer.mockResolvedValue({
      success: false,
      error: 'Room not found'
    });

    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    const joinButtons = screen.getAllByText('Join');
    await user.click(joinButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Room not found')).toBeInTheDocument();
    });
  });

  it('should show loading state during search', async () => {
    mockDiscoveryService.searchServers.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSearchResults), 100))
    );

    render(<ServerDiscovery />);

    expect(screen.getByText('Loading servers...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading servers...')).not.toBeInTheDocument();
  });

  it('should show no results message when no servers found', async () => {
    mockDiscoveryService.searchServers.mockResolvedValue({
      servers: [],
      totalCount: 0,
      page: 1,
      limit: 20,
      hasNext: false,
      hasPrevious: false
    });

    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('No servers found matching your criteria.')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or search terms.')).toBeInTheDocument();
    });
  });

  it('should show error message when search fails', async () => {
    mockDiscoveryService.searchServers.mockRejectedValue(new Error('Network error'));

    render(<ServerDiscovery />);

    await waitFor(() => {
      expect(screen.getByText('Failed to search servers. Please try again.')).toBeInTheDocument();
    });
  });
});
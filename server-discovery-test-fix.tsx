// Fixed version of the failing server-discovery test
// Key changes: act() wrappers, better loading state handling, data-testid usage

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerDiscovery } from '../../../components/servers/server-discovery';
import { ServerDiscoveryService } from '../../../lib/matrix/server-discovery';

// Mock implementations remain the same...
jest.mock('../../../lib/matrix/matrix-context', () => ({
  useMatrixClient: () => ({})
}));

jest.mock('../../../lib/matrix/server-discovery');
const MockedServerDiscoveryService = ServerDiscoveryService as jest.MockedClass<typeof ServerDiscoveryService>;

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

  // FIXED: Handle loading state properly in search button test
  it('should perform search when search button is clicked', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<ServerDiscovery />);
    });

    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading servers...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search servers by name, topic, or alias...');
    
    // Wait for search button to be in ready state
    await waitFor(() => {
      const searchButton = screen.queryByText('Search');
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).not.toBeDisabled();
    });

    const searchButton = screen.getByText('Search');

    await act(async () => {
      await user.type(searchInput, 'gaming');
    });

    await act(async () => {
      await user.click(searchButton);
    });

    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'gaming'
        })
      );
    }, { timeout: 3000 });
  });

  // FIXED: Better handling of sort functionality
  it('should handle sorting', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<ServerDiscovery />);
    });

    // Wait for initial results to load
    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    const nameButton = screen.getByRole('button', { name: /Name/i });
    
    await act(async () => {
      await user.click(nameButton);
    });

    // Wait for the search service to be called with correct parameters
    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sortBy: 'name',
          sortDirection: 'desc'
        })
      );
    }, { timeout: 3000 });
  });

  // FIXED: Proper loading state handling for initial render
  it('should load initial search results', async () => {
    await act(async () => {
      render(<ServerDiscovery />);
    });

    // First, verify loading state
    expect(screen.getByText('Loading servers...')).toBeInTheDocument();

    // Then wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
      expect(screen.getByText('Tech Talk')).toBeInTheDocument();
    });

    // Verify the search service was called with default parameters
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

  // FIXED: Better filter handling with act() wrappers
  it('should apply filters correctly', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<ServerDiscovery />);
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    // Apply filters with proper act() wrapping
    const topicSelect = screen.getByDisplayValue('All Topics');
    await act(async () => {
      await user.selectOptions(topicSelect, 'gaming');
    });

    const languageSelect = screen.getByDisplayValue('All Languages');
    await act(async () => {
      await user.selectOptions(languageSelect, 'english');
    });

    const minMemberInput = screen.getByPlaceholderText('Min members');
    await act(async () => {
      await user.type(minMemberInput, '100');
    });

    // Wait for debounced search to trigger
    await waitFor(() => {
      expect(mockDiscoveryService.searchServers).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'gaming',
          language: 'english',
          minMemberCount: 100
        })
      );
    }, { timeout: 3000 });
  });

  // FIXED: Clear filters with act() wrapper
  it('should clear filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<ServerDiscovery />);
    });

    // Wait for component to stabilize
    await waitFor(() => {
      expect(screen.getByText('Gaming Community')).toBeInTheDocument();
    });

    // Set some filters first
    const topicSelect = screen.getByDisplayValue('All Topics');
    await act(async () => {
      await user.selectOptions(topicSelect, 'gaming');
    });

    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    await act(async () => {
      await user.click(clearButton);
    });

    // Verify filters are cleared
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Topics')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Languages')).toBeInTheDocument();
    });
  });

  // Additional tests would follow similar pattern...
});
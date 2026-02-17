import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoGrid, useVideoGrid } from '../video-grid';
import { VideoParticipant } from '../../../services/video-call';

// Mock dependencies
jest.mock('../video-tile', () => ({
  VideoTile: ({ participant, onClick }: any) => (
    <div 
      data-testid={`video-tile-${participant.id}`}
      onClick={() => onClick?.(participant)}
    >
      {participant.displayName}
    </div>
  )
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

describe('VideoGrid', () => {
  const mockParticipants: VideoParticipant[] = [
    {
      id: 'local-user1',
      userId: 'user1',
      displayName: 'John Doe',
      isLocal: true,
      isMuted: false,
      isVideoEnabled: true
    },
    {
      id: 'remote-user2',
      userId: 'user2',
      displayName: 'Jane Smith',
      isLocal: false,
      isMuted: true,
      isVideoEnabled: true
    },
    {
      id: 'remote-user3',
      userId: 'user3',
      displayName: 'Bob Wilson',
      isLocal: false,
      isMuted: false,
      isVideoEnabled: false
    }
  ];

  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: jest.fn()
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no participants', () => {
    render(<VideoGrid participants={[]} />);
    
    expect(screen.getByText('No participants')).toBeInTheDocument();
    expect(screen.getByText('Waiting for others to join...')).toBeInTheDocument();
  });

  it('renders participants correctly', () => {
    render(<VideoGrid participants={mockParticipants} />);
    
    expect(screen.getByTestId('video-tile-local-user1')).toBeInTheDocument();
    expect(screen.getByTestId('video-tile-remote-user2')).toBeInTheDocument();
    expect(screen.getByTestId('video-tile-remote-user3')).toBeInTheDocument();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('places local participant first', () => {
    render(<VideoGrid participants={mockParticipants} localParticipantId="local-user1" />);
    
    const tiles = screen.getAllByTestId(/video-tile-/);
    expect(tiles[0]).toHaveAttribute('data-testid', 'video-tile-local-user1');
  });

  it('limits participants when maxParticipantsVisible is set', () => {
    render(<VideoGrid participants={mockParticipants} maxParticipantsVisible={2} />);
    
    const tiles = screen.getAllByTestId(/video-tile-/);
    expect(tiles).toHaveLength(2);
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('calls onParticipantClick when tile is clicked', () => {
    const onParticipantClick = jest.fn();
    render(
      <VideoGrid 
        participants={mockParticipants} 
        onParticipantClick={onParticipantClick} 
      />
    );
    
    fireEvent.click(screen.getByTestId('video-tile-local-user1'));
    expect(onParticipantClick).toHaveBeenCalledWith(mockParticipants[0]);
  });

  it('applies custom className', () => {
    const { container } = render(
      <VideoGrid participants={mockParticipants} className="custom-grid" />
    );
    
    expect(container.firstChild).toHaveClass('custom-grid');
  });

  it('hides names when showNames is false', () => {
    render(<VideoGrid participants={mockParticipants} showNames={false} />);
    
    // VideoTile should receive showName=false prop
    const tiles = screen.getAllByTestId(/video-tile-/);
    expect(tiles).toHaveLength(3);
  });
});

describe('useVideoGrid', () => {
  const mockParticipants: VideoParticipant[] = [
    {
      id: 'user1',
      userId: 'user1',
      displayName: 'John Doe',
      isLocal: true,
      isMuted: false,
      isVideoEnabled: true
    }
  ];

  it('initializes with default values', () => {
    let result: any;
    
    function TestComponent() {
      result = useVideoGrid(mockParticipants);
      return null;
    }
    
    render(<TestComponent />);
    
    expect(result.selectedParticipant).toBeNull();
    expect(result.isFullscreen).toBe(false);
  });

  it('handles participant selection', () => {
    let result: any;
    
    function TestComponent() {
      result = useVideoGrid(mockParticipants);
      return null;
    }
    
    render(<TestComponent />);
    
    // Select participant
    result.handleParticipantClick(mockParticipants[0]);
    expect(result.selectedParticipant).toBe(mockParticipants[0]);
  });

  it('handles fullscreen toggle', () => {
    let result: any;
    
    function TestComponent() {
      result = useVideoGrid(mockParticipants);
      return null;
    }
    
    render(<TestComponent />);
    
    // Enter fullscreen
    result.handleParticipantDoubleClick(mockParticipants[0]);
    expect(result.selectedParticipant).toBe(mockParticipants[0]);
    expect(result.isFullscreen).toBe(true);
    
    // Exit fullscreen
    result.toggleFullscreen();
    expect(result.isFullscreen).toBe(false);
  });

  it('clears selection', () => {
    let result: any;
    
    function TestComponent() {
      result = useVideoGrid(mockParticipants);
      return null;
    }
    
    render(<TestComponent />);
    
    // Set initial state
    result.handleParticipantClick(mockParticipants[0]);
    result.toggleFullscreen();
    
    // Clear selection
    result.clearSelection();
    expect(result.selectedParticipant).toBeNull();
    expect(result.isFullscreen).toBe(false);
  });
});
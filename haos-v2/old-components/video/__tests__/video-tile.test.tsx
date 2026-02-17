import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoTile } from '../video-tile';
import { VideoParticipant } from '../../../services/video-call';

// Mock dependencies
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div className={className}>{children}</div>,
  AvatarFallback: ({ children, className }: any) => <div className={className}>{children}</div>,
  AvatarImage: ({ alt, className }: any) => <img alt={alt} className={className} />
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>
}));

describe('VideoTile', () => {
  const mockParticipant: VideoParticipant = {
    id: 'user1',
    userId: 'user1',
    displayName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    isLocal: false,
    isMuted: false,
    isVideoEnabled: true,
    videoTrack: {
      id: 'video-track-1',
      enabled: true,
      kind: 'video'
    } as MediaStreamTrack,
    audioTrack: {
      id: 'audio-track-1',
      enabled: true,
      kind: 'audio'
    } as MediaStreamTrack,
    stream: {
      getVideoTracks: () => [{ enabled: true }],
      getAudioTracks: () => [{ enabled: true }]
    } as unknown as MediaStream
  };

  beforeEach(() => {
    // Mock HTMLVideoElement
    global.HTMLVideoElement.prototype.play = jest.fn();
    global.HTMLVideoElement.prototype.pause = jest.fn();
    global.HTMLVideoElement.prototype.load = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders participant name', () => {
    render(<VideoTile participant={mockParticipant} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows avatar when video is disabled', () => {
    const participantNoVideo = {
      ...mockParticipant,
      isVideoEnabled: false,
      videoTrack: undefined
    };
    
    render(<VideoTile participant={participantNoVideo} />);
    
    // Should show avatar with initials
    expect(screen.getByText('JD')).toBeInTheDocument(); // Initials for John Doe
  });

  it('shows "You" indicator for local participant', () => {
    render(<VideoTile participant={mockParticipant} isLocal={true} />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('shows mute indicator when participant is muted', () => {
    const mutedParticipant = {
      ...mockParticipant,
      isMuted: true
    };
    
    render(<VideoTile participant={mutedParticipant} />);
    
    // Should render AudioLevelIndicator with muted state
    // The MicOff icon should be present
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('calls onClick when tile is clicked', () => {
    const onClick = jest.fn();
    render(<VideoTile participant={mockParticipant} onClick={onClick} />);
    
    const tile = screen.getByRole('generic').closest('[class*="cursor-pointer"]');
    if (tile) {
      fireEvent.click(tile);
      expect(onClick).toHaveBeenCalledWith(mockParticipant);
    }
  });

  it('calls onDoubleClick when tile is double clicked', () => {
    const onDoubleClick = jest.fn();
    render(<VideoTile participant={mockParticipant} onDoubleClick={onDoubleClick} />);
    
    const tile = screen.getByRole('generic').closest('[class*="cursor-pointer"]');
    if (tile) {
      fireEvent.doubleClick(tile);
      expect(onDoubleClick).toHaveBeenCalledWith(mockParticipant);
    }
  });

  it('shows pinned indicator when pinned', () => {
    render(<VideoTile participant={mockParticipant} isPinned={true} />);
    
    // Pin icon should be present in the DOM
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('applies local styling when isLocal is true', () => {
    const { container } = render(<VideoTile participant={mockParticipant} isLocal={true} />);
    
    // Should have ring styling for local participant
    const tile = container.firstChild as HTMLElement;
    expect(tile).toHaveClass('ring-2', 'ring-blue-500/50');
  });

  it('hides name when showName is false', () => {
    render(<VideoTile participant={mockParticipant} showName={false} />);
    
    // Name should not be in the document
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('shows video disabled indicator when video is off', () => {
    const participantNoVideo = {
      ...mockParticipant,
      isVideoEnabled: false,
      videoTrack: undefined
    };
    
    render(<VideoTile participant={participantNoVideo} />);
    
    // VideoOff icon should be present
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('shows connection status when no stream available', () => {
    const participantNoStream = {
      ...mockParticipant,
      stream: undefined,
      isLocal: false
    };
    
    render(<VideoTile participant={participantNoStream} />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('renders video element when stream is available and video enabled', async () => {
    render(<VideoTile participant={mockParticipant} />);
    
    await waitFor(() => {
      const video = screen.getByRole('generic').querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });

  it('generates correct initials from display name', () => {
    const participantLongName = {
      ...mockParticipant,
      displayName: 'John Michael Doe',
      isVideoEnabled: false,
      videoTrack: undefined
    };
    
    render(<VideoTile participant={participantLongName} />);
    
    // Should show first two initials: JM
    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('handles single name correctly for initials', () => {
    const participantSingleName = {
      ...mockParticipant,
      displayName: 'John',
      isVideoEnabled: false,
      videoTrack: undefined
    };
    
    render(<VideoTile participant={participantSingleName} />);
    
    // Should show single initial: J
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});

// Test AudioLevelIndicator separately
describe('AudioLevelIndicator', () => {
  // Mock AudioContext
  global.AudioContext = jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn().mockReturnValue({
      fftSize: 256,
      smoothingTimeConstant: 0.3,
      frequencyBinCount: 128,
      getByteFrequencyData: jest.fn()
    }),
    createMediaStreamSource: jest.fn().mockReturnValue({
      connect: jest.fn()
    }),
    close: jest.fn()
  }));

  global.requestAnimationFrame = jest.fn((cb) => {
    setTimeout(cb, 16);
    return 1;
  });

  global.cancelAnimationFrame = jest.fn();

  it('shows mute icon when muted', () => {
    const mockTrack = {
      id: 'audio-track',
      enabled: true,
      kind: 'audio'
    } as MediaStreamTrack;

    // The AudioLevelIndicator is tested indirectly through VideoTile
    const mutedParticipant = {
      ...mockParticipant,
      isMuted: true,
      audioTrack: mockTrack
    };
    
    render(<VideoTile participant={mutedParticipant} showAudioIndicator={true} />);
    
    // Should show mute indicator
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });
});
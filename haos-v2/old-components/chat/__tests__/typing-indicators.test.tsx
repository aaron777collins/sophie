import React from 'react';
import { render, screen } from '@testing-library/react';
import { TypingIndicators } from '../typing-indicators';
import { useRoom } from '../../../hooks/use-room';
import { useUserSettings } from '../../../hooks/use-user-settings';

// Mock the hooks
jest.mock('../../../hooks/use-room', () => ({
  useRoom: jest.fn()
}));

jest.mock('../../../hooks/use-user-settings', () => ({
  useUserSettings: jest.fn()
}));

describe('TypingIndicators', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders nothing when no users are typing', () => {
    (useRoom as jest.Mock).mockReturnValue({ 
      typingUsers: [] 
    });
    (useUserSettings as jest.Mock).mockReturnValue({ 
      showTypingIndicators: true 
    });

    const { container } = render(<TypingIndicators roomId="test-room" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders typing users when typing indicators are enabled', () => {
    const mockTypingUsers = [
      { 
        userId: 'user1', 
        displayName: 'Alice', 
        avatarUrl: 'https://example.com/avatar1.png' 
      },
      { 
        userId: 'user2', 
        displayName: 'Bob', 
        avatarUrl: 'https://example.com/avatar2.png' 
      }
    ];

    (useRoom as jest.Mock).mockReturnValue({ 
      typingUsers: mockTypingUsers 
    });
    (useUserSettings as jest.Mock).mockReturnValue({ 
      showTypingIndicators: true 
    });

    render(<TypingIndicators roomId="test-room" />);
    
    // Check that user names are rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('are typing...')).toBeInTheDocument();
  });

  it('does not render when typing indicators are disabled', () => {
    const mockTypingUsers = [
      { 
        userId: 'user1', 
        displayName: 'Alice', 
        avatarUrl: 'https://example.com/avatar1.png' 
      }
    ];

    (useRoom as jest.Mock).mockReturnValue({ 
      typingUsers: mockTypingUsers 
    });
    (useUserSettings as jest.Mock).mockReturnValue({ 
      showTypingIndicators: false 
    });

    const { container } = render(<TypingIndicators roomId="test-room" />);
    expect(container.firstChild).toBeNull();
  });

  it('limits typing users to 3', () => {
    const mockTypingUsers = [
      { userId: 'user1', displayName: 'Alice', avatarUrl: 'avatar1.png' },
      { userId: 'user2', displayName: 'Bob', avatarUrl: 'avatar2.png' },
      { userId: 'user3', displayName: 'Charlie', avatarUrl: 'avatar3.png' },
      { userId: 'user4', displayName: 'David', avatarUrl: 'avatar4.png' }
    ];

    (useRoom as jest.Mock).mockReturnValue({ 
      typingUsers: mockTypingUsers 
    });
    (useUserSettings as jest.Mock).mockReturnValue({ 
      showTypingIndicators: true 
    });

    render(<TypingIndicators roomId="test-room" />);
    
    // Check that only first 3 users are rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('David')).not.toBeInTheDocument();
  });
});
/**
 * Unit tests for NavigationSidebar component
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { NavigationSidebarClient } from '@/components/navigation/navigation-sidebar';
import { MatrixSession } from '@/lib/matrix/auth';
import { getMatrixProfile } from '@/lib/matrix/profile';

// Mock the Matrix profile functions
jest.mock('@/lib/matrix/profile', () => ({
  getMatrixProfile: jest.fn(),
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  redirect: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, ...props }: any) {
    return <img src={src} alt={alt} data-fill={fill} {...props} />;
  };
});

// Mock child components
jest.mock('@/components/navigation/navigation-action', () => ({
  NavigationAction: () => <div data-testid="navigation-action">NavigationAction</div>,
}));

jest.mock('@/components/navigation/navigation-item', () => ({
  NavigationItem: ({ name, id }: any) => (
    <div data-testid={`navigation-item-${id}`}>NavigationItem: {name}</div>
  ),
}));

const mockGetMatrixProfile = getMatrixProfile as jest.MockedFunction<typeof getMatrixProfile>;

describe('NavigationSidebarClient', () => {
  const mockSession: MatrixSession = {
    accessToken: 'test-token',
    userId: '@testuser:example.com',
    deviceId: 'test-device',
    homeserverUrl: 'https://example.com',
    displayName: 'Test User',
  };

  const mockProfile = {
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMatrixProfile.mockResolvedValue(mockProfile);
  });

  it('renders loading state initially', () => {
    act(() => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the main sidebar structure after loading', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check for main structure
    expect(screen.getByTestId('navigation-action')).toBeInTheDocument();
    
    // Check for theme toggle (emoji)
    const themeButton = screen.getByText('🌙').closest('button');
    expect(themeButton).toBeInTheDocument();
    
    // Check for user button (with avatar)
    const userButton = screen.getByAltText('Test User').closest('button');
    expect(userButton).toBeInTheDocument();
  });

  it('has correct CSS classes and structure', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const mainContainer = screen.getByTestId('navigation-action').closest('.space-y-4');
    expect(mainContainer).toHaveClass(
      'space-y-4',
      'flex',
      'flex-col',
      'h-full',
      'items-center',
      'text-primary',
      'w-full',
      'dark:bg-[#1e1f22]',
      'bg-[#e3e5e8]',
      'py-3'
    );
  });

  it('renders separator with correct styling', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const separator = document.querySelector('.h-\\[2px\\].bg-zinc-300.dark\\:bg-zinc-700.rounded-md.w-10.mx-auto');
    expect(separator).toBeInTheDocument();
  });

  it('renders scroll area for servers', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const scrollArea = document.querySelector('.overflow-auto.flex-1.w-full');
    expect(scrollArea).toBeInTheDocument();
  });

  it('renders user button with correct styling', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const userButton = document.querySelector('.h-\\[48px\\].w-\\[48px\\].rounded-full.bg-primary');
    expect(userButton).toBeInTheDocument();
  });

  it('displays user initials when no avatar', async () => {
    const profileWithoutAvatar = { ...mockProfile, avatarUrl: undefined };
    mockGetMatrixProfile.mockResolvedValue(profileWithoutAvatar);
    
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('TE')).toBeInTheDocument(); // "Test User" initials
  });

  it('displays avatar image when available', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('handles profile loading error gracefully', async () => {
    mockGetMatrixProfile.mockRejectedValue(new Error('Profile load failed'));
    
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Should still render the basic structure
    expect(screen.getByTestId('navigation-action')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('renders theme toggle button with correct styling', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const themeButton = document.querySelector('.h-\\[48px\\].w-\\[48px\\].rounded-\\[24px\\]');
    expect(themeButton).toBeInTheDocument();
    expect(themeButton).toHaveClass('hover:rounded-[16px]', 'transition-all');
  });

  it('has correct bottom section layout', async () => {
    await act(async () => {
      render(<NavigationSidebarClient session={mockSession} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const bottomSection = document.querySelector('.pb-3.mt-auto.flex.items-center.flex-col.gap-y-4');
    expect(bottomSection).toBeInTheDocument();
  });
});
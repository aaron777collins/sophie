/**
 * Unit tests for NavigationItem component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams, useRouter } from 'next/navigation';

import { NavigationItem } from '@/components/navigation/navigation-item';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, ...props }: any) {
    return <img src={src} alt={alt} data-fill={fill} {...props} />;
  };
});

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe('NavigationItem', () => {
  const mockProps = {
    id: 'test-server-1',
    imageUrl: '/test-server-image.png',
    name: 'Test Server',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    });
    mockUseParams.mockReturnValue({});
  });

  it('renders without crashing', () => {
    render(<NavigationItem {...mockProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('displays the server image with correct props', () => {
    render(<NavigationItem {...mockProps} />);
    
    const image = screen.getByAltText('Channel');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-server-image.png');
    expect(image).toHaveAttribute('data-fill', 'true');
  });

  it('shows tooltip with server name on hover', () => {
    render(<NavigationItem {...mockProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    
    expect(screen.getByText('Test Server')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', () => {
    render(<NavigationItem {...mockProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(screen.getByText('Test Server')).toBeInTheDocument();
    
    fireEvent.mouseLeave(button);
    expect(screen.queryByText('Test Server')).not.toBeInTheDocument();
  });

  it('navigates to correct server route when clicked', () => {
    render(<NavigationItem {...mockProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/servers/test-server-1');
  });

  it('has correct styling for inactive state', () => {
    mockUseParams.mockReturnValue({ serverId: 'other-server' });
    
    render(<NavigationItem {...mockProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('group', 'relative', 'flex', 'items-center');
    
    // Check indicator bar for inactive state
    const indicator = button.querySelector('.absolute.left-0');
    expect(indicator).toHaveClass('h-[8px]', 'group-hover:h-[20px]');
    expect(indicator).not.toHaveClass('h-[36px]');
  });

  it('has correct styling for active state', () => {
    mockUseParams.mockReturnValue({ serverId: 'test-server-1' });
    
    render(<NavigationItem {...mockProps} />);
    
    const button = screen.getByRole('button');
    
    // Check indicator bar for active state
    const indicator = button.querySelector('.absolute.left-0');
    expect(indicator).toHaveClass('h-[36px]');
    expect(indicator).not.toHaveClass('h-[8px]');
    
    // Check server icon container for active state
    const iconContainer = button.querySelector('.relative.group.flex');
    expect(iconContainer).toHaveClass('bg-primary/10', 'text-primary', 'rounded-[16px]');
  });

  it('has hover effects', () => {
    render(<NavigationItem {...mockProps} />);
    
    const iconContainer = screen.getByRole('button').querySelector('.relative.group.flex');
    expect(iconContainer).toHaveClass('group-hover:rounded-[16px]');
  });

  it('has correct dimensions and styling', () => {
    render(<NavigationItem {...mockProps} />);
    
    const iconContainer = screen.getByRole('button').querySelector('.relative.group.flex');
    expect(iconContainer).toHaveClass(
      'mx-3',
      'h-[48px]',
      'w-[48px]',
      'rounded-[24px]',
      'transition-all',
      'overflow-hidden'
    );
  });
});
/**
 * Unit tests for NavigationAction component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { NavigationAction } from '@/components/navigation/navigation-action';

// Mock console.log for the onClick handler
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('NavigationAction', () => {
  beforeEach(() => {
    consoleLogSpy.mockClear();
  });
  
  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('renders without crashing', () => {
    render(<NavigationAction />);
    
    // Check if the button exists
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('displays the plus icon', () => {
    render(<NavigationAction />);
    
    // Check if the Plus icon is rendered (lucide-react renders as svg)
    const plusIcon = screen.getByRole('button').querySelector('svg');
    expect(plusIcon).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(<NavigationAction />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    
    // Check if tooltip appears
    expect(screen.getByText('Add a server')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', async () => {
    render(<NavigationAction />);
    
    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    expect(screen.getByText('Add a server')).toBeInTheDocument();
    
    fireEvent.mouseLeave(button);
    expect(screen.queryByText('Add a server')).not.toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<NavigationAction />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('group', 'flex', 'items-center');
    
    const iconContainer = button.querySelector('div');
    expect(iconContainer).toHaveClass(
      'flex',
      'mx-3',
      'h-[48px]',
      'w-[48px]',
      'rounded-[24px]',
      'group-hover:rounded-[16px]',
      'transition-all',
      'overflow-hidden',
      'items-center',
      'justify-center'
    );
  });

  it('has hover effects on icon and container', () => {
    render(<NavigationAction />);
    
    const iconContainer = screen.getByRole('button').querySelector('div');
    expect(iconContainer).toHaveClass('group-hover:bg-emerald-500');
    
    const icon = iconContainer?.querySelector('svg');
    expect(icon).toHaveClass('group-hover:text-white', 'text-emerald-500');
  });
});
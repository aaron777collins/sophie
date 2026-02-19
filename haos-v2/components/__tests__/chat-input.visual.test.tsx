import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInput } from '../chat-input';

// Mock the hooks
jest.mock('@/hooks/use-matrix-messaging', () => ({
  useMatrixMessaging: () => ({
    sendMessage: jest.fn(),
    sendFormattedMessage: jest.fn(),
    sendReaction: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    type: null,
    data: {},
    isOpen: false,
    onOpen: jest.fn(),
    onClose: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock the EmojiPicker component
jest.mock('@/components/emoji-picker', () => ({
  EmojiPicker: ({ onChange }: { onChange: (emoji: string) => void }) => (
    <button
      data-testid="emoji-picker"
      onClick={() => onChange('😀')}
      type="button"
    >
      <svg className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
        Emoji
      </svg>
    </button>
  ),
}));

describe('ChatInput Visual Identity', () => {
  const defaultProps = {
    client: {} as any,
    roomId: 'test-room-id',
    name: 'general',
    type: 'channel' as const,
  };

  describe('Container Structure and Classes', () => {
    it('has correct container structure matching discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      // Verify main container structure
      const formElement = container.querySelector('form');
      expect(formElement).toBeInTheDocument();

      const relativeContainer = container.querySelector('.relative.p-4.pb-6');
      expect(relativeContainer).toBeInTheDocument();
    });

    it('input field has exact styling classes from discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('px-14');
      expect(input).toHaveClass('py-6');
      expect(input).toHaveClass('bg-zinc-200/90');
      expect(input).toHaveClass('dark:bg-zinc-700/75');
      expect(input).toHaveClass('border-none');
      expect(input).toHaveClass('border-0');
      expect(input).toHaveClass('focus-visible:ring-0');
      expect(input).toHaveClass('focus-visible:ring-offset-0');
      expect(input).toHaveClass('text-zinc-600');
      expect(input).toHaveClass('dark:text-zinc-200');
    });

    it('plus button has exact styling classes from discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const plusButton = container.querySelector('button[aria-label="Attach file"]');
      expect(plusButton).toHaveClass('absolute');
      expect(plusButton).toHaveClass('top-7');
      expect(plusButton).toHaveClass('left-8');
      expect(plusButton).toHaveClass('h-[24px]');
      expect(plusButton).toHaveClass('w-[24px]');
      expect(plusButton).toHaveClass('bg-zinc-500');
      expect(plusButton).toHaveClass('dark:bg-zinc-400');
      expect(plusButton).toHaveClass('hover:bg-zinc-600');
      expect(plusButton).toHaveClass('dark:hover:bg-zinc-300');
      expect(plusButton).toHaveClass('transition');
      expect(plusButton).toHaveClass('rounded-full');
      expect(plusButton).toHaveClass('p-1');
      expect(plusButton).toHaveClass('flex');
      expect(plusButton).toHaveClass('items-center');
      expect(plusButton).toHaveClass('justify-center');
    });

    it('plus icon has exact styling classes from discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const plusIcon = container.querySelector('svg.lucide-plus');
      expect(plusIcon).toHaveClass('text-white');
      expect(plusIcon).toHaveClass('dark:text-[#313338]');
    });

    it('emoji picker container has exact positioning from discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const emojiContainer = container.querySelector('.absolute.top-7.right-8');
      expect(emojiContainer).toBeInTheDocument();
    });
  });

  describe('Pixel-Perfect Layout Verification', () => {
    it('verifies container has correct padding structure', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const paddingContainer = container.querySelector('.relative.p-4.pb-6');
      expect(paddingContainer).toBeInTheDocument();
    });

    it('verifies input positioning allows for button overlays', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const input = container.querySelector('input');
      // Input should have px-14 to make room for left/right buttons
      expect(input).toHaveClass('px-14');
      expect(input).toHaveClass('py-6');
    });

    it('verifies button positioning matches discord-clone exactly', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const plusButton = container.querySelector('.absolute.top-7.left-8');
      expect(plusButton).toBeInTheDocument();
      
      const emojiButton = container.querySelector('.absolute.top-7.right-8');
      expect(emojiButton).toBeInTheDocument();
    });
  });

  describe('Color Scheme Verification', () => {
    it('uses exact discord-clone color scheme for input', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const input = container.querySelector('input');
      // Light mode colors
      expect(input).toHaveClass('bg-zinc-200/90');
      expect(input).toHaveClass('text-zinc-600');
      
      // Dark mode colors (most important for Discord clone)
      expect(input).toHaveClass('dark:bg-zinc-700/75');
      expect(input).toHaveClass('dark:text-zinc-200');
    });

    it('uses exact discord-clone color scheme for plus button', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const plusButton = container.querySelector('button[aria-label="Attach file"]');
      // Light mode colors
      expect(plusButton).toHaveClass('bg-zinc-500');
      expect(plusButton).toHaveClass('hover:bg-zinc-600');
      
      // Dark mode colors
      expect(plusButton).toHaveClass('dark:bg-zinc-400');
      expect(plusButton).toHaveClass('dark:hover:bg-zinc-300');
      
      const plusIcon = plusButton?.querySelector('svg');
      expect(plusIcon).toHaveClass('text-white');
      expect(plusIcon).toHaveClass('dark:text-[#313338]');
    });
  });

  describe('Size and Dimensions Verification', () => {
    it('plus button has exact dimensions from discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const plusButton = container.querySelector('button[aria-label="Attach file"]');
      expect(plusButton).toHaveClass('h-[24px]');
      expect(plusButton).toHaveClass('w-[24px]');
    });

    it('input has correct vertical padding matching discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('py-6');
    });

    it('input has correct horizontal padding for button spacing', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('px-14');
    });
  });

  describe('Placeholder Text Verification', () => {
    it('displays correct placeholder format for channels', () => {
      const { container } = render(
        <ChatInput {...defaultProps} type="channel" name="general" />
      );
      
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('placeholder', 'Message #general');
    });

    it('displays correct placeholder format for conversations', () => {
      const { container } = render(
        <ChatInput {...defaultProps} type="conversation" name="john" />
      );
      
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('placeholder', 'Message john');
    });
  });

  describe('Error Display Styling', () => {
    it('does not show error styling when no error', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const errorDiv = container.querySelector('.text-red-500');
      expect(errorDiv).not.toBeInTheDocument();
    });
  });

  describe('Focus and Ring Styles', () => {
    it('has disabled focus rings matching discord-clone', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus-visible:ring-0');
      expect(input).toHaveClass('focus-visible:ring-offset-0');
    });
  });

  describe('Responsive Design', () => {
    it('maintains structure across different screen sizes', () => {
      const { container } = render(<ChatInput {...defaultProps} />);
      
      // The component should maintain its structure regardless of screen size
      const relativeContainer = container.querySelector('.relative.p-4.pb-6');
      const input = container.querySelector('input');
      const leftButton = container.querySelector('.absolute.top-7.left-8');
      const rightButton = container.querySelector('.absolute.top-7.right-8');
      
      expect(relativeContainer).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(leftButton).toBeInTheDocument();
      expect(rightButton).toBeInTheDocument();
    });
  });
});
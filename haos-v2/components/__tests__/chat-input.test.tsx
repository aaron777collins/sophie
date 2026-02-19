import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ChatInput } from '../chat-input';
import { useMatrixMessaging } from '@/hooks/use-matrix-messaging';
import { useModal } from '@/hooks/use-modal-store';

// Mock the hooks
jest.mock('@/hooks/use-matrix-messaging');
jest.mock('@/hooks/use-modal-store');
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
      Emoji
    </button>
  ),
}));

const mockUseMatrixMessaging = useMatrixMessaging as jest.MockedFunction<typeof useMatrixMessaging>;
const mockUseModal = useModal as jest.MockedFunction<typeof useModal>;

describe('ChatInput', () => {
  const defaultProps = {
    client: {} as any,
    roomId: 'test-room-id',
    name: 'general',
    type: 'channel' as const,
  };

  const mockSendMessage = jest.fn();
  const mockClearError = jest.fn();
  const mockOnOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMatrixMessaging.mockReturnValue({
      sendMessage: mockSendMessage,
      sendFormattedMessage: jest.fn(),
      sendReaction: jest.fn(),
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });

    mockUseModal.mockReturnValue({
      type: null,
      data: {},
      isOpen: false,
      onOpen: mockOnOpen,
      onClose: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('renders the chat input with correct placeholder for channel', () => {
      render(<ChatInput {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Message #general')).toBeInTheDocument();
    });

    it('renders the chat input with correct placeholder for conversation', () => {
      render(<ChatInput {...defaultProps} type="conversation" name="john" />);
      
      expect(screen.getByPlaceholderText('Message john')).toBeInTheDocument();
    });

    it('renders the plus button for file attachments', () => {
      render(<ChatInput {...defaultProps} />);
      
      const plusButton = screen.getByRole('button', { name: /attach file/i });
      expect(plusButton).toBeInTheDocument();
      expect(plusButton.querySelector('svg')).toHaveClass('lucide-plus');
    });

    it('renders the emoji picker button', () => {
      render(<ChatInput {...defaultProps} />);
      
      expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    it('allows typing in the input field', async () => {
      const user = userEvent.setup();
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      
      await user.type(input, 'Hello, world!');
      
      expect(input).toHaveValue('Hello, world!');
    });

    it('disables input when loading', () => {
      mockUseMatrixMessaging.mockReturnValue({
        sendMessage: mockSendMessage,
        sendFormattedMessage: jest.fn(),
        sendReaction: jest.fn(),
        isLoading: true,
        error: null,
        clearError: mockClearError,
      });

      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      expect(input).toBeDisabled();
    });
  });

  describe('Message Sending', () => {
    it('sends a message when form is submitted', async () => {
      const user = userEvent.setup();
      mockSendMessage.mockResolvedValue(undefined);
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      });
    });

    it('clears the input after successful message send', async () => {
      const user = userEvent.setup();
      mockSendMessage.mockResolvedValue(undefined);
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockSendMessage).not.toHaveBeenCalled();
      });
    });

    it('trims whitespace from messages', async () => {
      const user = userEvent.setup();
      mockSendMessage.mockResolvedValue(undefined);
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      
      await user.type(input, '  Test message  ');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when message sending fails', () => {
      mockUseMatrixMessaging.mockReturnValue({
        sendMessage: mockSendMessage,
        sendFormattedMessage: jest.fn(),
        sendReaction: jest.fn(),
        isLoading: false,
        error: 'Failed to send message',
        clearError: mockClearError,
      });

      render(<ChatInput {...defaultProps} />);
      
      expect(screen.getByText('Failed to send message')).toBeInTheDocument();
    });

    it('handles message sending failure gracefully', async () => {
      const user = userEvent.setup();
      mockSendMessage.mockRejectedValue(new Error('Network error'));
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      
      await user.type(input, 'Test message');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      });
      
      // Input should still contain the message after failed send
      expect(input).toHaveValue('Test message');
    });
  });

  describe('File Upload', () => {
    it('opens file upload modal when plus button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ChatInput {...defaultProps} />);
      
      const plusButton = screen.getByRole('button', { name: /attach file/i });
      
      await user.click(plusButton);
      
      expect(mockOnOpen).toHaveBeenCalledWith('messageFile', {
        roomId: 'test-room-id',
        client: {},
      });
    });
  });

  describe('Emoji Picker', () => {
    it('adds emoji to input when emoji is selected', async () => {
      const user = userEvent.setup();
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      const emojiPicker = screen.getByTestId('emoji-picker');
      
      await user.type(input, 'Hello');
      await user.click(emojiPicker);
      
      expect(input).toHaveValue('Hello 😀');
    });

    it('appends emoji to existing content', async () => {
      const user = userEvent.setup();
      
      render(<ChatInput {...defaultProps} />);
      
      const input = screen.getByPlaceholderText('Message #general');
      const emojiPicker = screen.getByTestId('emoji-picker');
      
      await user.type(input, 'Good morning');
      await user.click(emojiPicker);
      
      expect(input).toHaveValue('Good morning 😀');
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure', () => {
      render(<ChatInput {...defaultProps} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      render(<ChatInput {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // Plus button and emoji picker button
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<ChatInput {...defaultProps} />);
      
      const plusButton = screen.getByRole('button', { name: /attach file/i });
      const input = screen.getByPlaceholderText('Message #general');
      
      // Tab order: plus button -> input -> emoji button
      await user.tab();
      expect(plusButton).toHaveFocus();
      
      await user.tab();
      expect(input).toHaveFocus();
    });
  });
});
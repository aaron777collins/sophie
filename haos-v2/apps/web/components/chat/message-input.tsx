import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, PlusIcon, FaceSmileIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSendMessage: (content: string, replyTo?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  onClearReply?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

// Mobile emoji picker component
const MobileEmojiPicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}> = ({ isOpen, onClose, onEmojiSelect }) => {
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '🥹', '😅', '😂', '🤣', '🥲',
    '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐',
    '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟',
    '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
    '🔥', '✨', '⭐', '🌟', '💫', '⚡', '☀️', '🌈', '🎉', '🎊'
  ];

  const emojiCategories = [
    { name: 'Smileys', emojis: commonEmojis.slice(0, 30) },
    { name: 'Gestures', emojis: commonEmojis.slice(30, 50) },
    { name: 'Hearts', emojis: commonEmojis.slice(50, 70) },
    { name: 'Objects', emojis: commonEmojis.slice(70, 80) }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Emoji picker */}
          <motion.div
            className="
              fixed bottom-0 left-0 right-0 z-50
              bg-white dark:bg-gray-800 rounded-t-2xl
              pb-safe max-h-[50vh] overflow-hidden
              flex flex-col
            "
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Choose an emoji
              </h3>
            </div>

            {/* Emoji grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {emojiCategories.map((category) => (
                <div key={category.name} className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-8 gap-2">
                    {category.emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="
                          w-10 h-10 text-2xl rounded-lg
                          hover:bg-gray-100 dark:hover:bg-gray-700
                          active:scale-95 transition-all duration-100
                          touch-manipulation
                          flex items-center justify-center
                        "
                        onClick={() => {
                          onEmojiSelect(emoji);
                          onClose();
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyTo,
  onClearReply,
  placeholder = "Type a message...",
  maxLength = 2000,
  disabled = false,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [inputHeight, setInputHeight] = useState(44); // Base height for touch-friendly input
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = '44px'; // Reset to minimum
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120; // Maximum height (about 3-4 lines)
    
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    setInputHeight(newHeight);
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Handle typing indicators
      if (onTyping) {
        if (!isTyping && value.length > 0) {
          setIsTyping(true);
          onTyping(true);
        }
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping(false);
        }, 1000);
      }
    }
  }, [maxLength, isTyping, onTyping]);

  // Auto-resize when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Handle sending message
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage, replyTo?.id);
      setMessage('');
      
      // Stop typing indicator
      if (onTyping && isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Focus back to input
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [message, disabled, onSendMessage, replyTo, onTyping, isTyping]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  }, []);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`
      bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
      pb-safe-bottom p-4
      ${className}
    `}>
      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            className="
              mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg
              border-l-4 border-blue-500
            "
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Replying to {replyTo.sender}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {replyTo.content}
                </p>
              </div>
              <button
                onClick={onClearReply}
                className="
                  ml-3 p-1 rounded-full
                  text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  transition-colors min-w-[32px] min-h-[32px]
                  touch-manipulation
                "
                aria-label="Clear reply"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          className="
            flex-shrink-0 w-11 h-11 rounded-full
            bg-gray-100 dark:bg-gray-700
            text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-colors touch-manipulation
            flex items-center justify-center
          "
          disabled={disabled}
          aria-label="Add attachment"
        >
          <PlusIcon className="w-6 h-6" />
        </button>

        {/* Text input container */}
        <div className="
          flex-1 relative min-h-[44px]
          bg-gray-50 dark:bg-gray-700 rounded-2xl
          border border-gray-200 dark:border-gray-600
          focus-within:border-blue-500 dark:focus-within:border-blue-400
          transition-colors
        ">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="
              w-full px-4 py-3 bg-transparent
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              resize-none outline-none
              text-base leading-relaxed
            "
            style={{ 
              height: `${inputHeight}px`,
              // Prevent zoom on iOS
              fontSize: '16px'
            }}
            aria-label="Message input"
          />

          {/* Character count */}
          {message.length > maxLength * 0.8 && (
            <div className={`
              absolute bottom-1 right-2 text-xs
              ${message.length >= maxLength 
                ? 'text-red-500' 
                : 'text-gray-400 dark:text-gray-500'
              }
            `}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Emoji button */}
        <button
          onClick={() => setIsEmojiPickerOpen(true)}
          className="
            flex-shrink-0 w-11 h-11 rounded-full
            bg-gray-100 dark:bg-gray-700
            text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-colors touch-manipulation
            flex items-center justify-center
          "
          disabled={disabled}
          aria-label="Add emoji"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`
            flex-shrink-0 w-11 h-11 rounded-full
            transition-all duration-200 touch-manipulation
            flex items-center justify-center
            ${message.trim() && !disabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white scale-100'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 scale-90'
            }
          `}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile emoji picker */}
      <MobileEmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </div>
  );
};

export default MessageInput;
import React, { useState, useRef, useCallback } from 'react';
import EmojiAutocomplete from './emoji-autocomplete';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  customEmojis?: { name: string; url: string }[];
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  customEmojis = [] 
}) => {
  const [message, setMessage] = useState('');
  const [emojiSearchTerm, setEmojiSearchTerm] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMessage(inputValue);

    // Check for emoji autocomplete trigger
    const matches = inputValue.match(/:([^:\s]*)$/);
    
    if (matches) {
      // User is typing after a colon, show autocomplete
      setEmojiSearchTerm(matches[1]);
    } else {
      // No active emoji search
      setEmojiSearchTerm('');
    }
  };

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (!inputRef.current) return;

    // Replace the current :search term with the selected emoji
    const currentValue = inputRef.current.value;
    const emojiSearchMatch = currentValue.match(/:([^:\s]*)$/);
    
    if (emojiSearchMatch) {
      const newValue = currentValue.replace(emojiSearchMatch[0], emoji);
      setMessage(newValue);
      setEmojiSearchTerm('');
      inputRef.current.focus();
    }
  }, []);

  const handleCloseEmojiPicker = useCallback(() => {
    setEmojiSearchTerm('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setEmojiSearchTerm('');
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        ref={inputRef}
        value={message}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="chat-input"
        rows={3}
      />
      
      {emojiSearchTerm !== undefined && emojiSearchTerm !== null && (
        <EmojiAutocomplete
          searchTerm={emojiSearchTerm}
          onEmojiSelect={handleEmojiSelect}
          onClose={handleCloseEmojiPicker}
          customEmojis={customEmojis}
        />
      )}
      
      <button 
        onClick={handleSendMessage} 
        className="send-message-btn"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;
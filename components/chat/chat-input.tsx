import React, { useState, useRef, useEffect } from 'react';
import { Channel } from '@/types/channel'; // Adjust import based on your project structure
import { ChannelAutocomplete } from './channel-autocomplete';

interface ChatInputProps {
  channels: Channel[];
  onSendMessage: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  channels, 
  onSendMessage 
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleChannelSelect = (channel: Channel) => {
    // Replace the partial channel mention with the full channel mention
    const parts = inputValue.split('#');
    parts[parts.length - 1] = channel.name + ' ';
    setInputValue(parts.join('#'));
    
    // Focus back on the input
    inputRef.current?.focus();
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center p-4 bg-white border-t">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... Use # to mention a channel"
          className="w-full p-2 border rounded resize-none"
          rows={3}
        />
        <button 
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
      
      {/* Channel Autocomplete */}
      <ChannelAutocomplete 
        channels={channels}
        onChannelSelect={handleChannelSelect}
        inputValue={inputValue}
      />
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { TypingService } from '../services/TypingService';

interface ChatInputProps {
  roomId: string;
  matrixClient: MatrixClient;
}

export const ChatInput: React.FC<ChatInputProps> = ({ roomId, matrixClient }) => {
  const [message, setMessage] = useState('');
  const typingService = new TypingService(matrixClient);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    setMessage(inputValue);

    // Send typing start event if input is not empty
    if (inputValue.trim().length > 0) {
      typingService.startTyping(roomId);
    } else {
      typingService.stopTyping(roomId);
    }
  }, [roomId, typingService]);

  const handleSendMessage = useCallback(() => {
    if (message.trim().length > 0) {
      // Send message logic here
      matrixClient.sendTextMessage(roomId, message);

      // Reset message and stop typing
      setMessage('');
      typingService.stopTyping(roomId);
    }
  }, [message, roomId, matrixClient, typingService]);

  return (
    <div className="chat-input-container">
      <textarea
        value={message}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="chat-input"
      />
      <button 
        onClick={handleSendMessage}
        disabled={message.trim().length === 0}
      >
        Send
      </button>
    </div>
  );
};
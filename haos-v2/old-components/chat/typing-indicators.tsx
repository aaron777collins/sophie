import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../../hooks/use-room';
import { useUserSettings } from '../../hooks/use-user-settings';

interface TypingIndicatorsProps {
  roomId: string;
}

export const TypingIndicators: React.FC<TypingIndicatorsProps> = ({ roomId }) => {
  const { typingUsers } = useRoom(roomId);
  const { showTypingIndicators } = useUserSettings();

  // Only render if typing indicators are enabled and there are typing users
  const renderTypingUsers = useMemo(() => {
    if (!showTypingIndicators || typingUsers.length === 0) return null;

    // Limit to max 3 users to prevent overcrowding
    const displayUsers = typingUsers.slice(0, 3);

    return (
      <motion.div 
        className="typing-indicators flex items-center space-x-2 p-2 text-sm text-gray-500 dark:text-gray-400"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
      >
        {displayUsers.length > 0 && (
          <>
            {displayUsers.map((user, index) => (
              <div 
                key={user.userId} 
                className="typing-user flex items-center space-x-1"
              >
                <img 
                  src={user.avatarUrl || '/default-avatar.png'} 
                  alt={user.displayName} 
                  className="w-6 h-6 rounded-full" 
                />
                <span>{user.displayName}</span>
              </div>
            ))}
            <span className="typing-ellipsis">
              {displayUsers.length === 1 ? ' is typing...' : ' are typing...'}
            </span>
          </>
        )}
      </motion.div>
    );
  }, [typingUsers, showTypingIndicators]);

  return (
    <AnimatePresence>
      {renderTypingUsers}
    </AnimatePresence>
  );
};
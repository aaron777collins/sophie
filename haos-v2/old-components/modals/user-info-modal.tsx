import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCallIcon,
  EllipsisHorizontalIcon,
  ShieldCheckIcon,
  ClockIcon,
  StatusOnlineIcon,
  BanIcon,
  FlagIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

interface UserInfo {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  customStatus?: string;
  joinedAt?: Date;
  roles?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  isBot?: boolean;
  isVerified?: boolean;
  mutualServers?: Array<{
    id: string;
    name: string;
    icon?: string;
  }>;
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    description?: string;
  }>;
}

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserInfo;
  currentUserId: string;
  onMessage?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onRemoveFromServer?: () => void;
  canModerate?: boolean;
  className?: string;
}

// Status indicator component
const StatusIndicator: React.FC<{ 
  status: UserInfo['status']; 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const colorClasses = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className={`
      ${sizeClasses[size]} ${colorClasses[status]}
      rounded-full border-2 border-white dark:border-gray-800
      flex-shrink-0
    `} />
  );
};

// Action button component
const ActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'secondary',
  disabled = false 
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        transition-colors duration-200 touch-manipulation
        min-h-[56px] w-full text-left
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  );
};

// Badge component
const UserBadge: React.FC<{
  badge: UserInfo['badges'][0];
}> = ({ badge }) => (
  <div 
    className="
      inline-flex items-center gap-2 px-3 py-1.5
      bg-gradient-to-r from-purple-500 to-blue-500
      text-white text-sm font-medium rounded-full
      min-h-[32px]
    "
    title={badge.description}
  >
    <span className="text-base">{badge.icon}</span>
    <span>{badge.name}</span>
  </div>
);

export const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserId,
  onMessage,
  onCall,
  onVideoCall,
  onBlock,
  onReport,
  onRemoveFromServer,
  canModerate = false,
  className = ''
}) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const isOwnProfile = user.id === currentUserId;

  // Handle escape key and backdrop clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const formatJoinedDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

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
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            className={`
              fixed inset-x-4 top-1/2 z-50
              bg-white dark:bg-gray-800 rounded-2xl
              max-w-md mx-auto max-h-[85vh] overflow-hidden
              flex flex-col
              ${className}
            `}
            initial={{ 
              opacity: 0, 
              scale: 0.95, 
              y: '-40%' 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: '-50%' 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95, 
              y: '-40%' 
            }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200 
            }}
          >
            {/* Header */}
            <div className="relative">
              {/* Banner background */}
              <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="
                  absolute top-4 right-4
                  w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm
                  text-white hover:bg-black/30
                  transition-colors touch-manipulation
                  flex items-center justify-center
                "
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="absolute -bottom-8 left-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 p-1">
                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1">
                    <StatusIndicator status={user.status} size="lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-12">
              {/* User info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {user.displayName}
                  </h2>
                  {user.isVerified && (
                    <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                  )}
                  {user.isBot && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                      BOT
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  @{user.username}
                </p>

                {user.customStatus && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {user.customStatus}
                  </p>
                )}

                {/* Badges */}
                {user.badges && user.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.badges.map((badge) => (
                      <UserBadge key={badge.id} badge={badge} />
                    ))}
                  </div>
                )}

                {/* Roles */}
                {user.roles && user.roles.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: role.color + '20',
                            color: role.color
                          }}
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Join date */}
                {user.joinedAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Joined {formatJoinedDate(user.joinedAt)}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {!isOwnProfile && (
                <div className="space-y-3">
                  {/* Primary actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton
                      icon={ChatBubbleLeftRightIcon}
                      label="Message"
                      onClick={() => {
                        onMessage?.();
                        onClose();
                      }}
                      variant="primary"
                    />
                    <ActionButton
                      icon={PhoneIcon}
                      label="Call"
                      onClick={() => {
                        onCall?.();
                        onClose();
                      }}
                    />
                  </div>

                  <ActionButton
                    icon={VideoCallIcon}
                    label="Video Call"
                    onClick={() => {
                      onVideoCall?.();
                      onClose();
                    }}
                  />

                  {/* More actions */}
                  <button
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="
                      flex items-center justify-center gap-2 w-full
                      py-3 text-gray-600 dark:text-gray-400
                      hover:text-gray-900 dark:hover:text-gray-100
                      transition-colors touch-manipulation
                      min-h-[48px]
                    "
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {showMoreActions ? 'Less actions' : 'More actions'}
                    </span>
                  </button>

                  {/* Expandable actions */}
                  <AnimatePresence>
                    {showMoreActions && (
                      <motion.div
                        className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ActionButton
                          icon={BanIcon}
                          label="Block User"
                          onClick={() => {
                            onBlock?.();
                            onClose();
                          }}
                          variant="danger"
                        />
                        
                        <ActionButton
                          icon={FlagIcon}
                          label="Report User"
                          onClick={() => {
                            onReport?.();
                            onClose();
                          }}
                          variant="danger"
                        />

                        {canModerate && (
                          <ActionButton
                            icon={UserMinusIcon}
                            label="Remove from Server"
                            onClick={() => {
                              onRemoveFromServer?.();
                              onClose();
                            }}
                            variant="danger"
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mutual servers */}
              {user.mutualServers && user.mutualServers.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Mutual Servers ({user.mutualServers.length})
                  </h3>
                  <div className="space-y-2">
                    {user.mutualServers.slice(0, 3).map((server) => (
                      <div key={server.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          {server.icon ? (
                            <img 
                              src={server.icon} 
                              alt={server.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                              {server.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {server.name}
                        </span>
                      </div>
                    ))}
                    {user.mutualServers.length > 3 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 pl-13">
                        +{user.mutualServers.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserInfoModal;
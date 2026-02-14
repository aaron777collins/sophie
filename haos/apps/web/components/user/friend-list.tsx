'use client';

import { useState } from 'react';
import { 
  UsersIcon, 
  MailIcon, 
  MessageCircleIcon,
  MoreVerticalIcon,
  UserPlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { Friend, FriendRequest } from '@/services/friend';
import { UserProfileModal } from './user-profile-modal';

interface FriendListProps {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  onMessageFriend?: (friend: Friend) => void;
  onOpenUserProfile?: (userId: string) => void;
  className?: string;
  compact?: boolean;
}

export function FriendList({ 
  friends, 
  incomingRequests, 
  onMessageFriend, 
  onOpenUserProfile,
  className = '',
  compact = false,
}: FriendListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  const onlineFriends = friends.filter(f => f.status === 'online' || f.status === 'away' || f.status === 'busy');
  const offlineFriends = friends.filter(f => f.status === 'offline');

  if (compact) {
    return (
      <div className={`space-y-1 ${className}`}>
        {/* Header with request indicator */}
        <button
          onClick={() => setShowUserProfile(true)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide"
        >
          <div className="flex items-center gap-2">
            <UsersIcon className="w-3 h-3" />
            Friends ({friends.length})
            {incomingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {incomingRequests.length}
              </span>
            )}
          </div>
        </button>

        {/* Quick friend list (compact) */}
        {onlineFriends.slice(0, 5).map((friend) => (
          <button
            key={friend.userId}
            onClick={() => onOpenUserProfile?.(friend.userId)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-[#36393f] transition-colors"
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                {friend.avatarUrl ? (
                  <img src={friend.avatarUrl} alt={friend.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{getInitials(friend.displayName)}</span>
                )}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#2f3136] ${getStatusColor(friend.status)}`} />
            </div>
            <span className="flex-1 truncate text-sm text-left">{friend.displayName}</span>
            {onMessageFriend && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMessageFriend(friend);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-opacity"
                title="Send message"
              >
                <MessageCircleIcon className="w-3 h-3" />
              </button>
            )}
          </button>
        ))}

        {friends.length > 5 && (
          <button
            onClick={() => setShowUserProfile(true)}
            className="w-full px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 text-center"
          >
            View all friends...
          </button>
        )}

        <UserProfileModal
          open={showUserProfile}
          onOpenChange={setShowUserProfile}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Friends</h3>
        <div className="flex items-center gap-2">
          {incomingRequests.length > 0 && (
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
              <MailIcon className="w-3 h-3" />
              {incomingRequests.length} request{incomingRequests.length !== 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={() => setShowUserProfile(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white p-1.5 rounded transition-colors"
            title="Manage friends"
          >
            <UserPlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Friends list */}
      {friends.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="mb-2">No friends yet</p>
          <button
            onClick={() => setShowUserProfile(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Add Friends
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Online friends */}
          {onlineFriends.length > 0 && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-200 uppercase tracking-wide mb-2"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-3 h-3" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3" />
                )}
                Online ({onlineFriends.length})
              </button>
              
              {isExpanded && (
                <div className="space-y-1">
                  {onlineFriends.map((friend) => (
                    <div key={friend.userId} className="group flex items-center justify-between p-2 hover:bg-[#36393f] rounded transition-colors">
                      <button
                        onClick={() => onOpenUserProfile?.(friend.userId)}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                            {friend.avatarUrl ? (
                              <img src={friend.avatarUrl} alt={friend.displayName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span>{getInitials(friend.displayName)}</span>
                            )}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#36393f] ${getStatusColor(friend.status)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{friend.displayName}</div>
                          <div className="text-gray-400 text-xs">{getStatusText(friend.status)}</div>
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onMessageFriend && (
                          <button
                            onClick={() => onMessageFriend(friend)}
                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Send message"
                          >
                            <MessageCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="More options"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offline friends */}
          {offlineFriends.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                <ChevronRightIcon className="w-3 h-3" />
                Offline ({offlineFriends.length})
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
      />
    </div>
  );
}

export default FriendList;
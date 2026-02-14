'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  XIcon, 
  UserIcon, 
  UsersIcon, 
  MailIcon, 
  CheckIcon, 
  XCircleIcon,
  SearchIcon,
  UserPlusIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
} from 'lucide-react';
import { useMatrixUserStore } from '@/lib/matrix-user-context';
import { getFriendService, Friend, FriendRequest } from '@/services/friend';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId?: string; // If provided, shows another user's profile
}

export function UserProfileModal({ open, onOpenChange, targetUserId }: UserProfileModalProps) {
  const { userId, displayName, avatarUrl } = useMatrixUserStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ userId: string; displayName: string; avatarUrl?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const friendService = getFriendService();
  const isOwnProfile = !targetUserId || targetUserId === userId;

  useEffect(() => {
    if (open && isOwnProfile) {
      loadFriendData();
    }
  }, [open, isOwnProfile]);

  useEffect(() => {
    if (!open) return;

    const handleFriendAdded = (friend: Friend) => {
      setFriends(prev => [...prev, friend]);
    };

    const handleFriendRemoved = (userId: string) => {
      setFriends(prev => prev.filter(f => f.userId !== userId));
    };

    const handleRequestReceived = (request: FriendRequest) => {
      setIncomingRequests(prev => [...prev, request]);
    };

    const handleRequestSent = (request: FriendRequest) => {
      setOutgoingRequests(prev => [...prev, request]);
    };

    const handleRequestAccepted = (request: FriendRequest) => {
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      setOutgoingRequests(prev => prev.filter(r => r.id !== request.id));
    };

    const handleRequestDeclined = (request: FriendRequest) => {
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
    };

    friendService.on('friend-added', handleFriendAdded);
    friendService.on('friend-removed', handleFriendRemoved);
    friendService.on('friend-request-received', handleRequestReceived);
    friendService.on('friend-request-sent', handleRequestSent);
    friendService.on('friend-request-accepted', handleRequestAccepted);
    friendService.on('friend-request-declined', handleRequestDeclined);

    return () => {
      friendService.off('friend-added', handleFriendAdded);
      friendService.off('friend-removed', handleFriendRemoved);
      friendService.off('friend-request-received', handleRequestReceived);
      friendService.off('friend-request-sent', handleRequestSent);
      friendService.off('friend-request-accepted', handleRequestAccepted);
      friendService.off('friend-request-declined', handleRequestDeclined);
    };
  }, [open, friendService]);

  const loadFriendData = () => {
    setFriends(friendService.getFriends());
    setIncomingRequests(friendService.getIncomingRequests());
    setOutgoingRequests(friendService.getOutgoingRequests());
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await friendService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string, displayName: string, avatarUrl?: string) => {
    try {
      await friendService.sendFriendRequest(targetUserId, displayName, avatarUrl);
      // Remove from search results after sending request
      setSearchResults(prev => prev.filter(u => u.userId !== targetUserId));
    } catch (error) {
      console.error('Failed to send friend request:', error);
      // TODO: Show error notification
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendService.acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await friendService.declineFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendUserId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await friendService.removeFriend(friendUserId);
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

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

  if (!isOwnProfile) {
    // Show another user's profile (simplified view)
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md max-h-[90vh] -translate-x-1/2 -translate-y-1/2">
            <div className="bg-discord-dark border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
              <div className="bg-discord-darker border-b border-gray-700 p-6 flex items-center justify-between">
                <Dialog.Title className="text-xl font-semibold text-white">
                  User Profile
                </Dialog.Title>
                <Dialog.Close className="text-gray-400 hover:text-white transition-colors">
                  <XIcon className="w-6 h-6" />
                </Dialog.Close>
              </div>
              
              <div className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4">
                  {getInitials(targetUserId || 'Unknown')}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{targetUserId}</h3>
                <p className="text-gray-400 mb-6">Matrix User</p>
                
                <div className="space-y-3">
                  {friendService.isFriend(targetUserId!) ? (
                    <>
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
                        onClick={() => console.log('Send message to', targetUserId)}
                      >
                        <MessageCircleIcon className="w-4 h-4" />
                        Send Message
                      </button>
                      <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                        onClick={() => handleRemoveFriend(targetUserId!)}
                      >
                        Remove Friend
                      </button>
                    </>
                  ) : friendService.hasPendingRequest(targetUserId!) ? (
                    <div className="text-yellow-400 text-sm">Friend request sent</div>
                  ) : (
                    <button
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleSendFriendRequest(targetUserId!, targetUserId!, undefined)}
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      Send Friend Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2">
          <div className="bg-discord-dark border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-discord-darker border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg font-semibold">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName || 'User'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{getInitials(displayName || 'User')}</span>
                  )}
                </div>
                <div>
                  <Dialog.Title className="text-xl font-semibold text-white">
                    {displayName || 'User Profile'}
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-400 text-sm">
                    {userId}
                  </Dialog.Description>
                </div>
              </div>
              
              <Dialog.Close className="text-gray-400 hover:text-white transition-colors">
                <XIcon className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex border-b border-gray-700 bg-discord-darker">
                <Tabs.Trigger
                  value="overview"
                  className="px-6 py-3 text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary-500 transition-colors"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="friends"
                  className="px-6 py-3 text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary-500 transition-colors"
                >
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Friends ({friends.length})
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="requests"
                  className="px-6 py-3 text-gray-400 hover:text-white data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary-500 transition-colors"
                >
                  <MailIcon className="w-4 h-4 mr-2" />
                  Requests ({incomingRequests.length})
                </Tabs.Trigger>
              </Tabs.List>

              {/* Overview Tab */}
              <Tabs.Content value="overview" className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-4">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName || 'User'} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{getInitials(displayName || 'User')}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2">{displayName}</h3>
                    <p className="text-gray-400">{userId}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-discord-darker p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Friends</h4>
                      <p className="text-2xl font-bold text-primary-500">{friends.length}</p>
                    </div>
                    <div className="bg-discord-darker p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Pending Requests</h4>
                      <p className="text-2xl font-bold text-yellow-500">{incomingRequests.length}</p>
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              {/* Friends Tab */}
              <Tabs.Content value="friends" className="p-6">
                <div className="space-y-4">
                  {/* Search for new friends */}
                  <div className="bg-discord-darker p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Add Friends</h4>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by username or display name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          className="w-full bg-[#1e1f22] border border-gray-600 rounded px-10 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        {isSearching ? 'Searching...' : 'Search'}
                      </button>
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h5 className="text-sm font-medium text-gray-400">Search Results</h5>
                        {searchResults.map((user) => (
                          <div key={user.userId} className="flex items-center justify-between p-2 bg-[#1e1f22] rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{getInitials(user.displayName)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-white text-sm font-medium">{user.displayName}</div>
                                <div className="text-gray-400 text-xs">{user.userId}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendFriendRequest(user.userId, user.displayName, user.avatarUrl)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Add Friend
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Friends list */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Your Friends</h4>
                    {friends.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No friends yet. Search for users above to send friend requests!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {friends.map((friend) => (
                          <div key={friend.userId} className="flex items-center justify-between p-3 bg-discord-darker rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                                  {friend.avatarUrl ? (
                                    <img src={friend.avatarUrl} alt={friend.displayName} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span>{getInitials(friend.displayName)}</span>
                                  )}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-discord-darker ${getStatusColor(friend.status)}`} />
                              </div>
                              <div>
                                <div className="text-white font-medium">{friend.displayName}</div>
                                <div className="text-gray-400 text-sm">{friend.status}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => console.log('Message', friend.userId)}
                                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                                title="Send message"
                              >
                                <MessageCircleIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(friend.userId)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                                title="Remove friend"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Tabs.Content>

              {/* Requests Tab */}
              <Tabs.Content value="requests" className="p-6">
                <div className="space-y-6">
                  {/* Incoming requests */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Incoming Requests ({incomingRequests.length})</h4>
                    {incomingRequests.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <MailIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No incoming friend requests</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {incomingRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-discord-darker rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                                {request.fromAvatarUrl ? (
                                  <img src={request.fromAvatarUrl} alt={request.fromDisplayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span>{getInitials(request.fromDisplayName)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-white font-medium">{request.fromDisplayName}</div>
                                <div className="text-gray-400 text-sm">{request.fromUserId}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
                                title="Accept"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(request.id)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                                title="Decline"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outgoing requests */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Sent Requests ({outgoingRequests.length})</h4>
                    {outgoingRequests.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <p>No sent friend requests</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {outgoingRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-discord-darker rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                                <span>{getInitials(request.toUserId)}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{request.toUserId}</div>
                                <div className="text-yellow-400 text-sm">Request sent</div>
                              </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                              {request.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default UserProfileModal;
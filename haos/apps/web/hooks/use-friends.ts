'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFriendService, Friend, FriendRequest } from '@/services/friend';
import { useMatrixUserStore } from '@/lib/matrix-user-context';

export interface UseFriendsReturn {
  // Data
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  
  // Actions
  sendFriendRequest: (targetUserId: string, displayName: string, avatarUrl?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Array<{ userId: string; displayName: string; avatarUrl?: string }>>;
  
  // Utilities
  isFriend: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  getFriend: (userId: string) => Friend | undefined;
  
  // Statistics
  friendCount: number;
  pendingRequestCount: number;
  
  // Mock data functions (for testing)
  addMockFriendRequest: (fromUserId: string, fromDisplayName: string, fromAvatarUrl?: string) => void;
}

export function useFriends(): UseFriendsReturn {
  const { userId } = useMatrixUserStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const friendService = getFriendService();

  // Initialize service and load data
  useEffect(() => {
    if (userId) {
      friendService.initialize(userId);
      loadData();
    }
  }, [userId]);

  // Set up event listeners
  useEffect(() => {
    const handleFriendAdded = (friend: Friend) => {
      setFriends(prev => [...prev.filter(f => f.userId !== friend.userId), friend]);
    };

    const handleFriendRemoved = (userId: string) => {
      setFriends(prev => prev.filter(f => f.userId !== userId));
    };

    const handleRequestReceived = (request: FriendRequest) => {
      setIncomingRequests(prev => [...prev.filter(r => r.id !== request.id), request]);
    };

    const handleRequestSent = (request: FriendRequest) => {
      setOutgoingRequests(prev => [...prev.filter(r => r.id !== request.id), request]);
    };

    const handleRequestAccepted = (request: FriendRequest) => {
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      setOutgoingRequests(prev => prev.filter(r => r.id !== request.id));
    };

    const handleRequestDeclined = (request: FriendRequest) => {
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
    };

    const handleFriendStatusChanged = ({ userId, status }: { userId: string; status: Friend['status'] }) => {
      setFriends(prev => 
        prev.map(friend => 
          friend.userId === userId 
            ? { ...friend, status, lastSeen: status === 'offline' ? new Date() : friend.lastSeen }
            : friend
        )
      );
    };

    const handleError = (error: Error) => {
      console.error('Friend service error:', error);
      // TODO: Add toast notification
    };

    // Subscribe to events
    friendService.on('friend-added', handleFriendAdded);
    friendService.on('friend-removed', handleFriendRemoved);
    friendService.on('friend-request-received', handleRequestReceived);
    friendService.on('friend-request-sent', handleRequestSent);
    friendService.on('friend-request-accepted', handleRequestAccepted);
    friendService.on('friend-request-declined', handleRequestDeclined);
    friendService.on('friend-status-changed', handleFriendStatusChanged);
    friendService.on('error', handleError);

    return () => {
      friendService.off('friend-added', handleFriendAdded);
      friendService.off('friend-removed', handleFriendRemoved);
      friendService.off('friend-request-received', handleRequestReceived);
      friendService.off('friend-request-sent', handleRequestSent);
      friendService.off('friend-request-accepted', handleRequestAccepted);
      friendService.off('friend-request-declined', handleRequestDeclined);
      friendService.off('friend-status-changed', handleFriendStatusChanged);
      friendService.off('error', handleError);
    };
  }, [friendService]);

  // Load initial data
  const loadData = useCallback(() => {
    setFriends(friendService.getFriends());
    setIncomingRequests(friendService.getIncomingRequests());
    setOutgoingRequests(friendService.getOutgoingRequests());
  }, [friendService]);

  // Actions
  const sendFriendRequest = useCallback(async (targetUserId: string, displayName: string, avatarUrl?: string) => {
    try {
      setIsLoading(true);
      await friendService.sendFriendRequest(targetUserId, displayName, avatarUrl);
    } finally {
      setIsLoading(false);
    }
  }, [friendService]);

  const acceptFriendRequest = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      await friendService.acceptFriendRequest(requestId);
    } finally {
      setIsLoading(false);
    }
  }, [friendService]);

  const declineFriendRequest = useCallback(async (requestId: string) => {
    try {
      setIsLoading(true);
      await friendService.declineFriendRequest(requestId);
    } finally {
      setIsLoading(false);
    }
  }, [friendService]);

  const removeFriend = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      await friendService.removeFriend(userId);
    } finally {
      setIsLoading(false);
    }
  }, [friendService]);

  const searchUsers = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      return await friendService.searchUsers(query);
    } finally {
      setIsSearching(false);
    }
  }, [friendService]);

  // Utilities
  const isFriend = useCallback((userId: string) => {
    return friendService.isFriend(userId);
  }, [friendService]);

  const hasPendingRequest = useCallback((userId: string) => {
    return friendService.hasPendingRequest(userId);
  }, [friendService]);

  const getFriend = useCallback((userId: string) => {
    return friendService.getFriend(userId);
  }, [friendService]);

  // Mock data functions for testing
  const addMockFriendRequest = useCallback((fromUserId: string, fromDisplayName: string, fromAvatarUrl?: string) => {
    friendService.simulateIncomingRequest(fromUserId, fromDisplayName, fromAvatarUrl);
  }, [friendService]);

  return {
    // Data
    friends,
    incomingRequests,
    outgoingRequests,
    
    // Loading states
    isLoading,
    isSearching,
    
    // Actions
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsers,
    
    // Utilities
    isFriend,
    hasPendingRequest,
    getFriend,
    
    // Statistics
    friendCount: friends.length,
    pendingRequestCount: incomingRequests.length,
    
    // Mock data functions
    addMockFriendRequest,
  };
}
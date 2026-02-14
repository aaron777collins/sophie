import { EventEmitter } from 'events';

// Friend request interfaces
export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  fromAvatarUrl?: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
}

export interface Friend {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  addedAt: Date;
}

/**
 * FriendService manages friend relationships and friend requests
 * Integrates with Matrix client for user discovery and messaging
 */
export class FriendService extends EventEmitter {
  private friends = new Map<string, Friend>();
  private outgoingRequests = new Map<string, FriendRequest>();
  private incomingRequests = new Map<string, FriendRequest>();
  private currentUserId: string | null = null;

  constructor() {
    super();
    this.loadFriendsFromStorage();
  }

  /**
   * Initialize the friend service with current user
   */
  initialize(userId: string): void {
    this.currentUserId = userId;
    this.loadFriendsFromStorage();
  }

  /**
   * Send a friend request to a user
   */
  async sendFriendRequest(targetUserId: string, displayName: string, avatarUrl?: string): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User not authenticated');
    }

    if (targetUserId === this.currentUserId) {
      throw new Error('Cannot send friend request to yourself');
    }

    if (this.friends.has(targetUserId)) {
      throw new Error('User is already a friend');
    }

    if (this.outgoingRequests.has(targetUserId)) {
      throw new Error('Friend request already sent to this user');
    }

    try {
      const request: FriendRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromUserId: this.currentUserId,
        toUserId: targetUserId,
        fromDisplayName: displayName,
        fromAvatarUrl: avatarUrl,
        status: 'pending',
        timestamp: new Date(),
      };

      // In a real implementation, this would send a Matrix event
      // For now, we'll simulate it
      await this.simulateMatrixFriendRequest(request);

      this.outgoingRequests.set(targetUserId, request);
      this.saveFriendsToStorage();
      
      this.emit('friend-request-sent', request);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    const request = Array.from(this.incomingRequests.values()).find(req => req.id === requestId);
    
    if (!request) {
      throw new Error('Friend request not found');
    }

    try {
      // Update request status
      request.status = 'accepted';

      // Add as friend
      const friend: Friend = {
        userId: request.fromUserId,
        displayName: request.fromDisplayName,
        avatarUrl: request.fromAvatarUrl,
        status: 'online', // In real implementation, get actual status
        addedAt: new Date(),
      };

      this.friends.set(request.fromUserId, friend);
      this.incomingRequests.delete(request.fromUserId);
      this.saveFriendsToStorage();

      // In real implementation, send acceptance via Matrix
      await this.simulateMatrixAcceptance(request);

      this.emit('friend-request-accepted', request);
      this.emit('friend-added', friend);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Decline a friend request
   */
  async declineFriendRequest(requestId: string): Promise<void> {
    const request = Array.from(this.incomingRequests.values()).find(req => req.id === requestId);
    
    if (!request) {
      throw new Error('Friend request not found');
    }

    try {
      request.status = 'declined';
      this.incomingRequests.delete(request.fromUserId);
      this.saveFriendsToStorage();

      // In real implementation, send decline via Matrix
      await this.simulateMatrixDecline(request);

      this.emit('friend-request-declined', request);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(userId: string): Promise<void> {
    if (!this.friends.has(userId)) {
      throw new Error('User is not a friend');
    }

    try {
      this.friends.delete(userId);
      this.saveFriendsToStorage();

      // In real implementation, notify via Matrix
      await this.simulateMatrixRemoval(userId);

      this.emit('friend-removed', userId);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Get list of friends
   */
  getFriends(): Friend[] {
    return Array.from(this.friends.values());
  }

  /**
   * Get incoming friend requests
   */
  getIncomingRequests(): FriendRequest[] {
    return Array.from(this.incomingRequests.values());
  }

  /**
   * Get outgoing friend requests
   */
  getOutgoingRequests(): FriendRequest[] {
    return Array.from(this.outgoingRequests.values());
  }

  /**
   * Get a specific friend by user ID
   */
  getFriend(userId: string): Friend | undefined {
    return this.friends.get(userId);
  }

  /**
   * Check if a user is a friend
   */
  isFriend(userId: string): boolean {
    return this.friends.has(userId);
  }

  /**
   * Check if there's a pending outgoing request to a user
   */
  hasPendingRequest(userId: string): boolean {
    return this.outgoingRequests.has(userId);
  }

  /**
   * Update friend status
   */
  updateFriendStatus(userId: string, status: Friend['status']): void {
    const friend = this.friends.get(userId);
    if (friend) {
      friend.status = status;
      if (status === 'offline') {
        friend.lastSeen = new Date();
      }
      this.friends.set(userId, friend);
      this.saveFriendsToStorage();
      this.emit('friend-status-changed', { userId, status });
    }
  }

  /**
   * Search for users by display name or user ID
   */
  async searchUsers(query: string): Promise<Array<{ userId: string; displayName: string; avatarUrl?: string }>> {
    // In real implementation, this would query the Matrix server
    // For now, return mock data
    const mockUsers = [
      { userId: '@alice:matrix.org', displayName: 'Alice Johnson', avatarUrl: undefined },
      { userId: '@bob:matrix.org', displayName: 'Bob Smith', avatarUrl: undefined },
      { userId: '@charlie:matrix.org', displayName: 'Charlie Brown', avatarUrl: undefined },
    ];

    return mockUsers.filter(user => 
      user.displayName.toLowerCase().includes(query.toLowerCase()) ||
      user.userId.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Load friends from localStorage
   */
  private loadFriendsFromStorage(): void {
    try {
      const stored = localStorage.getItem('haos-friends');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Load friends
        if (data.friends) {
          this.friends = new Map(
            data.friends.map((friend: Friend) => [friend.userId, {
              ...friend,
              addedAt: new Date(friend.addedAt),
              lastSeen: friend.lastSeen ? new Date(friend.lastSeen) : undefined,
            }])
          );
        }

        // Load requests
        if (data.incomingRequests) {
          this.incomingRequests = new Map(
            data.incomingRequests.map((req: FriendRequest) => [req.fromUserId, {
              ...req,
              timestamp: new Date(req.timestamp),
            }])
          );
        }

        if (data.outgoingRequests) {
          this.outgoingRequests = new Map(
            data.outgoingRequests.map((req: FriendRequest) => [req.toUserId, {
              ...req,
              timestamp: new Date(req.timestamp),
            }])
          );
        }
      }
    } catch (error) {
      console.error('Failed to load friends from storage:', error);
    }
  }

  /**
   * Save friends to localStorage
   */
  private saveFriendsToStorage(): void {
    try {
      const data = {
        friends: Array.from(this.friends.values()),
        incomingRequests: Array.from(this.incomingRequests.values()),
        outgoingRequests: Array.from(this.outgoingRequests.values()),
      };
      localStorage.setItem('haos-friends', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save friends to storage:', error);
    }
  }

  /**
   * Simulate Matrix friend request (placeholder)
   */
  private async simulateMatrixFriendRequest(request: FriendRequest): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Sent friend request via Matrix:', request);
  }

  /**
   * Simulate Matrix acceptance (placeholder)
   */
  private async simulateMatrixAcceptance(request: FriendRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Sent friend acceptance via Matrix:', request);
  }

  /**
   * Simulate Matrix decline (placeholder)
   */
  private async simulateMatrixDecline(request: FriendRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Sent friend decline via Matrix:', request);
  }

  /**
   * Simulate Matrix removal (placeholder)
   */
  private async simulateMatrixRemoval(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Sent friend removal via Matrix:', userId);
  }

  /**
   * Cleanup and dispose of resources
   */
  dispose(): void {
    this.removeAllListeners();
  }

  /**
   * Simulate receiving a friend request (for testing)
   */
  simulateIncomingRequest(fromUserId: string, fromDisplayName: string, fromAvatarUrl?: string): void {
    const request: FriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId,
      toUserId: this.currentUserId || 'current-user',
      fromDisplayName,
      fromAvatarUrl,
      status: 'pending',
      timestamp: new Date(),
    };

    this.incomingRequests.set(fromUserId, request);
    this.saveFriendsToStorage();
    this.emit('friend-request-received', request);
  }
}

// Singleton instance
let friendServiceInstance: FriendService | null = null;

/**
 * Get the global FriendService instance
 */
export function getFriendService(): FriendService {
  if (!friendServiceInstance) {
    friendServiceInstance = new FriendService();
  }
  return friendServiceInstance;
}

/**
 * Reset the global FriendService instance (useful for testing)
 */
export function resetFriendService(): void {
  if (friendServiceInstance) {
    friendServiceInstance.dispose();
    friendServiceInstance = null;
  }
}
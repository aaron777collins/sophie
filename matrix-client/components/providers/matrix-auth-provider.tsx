'use client';

import React, { createContext, useContext } from 'react';
import { getClientConfig } from '@/lib/matrix/client-config';

// Types for invite checking
interface InviteData {
  id: string;
  code: string;
  matrixId: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  notes?: string;
  createdBy: string;
  usedAt?: string;
  usedBy?: string;
}

interface LoginCheckResult {
  allowed: boolean;
  error?: string;
  requiresInvite?: boolean;
}

interface MatrixAuthContextType {
  isLoginAllowedWithInvite: (matrixId: string, inviteCode?: string) => Promise<LoginCheckResult>;
}

const MatrixAuthContext = createContext<MatrixAuthContextType | null>(null);

export function MatrixAuthProvider({ children }: { children: React.ReactNode }) {
  
  /**
   * Check if login is allowed for a user with invite validation
   * Replaces the previous isLoginAllowed() function
   */
  const isLoginAllowedWithInvite = async (
    matrixId: string, 
    inviteCode?: string
  ): Promise<LoginCheckResult> => {
    try {
      // Get client configuration to check if we're in private mode
      const config = await getClientConfig();
      const homeserverDomain = new URL(config.homeserver).hostname;
      
      // Extract domain from Matrix ID (@user:domain)
      const userDomain = matrixId.split(':')[1];
      
      // Internal homeserver users can always login (no invite required)
      if (userDomain === homeserverDomain) {
        return { allowed: true };
      }
      
      // For external users, check if invite is required
      if (!config.inviteRequired) {
        return { allowed: true };
      }
      
      // External user needs an invite in private mode
      if (!inviteCode) {
        return {
          allowed: false,
          error: 'This server requires an invite code for external users. Please provide a valid invite code.',
          requiresInvite: true
        };
      }
      
      // Validate invite code format first
      const inviteCodeRegex = /^\d{10}_[a-zA-Z0-9]{16}$/;
      if (!inviteCodeRegex.test(inviteCode)) {
        return {
          allowed: false,
          error: 'Invalid invite code format.',
          requiresInvite: true
        };
      }
      
      // Fetch current invites from the API
      const response = await fetch('/api/admin/invites');
      if (!response.ok) {
        console.error('Failed to fetch invites for validation');
        return {
          allowed: false,
          error: 'Unable to validate invite code. Please try again later.',
          requiresInvite: true
        };
      }
      
      const { invites }: { invites: InviteData[] } = await response.json();
      
      // Find matching invite
      const invite = invites.find(inv => inv.code === inviteCode);
      
      if (!invite) {
        return {
          allowed: false,
          error: 'Invalid invite code. Please check your invite code and try again.',
          requiresInvite: true
        };
      }
      
      // Check if invite is expired
      const now = new Date();
      const expiresAt = new Date(invite.expiresAt);
      
      if (now > expiresAt || invite.status === 'expired') {
        return {
          allowed: false,
          error: 'This invite code has expired. Please request a new invite.',
          requiresInvite: true
        };
      }
      
      // Check if invite is already used
      if (invite.status === 'used') {
        return {
          allowed: false,
          error: 'This invite code has already been used.',
          requiresInvite: true
        };
      }
      
      // Check if the Matrix ID matches the invite
      if (invite.matrixId !== matrixId) {
        return {
          allowed: false,
          error: 'This invite code is not valid for your Matrix ID.',
          requiresInvite: true
        };
      }
      
      // Valid invite! Mark it as used
      await markInviteAsUsed(invite.id, matrixId);
      
      return { allowed: true };
      
    } catch (error) {
      console.error('Error checking login permission:', error);
      return {
        allowed: false,
        error: 'Unable to verify login permissions. Please try again later.',
        requiresInvite: true
      };
    }
  };
  
  /**
   * Mark an invite as used by updating its status
   */
  const markInviteAsUsed = async (inviteId: string, usedBy: string): Promise<void> => {
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId,
          status: 'used',
          usedBy,
          usedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        console.error('Failed to mark invite as used');
        // Don't throw error here - login was successful, this is just cleanup
      }
      
    } catch (error) {
      console.error('Error marking invite as used:', error);
      // Don't throw error - login was successful, this is just cleanup
    }
  };

  const value: MatrixAuthContextType = {
    isLoginAllowedWithInvite,
  };

  return (
    <MatrixAuthContext.Provider value={value}>
      {children}
    </MatrixAuthContext.Provider>
  );
}

export function useMatrixAuth(): MatrixAuthContextType {
  const context = useContext(MatrixAuthContext);
  if (!context) {
    throw new Error('useMatrixAuth must be used within a MatrixAuthProvider');
  }
  return context;
}

// Backward compatibility - deprecated, use isLoginAllowedWithInvite instead
export async function isLoginAllowed(matrixId: string): Promise<boolean> {
  console.warn('isLoginAllowed() is deprecated. Use useMatrixAuth().isLoginAllowedWithInvite() instead.');
  
  // Basic implementation without invite checking for backward compatibility
  try {
    const config = await getClientConfig();
    const homeserverDomain = new URL(config.homeserver).hostname;
    const userDomain = matrixId.split(':')[1];
    
    // Only allow internal homeserver users with the old function
    return userDomain === homeserverDomain;
  } catch {
    return false;
  }
}
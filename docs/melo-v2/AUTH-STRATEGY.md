# MELO v2 Auth Strategy: Clerk → Matrix Authentication

> **Audit Task:** `audit-03-auth-strategy`  
> **Date:** 2025-06-29  
> **Source:** `/home/ubuntu/repos/discord-clone-reference`  
> **Dependencies:** `audit-01-frontend-analysis` (completed)

This document details the complete migration strategy from Clerk authentication to Matrix native authentication for MELO v2.

---

## Table of Contents

1. [Current Clerk Usage Inventory](#1-current-clerk-usage-inventory)
2. [Matrix Authentication Overview](#2-matrix-authentication-overview)
3. [Migration Strategy](#3-migration-strategy)
4. [Component Designs](#4-component-designs)
5. [Session & Token Management](#5-session--token-management)
6. [Implementation Tasks](#6-implementation-tasks)
7. [Security Considerations](#7-security-considerations)

---

## 1. Current Clerk Usage Inventory

### 1.1 Package Dependencies

```json
{
  "@clerk/nextjs": "^4.23.2"
}
```

### 1.2 Files Using Clerk

| File | Clerk Import | Usage Pattern |
|------|--------------|---------------|
| `app/layout.tsx` | `ClerkProvider` | Root provider wrapping entire app |
| `middleware.ts` | `authMiddleware` | Route protection at edge |
| `lib/current-profile.ts` | `auth()` | Server-side user ID extraction (App Router) |
| `lib/current-profile-pages.ts` | `getAuth()` | Server-side user ID extraction (Pages Router) |
| `lib/initial-profile.ts` | `currentUser`, `redirectToSignIn` | Profile creation on first sign-in |
| `components/navigation/navigation-sidebar.tsx` | `UserButton` | User avatar/menu in sidebar |
| `components/media-room.tsx` | `useUser()` | Client-side user data for LiveKit |
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | `SignIn` | Sign-in page component |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | `SignUp` | Sign-up page component |
| `app/api/uploadthing/core.ts` | `auth()` | API route authentication |
| `app/(main)/.../page.tsx` (4 files) | `redirectToSignIn` | Protected page redirects |
| `app/(invite)/.../page.tsx` | `redirectToSignIn` | Invite page protection |

### 1.3 Clerk Features Used

| Feature | Location | Purpose | Matrix Replacement |
|---------|----------|---------|-------------------|
| **ClerkProvider** | `app/layout.tsx` | Auth context provider | `MatrixAuthProvider` |
| **authMiddleware** | `middleware.ts` | Route protection | Custom middleware with token validation |
| **auth()** | Server components/API | Get userId synchronously | `getMatrixSession()` |
| **getAuth()** | Pages API routes | Get userId from request | Parse token from request headers |
| **currentUser()** | Server components | Get full user object | Matrix client `.getUser()` + `.getUserProfile()` |
| **redirectToSignIn()** | Protected pages | Redirect unauthenticated | `redirect('/sign-in')` |
| **useUser()** | Client components | Hook for user data | `useMatrixUser()` |
| **UserButton** | Navigation | Avatar + dropdown menu | `MatrixUserButton` |
| **SignIn** | Auth pages | Sign-in form | `MatrixLoginPage` |
| **SignUp** | Auth pages | Sign-up form | `MatrixRegisterPage` |

### 1.4 Profile Model Relationship

The Discord clone creates a `Profile` record in the database linked to Clerk's `userId`:

```prisma
model Profile {
  id       String @id @default(uuid())
  userId   String @unique  // ← Clerk user ID (e.g., "user_2abc123")
  name     String
  imageUrl String @db.Text
  email    String @db.Text
  // ... relations
}
```

**Critical insight:** The `userId` field stores Clerk's external ID. In Matrix, this becomes the Matrix user ID (`@userId:homeserver`).

---

## 2. Matrix Authentication Overview

### 2.1 How Matrix Auth Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MATRIX AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

    User                    MELO Client                   Matrix Homeserver
      │                          │                               │
      │  1. Enter credentials    │                               │
      │ ────────────────────────>│                               │
      │                          │                               │
      │                          │  2. POST /_matrix/client/v3/login
      │                          │  { type: "m.login.password",  │
      │                          │    identifier: { type: "m.id.user", user: "alice" },
      │                          │    password: "***" }          │
      │                          │ ─────────────────────────────>│
      │                          │                               │
      │                          │  3. Response:                 │
      │                          │  { user_id: "@alice:hs",      │
      │                          │    access_token: "syt_...",   │
      │                          │    device_id: "ABCD1234" }    │
      │                          │<─────────────────────────────│
      │                          │                               │
      │                          │  4. Store credentials         │
      │                          │  - localStorage (web)         │
      │                          │  - secure cookie (SSR)        │
      │                          │                               │
      │  5. Auth complete        │                               │
      │<────────────────────────│                               │
      │                          │                               │
      │                          │  6. All requests use token:   │
      │                          │  Authorization: Bearer syt_...│
      │                          │ ─────────────────────────────>│
```

### 2.2 Matrix Login Types

| Login Type | Description | Use Case |
|------------|-------------|----------|
| `m.login.password` | Username + password | Primary for MELO |
| `m.login.token` | One-time token | SSO redirect flows |
| `m.login.sso` | Single Sign-On | Enterprise integrations |
| `m.login.jwt` | JWT token | App service / bot accounts |

### 2.3 Key Matrix Auth Concepts

| Concept | Description |
|---------|-------------|
| **User ID** | `@localpart:homeserver` (e.g., `@alice:melo.example.com`) |
| **Access Token** | Long-lived credential starting with `syt_` |
| **Device ID** | Unique per login session (for E2EE key management) |
| **Homeserver** | Matrix server hosting the account (we run Synapse) |
| **Well-Known** | `/.well-known/matrix/client` for server discovery |

### 2.4 Registration Flow

```
POST /_matrix/client/v3/register

Request:
{
  "username": "alice",
  "password": "secret123",
  "initial_device_display_name": "MELO Web"
}

Response:
{
  "user_id": "@alice:homeserver",
  "access_token": "syt_...",
  "device_id": "DEVICEID123"
}
```

**Note:** Registration may require additional steps (email verification, CAPTCHA) depending on Synapse configuration.

---

## 3. Migration Strategy

### 3.1 High-Level Approach

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MIGRATION ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

    CLERK (Current)                    MATRIX (Target)
    ─────────────────                  ─────────────────
    
    ┌─────────────────┐                ┌─────────────────┐
    │  ClerkProvider  │    ────>       │ MatrixAuthProvider
    │  (React Context)│                │ (React Context) │
    └────────┬────────┘                └────────┬────────┘
             │                                  │
             ▼                                  ▼
    ┌─────────────────┐                ┌─────────────────┐
    │  Clerk Backend  │    ────>       │ Synapse Server  │
    │  (Hosted)       │                │ (Self-hosted)   │
    └────────┬────────┘                └────────┬────────┘
             │                                  │
             ▼                                  ▼
    ┌─────────────────┐                ┌─────────────────┐
    │  Profile Table  │    ────>       │ Matrix User +   │
    │  (Prisma/MySQL) │                │ Account Data    │
    └─────────────────┘                └─────────────────┘
    
    
    KEY CHANGES:
    ─────────────────────────────────────────────────────────────
    • No external auth dependency (Clerk → self-hosted Matrix)
    • No Profile table (user data lives in Matrix)
    • Tokens validated by Synapse, not Clerk JWT
    • Real-time sync replaces profile refresh
```

### 3.2 Component Mapping

| Clerk Component | Matrix Replacement | Status |
|-----------------|-------------------|--------|
| `<ClerkProvider>` | `<MatrixAuthProvider>` | To implement |
| `<SignIn />` | `<MatrixLoginPage />` | To implement |
| `<SignUp />` | `<MatrixRegisterPage />` | To implement |
| `<UserButton />` | `<MatrixUserButton />` | To implement |
| `authMiddleware` | `matrixMiddleware` | To implement |
| `auth()` | `getMatrixSession()` | To implement |
| `getAuth(req)` | `getMatrixSessionFromRequest(req)` | To implement |
| `currentUser()` | `getCurrentMatrixUser()` | To implement |
| `useUser()` | `useMatrixUser()` | To implement |
| `redirectToSignIn()` | `redirect('/sign-in')` | Native Next.js |

### 3.3 Data Migration

#### Profile Data Flow

```
CURRENT (Clerk + Prisma):
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Clerk User  │────>│   Profile    │────>│   Member     │
│  (external)  │     │  (database)  │     │  (database)  │
│              │     │              │     │              │
│ id: user_123 │     │ userId: ^    │     │ profileId: ^ │
│ name: Alice  │     │ name: Alice  │     │ role: ADMIN  │
│ email: ...   │     │ imageUrl:... │     │ serverId: ...│
└──────────────┘     └──────────────┘     └──────────────┘

TARGET (Matrix only):
┌──────────────────────────────────────────────────────────┐
│                    MATRIX USER                           │
│  ────────────────────────────────────────────────────    │
│  userId: @alice:melo.example.com                         │
│                                                          │
│  Profile Data (m.room.member in rooms):                  │
│    - displayname: "Alice"                                │
│    - avatar_url: "mxc://melo.example.com/abc123"         │
│                                                          │
│  Account Data (io.melo.profile):                         │
│    - email: "alice@example.com"                          │
│    - createdAt: "2025-06-29T..."                         │
│                                                          │
│  Room Membership:                                        │
│    - Space membership = Server membership                │
│    - Power level = Role (100=ADMIN, 50=MOD, 0=GUEST)     │
└──────────────────────────────────────────────────────────┘
```

#### What Happens to Profile Table?

**Short answer:** It gets deleted.

**Long answer:** 
1. During migration, we sync existing Profile data to Matrix user accounts
2. `Member.profileId` becomes `Member.matrixUserId` conceptually (but Member table also goes away)
3. All user data lives in Matrix homeserver

---

## 4. Component Designs

### 4.1 MatrixAuthProvider

The central authentication context that replaces `ClerkProvider`.

```typescript
// components/providers/matrix-auth-provider.tsx

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MatrixClient, createClient } from 'matrix-js-sdk';

interface MatrixUser {
  userId: string;          // @alice:homeserver
  displayName: string;
  avatarUrl: string | null;
  email?: string;
}

interface MatrixAuthContextType {
  client: MatrixClient | null;
  user: MatrixUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (homeserver: string, username: string, password: string) => Promise<void>;
  register: (homeserver: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const MatrixAuthContext = createContext<MatrixAuthContextType | null>(null);

export function MatrixAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [user, setUser] = useState<MatrixUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from storage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem('matrix_credentials');
        if (!stored) {
          setIsLoading(false);
          return;
        }

        const { homeserver, userId, accessToken, deviceId } = JSON.parse(stored);
        
        const matrixClient = createClient({
          baseUrl: homeserver,
          userId,
          accessToken,
          deviceId,
        });

        // Verify token is still valid
        const whoami = await matrixClient.whoami();
        if (whoami.user_id !== userId) {
          throw new Error('Token invalid');
        }

        // Fetch user profile
        const profile = await matrixClient.getProfileInfo(userId);
        const accountData = await matrixClient.getAccountDataFromServer('io.melo.profile')
          .catch(() => null);

        setClient(matrixClient);
        setUser({
          userId,
          displayName: profile.displayname || userId.split(':')[0].slice(1),
          avatarUrl: profile.avatar_url 
            ? matrixClient.mxcUrlToHttp(profile.avatar_url, 96, 96, 'crop') 
            : null,
          email: accountData?.email,
        });

        // Start sync for real-time updates (optional at this point)
        // matrixClient.startClient({ initialSyncLimit: 0 });
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('matrix_credentials');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (
    homeserver: string,
    username: string,
    password: string
  ) => {
    const matrixClient = createClient({ baseUrl: homeserver });

    const response = await matrixClient.login('m.login.password', {
      identifier: {
        type: 'm.id.user',
        user: username,
      },
      password,
      initial_device_display_name: 'MELO Web',
    });

    // Store credentials
    const credentials = {
      homeserver,
      userId: response.user_id,
      accessToken: response.access_token,
      deviceId: response.device_id,
    };
    localStorage.setItem('matrix_credentials', JSON.stringify(credentials));

    // Update client with credentials
    matrixClient.credentials = {
      userId: response.user_id,
    };
    (matrixClient as any).setAccessToken(response.access_token);

    // Fetch profile
    const profile = await matrixClient.getProfileInfo(response.user_id);
    const accountData = await matrixClient.getAccountDataFromServer('io.melo.profile')
      .catch(() => null);

    setClient(matrixClient);
    setUser({
      userId: response.user_id,
      displayName: profile.displayname || username,
      avatarUrl: profile.avatar_url
        ? matrixClient.mxcUrlToHttp(profile.avatar_url, 96, 96, 'crop')
        : null,
      email: accountData?.email,
    });
  }, []);

  const register = useCallback(async (
    homeserver: string,
    username: string,
    password: string
  ) => {
    const matrixClient = createClient({ baseUrl: homeserver });

    // Registration may have multiple stages (CAPTCHA, email, etc.)
    // For simplicity, assuming open registration
    const response = await matrixClient.register(
      username,
      password,
      undefined, // sessionId
      {
        type: 'm.login.dummy', // No additional auth required
      },
      {
        initial_device_display_name: 'MELO Web',
      }
    );

    // Store credentials
    const credentials = {
      homeserver,
      userId: response.user_id,
      accessToken: response.access_token,
      deviceId: response.device_id,
    };
    localStorage.setItem('matrix_credentials', JSON.stringify(credentials));

    // Update client
    (matrixClient as any).setAccessToken(response.access_token);
    matrixClient.credentials = { userId: response.user_id };

    // Set initial profile
    await matrixClient.setDisplayName(username);
    await matrixClient.setAccountData('io.melo.profile', {
      createdAt: new Date().toISOString(),
    });

    setClient(matrixClient);
    setUser({
      userId: response.user_id,
      displayName: username,
      avatarUrl: null,
    });
  }, []);

  const logout = useCallback(async () => {
    if (client) {
      try {
        await client.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
      client.stopClient();
    }
    
    localStorage.removeItem('matrix_credentials');
    setClient(null);
    setUser(null);
  }, [client]);

  return (
    <MatrixAuthContext.Provider
      value={{
        client,
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </MatrixAuthContext.Provider>
  );
}

export function useMatrixAuth() {
  const context = useContext(MatrixAuthContext);
  if (!context) {
    throw new Error('useMatrixAuth must be used within MatrixAuthProvider');
  }
  return context;
}

// Convenience hooks matching Clerk's API
export function useMatrixUser() {
  const { user, isLoading } = useMatrixAuth();
  return { user, isLoaded: !isLoading };
}

export function useMatrixClient() {
  const { client } = useMatrixAuth();
  if (!client) {
    throw new Error('Matrix client not initialized');
  }
  return client;
}
```

### 4.2 MatrixLoginPage

Replaces Clerk's `<SignIn />` component.

```typescript
// app/(auth)/(routes)/sign-in/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMatrixAuth } from '@/components/providers/matrix-auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { login, isLoading } = useMatrixAuth();
  
  const [homeserver, setHomeserver] = useState(
    process.env.NEXT_PUBLIC_MATRIX_HOMESERVER || 'https://matrix.melo.local'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(homeserver, username, password);
      router.push('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      
      // Map Matrix errors to user-friendly messages
      if (err.errcode === 'M_FORBIDDEN') {
        setError('Invalid username or password');
      } else if (err.errcode === 'M_USER_DEACTIVATED') {
        setError('This account has been deactivated');
      } else if (err.errcode === 'M_LIMIT_EXCEEDED') {
        setError('Too many attempts. Please wait and try again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#313338]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#2b2d31] rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
          <p className="text-zinc-400 mt-2">Sign in to continue to MELO</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Homeserver (usually hidden or in advanced settings) */}
          <div className="space-y-2">
            <Label htmlFor="homeserver" className="text-xs text-zinc-400 uppercase">
              Homeserver
            </Label>
            <Input
              id="homeserver"
              type="url"
              value={homeserver}
              onChange={(e) => setHomeserver(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
              placeholder="https://matrix.example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs text-zinc-400 uppercase">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
              placeholder="alice"
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs text-zinc-400 uppercase">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-400">Need an account? </span>
          <a href="/sign-up" className="text-indigo-400 hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
```

### 4.3 MatrixRegisterPage

Replaces Clerk's `<SignUp />` component.

```typescript
// app/(auth)/(routes)/sign-up/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMatrixAuth } from '@/components/providers/matrix-auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading } = useMatrixAuth();
  
  const [homeserver, setHomeserver] = useState(
    process.env.NEXT_PUBLIC_MATRIX_HOMESERVER || 'https://matrix.melo.local'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/^[a-z0-9._=-]+$/i.test(username)) {
      setError('Username can only contain letters, numbers, and ._=-');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(homeserver, username, password);
      router.push('/');
    } catch (err: any) {
      console.error('Registration failed:', err);
      
      if (err.errcode === 'M_USER_IN_USE') {
        setError('Username is already taken');
      } else if (err.errcode === 'M_INVALID_USERNAME') {
        setError('Invalid username format');
      } else if (err.errcode === 'M_WEAK_PASSWORD') {
        setError('Password is too weak');
      } else if (err.errcode === 'M_FORBIDDEN') {
        setError('Registration is disabled on this server');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#313338]">
      <div className="w-full max-w-md p-8 space-y-6 bg-[#2b2d31] rounded-lg shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-zinc-400 mt-2">Join MELO today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homeserver" className="text-xs text-zinc-400 uppercase">
              Homeserver
            </Label>
            <Input
              id="homeserver"
              type="url"
              value={homeserver}
              onChange={(e) => setHomeserver(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs text-zinc-400 uppercase">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
              placeholder="alice"
              required
              autoComplete="username"
            />
            <p className="text-xs text-zinc-500">
              Your full ID will be @{username || 'username'}:{new URL(homeserver).host}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs text-zinc-400 uppercase">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs text-zinc-400 uppercase">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#1e1f22] border-none text-white"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-zinc-400">Already have an account? </span>
          <a href="/sign-in" className="text-indigo-400 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
```

### 4.4 MatrixUserButton

Replaces Clerk's `<UserButton />` component.

```typescript
// components/matrix-user-button.tsx

'use client';

import { useMatrixAuth, useMatrixUser } from '@/components/providers/matrix-auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MatrixUserButtonProps {
  afterSignOutUrl?: string;
  appearance?: {
    elements?: {
      avatarBox?: string;
    };
  };
}

export function MatrixUserButton({ 
  afterSignOutUrl = '/',
  appearance 
}: MatrixUserButtonProps) {
  const router = useRouter();
  const { logout } = useMatrixAuth();
  const { user } = useMatrixUser();

  if (!user) return null;

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    router.push(afterSignOutUrl);
  };

  const avatarSize = appearance?.elements?.avatarBox || 'h-[48px] w-[48px]';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Avatar className={avatarSize}>
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            ) : null}
            <AvatarFallback className="bg-indigo-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-[#111214] border-zinc-800"
      >
        <DropdownMenuLabel className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            ) : null}
            <AvatarFallback className="bg-indigo-500 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">
              {user.displayName}
            </span>
            <span className="text-xs text-zinc-400">
              {user.userId}
            </span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-zinc-800" />
        
        <DropdownMenuItem 
          className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
          onClick={() => router.push('/settings/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
          onClick={() => router.push('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-zinc-800" />
        
        <DropdownMenuItem 
          className="text-red-400 focus:bg-red-900/20 focus:text-red-400 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 4.5 Middleware for Route Protection

Replaces Clerk's `authMiddleware`.

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/uploadthing',  // Keep if still using UploadThing
];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/sign-in', '/sign-up'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for Matrix credentials in cookie
  // Note: In production, use httpOnly secure cookies set by server
  const matrixToken = request.cookies.get('matrix_access_token')?.value;
  const isAuthenticated = !!matrixToken;

  // Allow public routes
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === route
  );
  
  if (isPublicRoute) {
    // If authenticated and trying to access auth pages, redirect to home
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!isAuthenticated) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### 4.6 Server-Side Auth Helpers

Replaces `auth()`, `currentUser()`, `getAuth()`.

```typescript
// lib/matrix-auth.ts

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MatrixClient, createClient } from 'matrix-js-sdk';

interface MatrixSession {
  userId: string;
  accessToken: string;
  deviceId: string;
  homeserver: string;
}

interface MatrixProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  email?: string;
}

// ============================================================================
// SERVER COMPONENT HELPERS (App Router)
// ============================================================================

/**
 * Get Matrix session from cookies (Server Component)
 * Equivalent to Clerk's auth()
 */
export function getMatrixSession(): MatrixSession | null {
  const cookieStore = cookies();
  
  const userId = cookieStore.get('matrix_user_id')?.value;
  const accessToken = cookieStore.get('matrix_access_token')?.value;
  const deviceId = cookieStore.get('matrix_device_id')?.value;
  const homeserver = cookieStore.get('matrix_homeserver')?.value;
  
  if (!userId || !accessToken || !homeserver) {
    return null;
  }
  
  return { userId, accessToken, deviceId: deviceId || '', homeserver };
}

/**
 * Get Matrix user profile (Server Component)
 * Equivalent to Clerk's currentUser()
 */
export async function getCurrentMatrixUser(): Promise<MatrixProfile | null> {
  const session = getMatrixSession();
  if (!session) return null;
  
  try {
    const client = createClient({
      baseUrl: session.homeserver,
      userId: session.userId,
      accessToken: session.accessToken,
    });
    
    const profile = await client.getProfileInfo(session.userId);
    const accountData = await client.getAccountDataFromServer('io.melo.profile')
      .catch(() => null);
    
    return {
      userId: session.userId,
      displayName: profile.displayname || session.userId.split(':')[0].slice(1),
      avatarUrl: profile.avatar_url 
        ? client.mxcUrlToHttp(profile.avatar_url, 96, 96, 'crop')
        : null,
      email: accountData?.email,
    };
  } catch (error) {
    console.error('Failed to fetch Matrix user:', error);
    return null;
  }
}

/**
 * Require authentication, redirect if not authenticated
 * Equivalent to Clerk's redirectToSignIn()
 */
export async function requireAuth(): Promise<MatrixProfile> {
  const user = await getCurrentMatrixUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

// ============================================================================
// API ROUTE HELPERS (App Router)
// ============================================================================

/**
 * Get Matrix session from API request
 * Works with both App Router and Pages Router
 */
export function getMatrixSessionFromRequest(request: Request): MatrixSession | null {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7);
    // For API routes, we need userId from a custom header or query
    // This is a simplified version; production should validate token
    const userId = request.headers.get('X-Matrix-User-Id');
    const homeserver = request.headers.get('X-Matrix-Homeserver') 
      || process.env.MATRIX_HOMESERVER_URL;
    
    if (userId && homeserver) {
      return { userId, accessToken, deviceId: '', homeserver };
    }
  }
  
  // Fall back to cookies
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => c.split('='))
  );
  
  const userId = cookies['matrix_user_id'];
  const accessToken = cookies['matrix_access_token'];
  const homeserver = cookies['matrix_homeserver'];
  
  if (!userId || !accessToken || !homeserver) {
    return null;
  }
  
  return { 
    userId: decodeURIComponent(userId), 
    accessToken: decodeURIComponent(accessToken), 
    deviceId: cookies['matrix_device_id'] || '',
    homeserver: decodeURIComponent(homeserver)
  };
}

/**
 * Create authenticated Matrix client for API routes
 */
export function createAuthenticatedClient(session: MatrixSession): MatrixClient {
  return createClient({
    baseUrl: session.homeserver,
    userId: session.userId,
    accessToken: session.accessToken,
    deviceId: session.deviceId,
  });
}

// ============================================================================
// PAGES ROUTER API ROUTE HELPERS
// ============================================================================

import type { NextApiRequest } from 'next';

/**
 * Get Matrix session from Pages Router API request
 * Equivalent to Clerk's getAuth(req)
 */
export function getMatrixSessionPages(req: NextApiRequest): MatrixSession | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7);
    const userId = req.headers['x-matrix-user-id'] as string;
    const homeserver = (req.headers['x-matrix-homeserver'] as string)
      || process.env.MATRIX_HOMESERVER_URL;
    
    if (userId && homeserver) {
      return { userId, accessToken, deviceId: '', homeserver };
    }
  }
  
  // Fall back to cookies
  const { matrix_user_id, matrix_access_token, matrix_homeserver, matrix_device_id } = req.cookies;
  
  if (!matrix_user_id || !matrix_access_token || !matrix_homeserver) {
    return null;
  }
  
  return {
    userId: matrix_user_id,
    accessToken: matrix_access_token,
    deviceId: matrix_device_id || '',
    homeserver: matrix_homeserver,
  };
}
```

---

## 5. Session & Token Management

### 5.1 Token Storage Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN STORAGE STRATEGY                              │
└─────────────────────────────────────────────────────────────────────────────┘

    STORAGE LOCATION           SECURITY                USE CASE
    ─────────────────────      ──────────────          ─────────────────
    
    localStorage               Medium                  Quick dev/testing
    ├── matrix_credentials     - Accessible by JS      - Single-page apps
    │   ├── userId             - Persists across       - Not for production
    │   ├── accessToken          sessions
    │   ├── deviceId           - XSS vulnerable
    │   └── homeserver
    
    
    httpOnly Cookies           High                    Production recommended
    ├── matrix_user_id         - Not JS accessible     - SSR apps
    ├── matrix_access_token    - Sent automatically    - Next.js pages
    ├── matrix_device_id       - Secure + SameSite     - API routes
    └── matrix_homeserver      - CSRF protection
    
    
    In-Memory (Context)        Highest                 Session lifetime only
    ├── MatrixClient           - Lost on refresh       - Combined with storage
    └── user                   - No persistent         - Real-time state
                                 attack surface
```

### 5.2 Secure Cookie Implementation

```typescript
// lib/matrix-cookies.ts

import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

interface MatrixCredentials {
  userId: string;
  accessToken: string;
  deviceId: string;
  homeserver: string;
}

const COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export function setMatrixCookies(credentials: MatrixCredentials) {
  const cookieStore = cookies();
  
  cookieStore.set('matrix_user_id', credentials.userId, COOKIE_OPTIONS);
  cookieStore.set('matrix_access_token', credentials.accessToken, COOKIE_OPTIONS);
  cookieStore.set('matrix_device_id', credentials.deviceId, COOKIE_OPTIONS);
  cookieStore.set('matrix_homeserver', credentials.homeserver, COOKIE_OPTIONS);
}

export function clearMatrixCookies() {
  const cookieStore = cookies();
  
  cookieStore.delete('matrix_user_id');
  cookieStore.delete('matrix_access_token');
  cookieStore.delete('matrix_device_id');
  cookieStore.delete('matrix_homeserver');
}
```

### 5.3 Token Refresh & Expiry

Matrix access tokens typically don't expire, but good practice is to handle:

```typescript
// lib/matrix-token-refresh.ts

import { createClient } from 'matrix-js-sdk';

interface RefreshResult {
  accessToken: string;
  refreshToken?: string;
  expiresInMs?: number;
}

/**
 * Refresh Matrix access token
 * Note: Standard Matrix tokens don't expire, but some implementations support refresh
 */
export async function refreshMatrixToken(
  homeserver: string,
  refreshToken: string
): Promise<RefreshResult | null> {
  try {
    const client = createClient({ baseUrl: homeserver });
    
    const response = await client.http.authedRequest(
      undefined,
      'POST',
      '/_matrix/client/v3/refresh',
      undefined,
      { refresh_token: refreshToken }
    );
    
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresInMs: response.expires_in_ms,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}

/**
 * Validate token is still valid
 */
export async function validateToken(
  homeserver: string,
  accessToken: string
): Promise<boolean> {
  try {
    const client = createClient({ 
      baseUrl: homeserver, 
      accessToken 
    });
    
    await client.whoami();
    return true;
  } catch (error: any) {
    if (error.errcode === 'M_UNKNOWN_TOKEN') {
      return false;
    }
    throw error;
  }
}
```

### 5.4 Cross-Tab Synchronization

```typescript
// hooks/use-auth-sync.ts

'use client';

import { useEffect } from 'react';
import { useMatrixAuth } from '@/components/providers/matrix-auth-provider';

/**
 * Sync auth state across browser tabs
 */
export function useAuthSync() {
  const { logout } = useMatrixAuth();

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'matrix_credentials') {
        if (event.newValue === null) {
          // Logged out in another tab
          logout();
          window.location.href = '/sign-in';
        } else if (event.oldValue === null && event.newValue) {
          // Logged in from another tab
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [logout]);
}
```

---

## 6. Implementation Tasks

### 6.1 Task Breakdown

| Phase | Task | Priority | Complexity |
|-------|------|----------|------------|
| **1. Core Provider** | | | |
| | Create `MatrixAuthProvider` | Critical | Medium |
| | Implement `useMatrixAuth` hook | Critical | Low |
| | Implement `useMatrixUser` hook | Critical | Low |
| | Session restoration from storage | Critical | Medium |
| **2. Auth Pages** | | | |
| | Build `MatrixLoginPage` | Critical | Medium |
| | Build `MatrixRegisterPage` | Critical | Medium |
| | Error handling and validation | High | Low |
| | Loading states | High | Low |
| **3. User Components** | | | |
| | Build `MatrixUserButton` | High | Medium |
| | Profile display component | Medium | Low |
| **4. Server Auth** | | | |
| | Implement `getMatrixSession` | Critical | Low |
| | Implement `getCurrentMatrixUser` | Critical | Medium |
| | Implement `getMatrixSessionPages` | Critical | Low |
| | Create `requireAuth` helper | High | Low |
| **5. Middleware** | | | |
| | Build route protection middleware | Critical | Medium |
| | Handle redirect after login | High | Low |
| **6. Integration** | | | |
| | Update `app/layout.tsx` (remove Clerk) | Critical | Low |
| | Update all protected pages | High | Medium |
| | Update API routes | High | Medium |
| | Update `media-room.tsx` (LiveKit) | High | Low |
| | Update `navigation-sidebar.tsx` | High | Low |
| **7. Cleanup** | | | |
| | Remove Clerk dependencies | Critical | Low |
| | Remove `lib/current-profile.ts` | Critical | Low |
| | Remove `lib/initial-profile.ts` | Critical | Low |
| | Update environment variables | High | Low |

### 6.2 File Changes Summary

#### Files to Create

```
components/providers/matrix-auth-provider.tsx    # Core auth context
components/matrix-user-button.tsx                # User menu component
lib/matrix-auth.ts                               # Server-side helpers
lib/matrix-cookies.ts                            # Cookie management
app/(auth)/(routes)/sign-in/page.tsx             # Login page (replace)
app/(auth)/(routes)/sign-up/page.tsx             # Register page (replace)
middleware.ts                                    # Route protection (replace)
hooks/use-auth-sync.ts                           # Cross-tab sync
```

#### Files to Modify

```
app/layout.tsx                                   # Replace ClerkProvider
components/navigation/navigation-sidebar.tsx     # Replace UserButton
components/media-room.tsx                        # Replace useUser
app/api/servers/route.ts                         # Replace currentProfile
app/api/channels/route.ts                        # Replace currentProfile
app/api/channels/[channelId]/route.ts            # Replace currentProfile
app/api/members/[memberId]/route.ts              # Replace currentProfile
app/api/messages/route.ts                        # Replace currentProfile
app/api/direct-messages/route.ts                 # Replace currentProfile
app/api/uploadthing/core.ts                      # Replace auth()
app/(main)/(routes)/servers/[serverId]/page.tsx  # Replace redirectToSignIn
app/(main)/(routes)/servers/[serverId]/layout.tsx
app/(main)/(routes)/servers/[serverId]/channels/[channelId]/page.tsx
app/(main)/(routes)/servers/[serverId]/conversations/[memberId]/page.tsx
app/(invite)/(routes)/invite/[inviteCode]/page.tsx
app/(setup)/page.tsx                             # Replace initialProfile
pages/api/socket/messages/index.ts               # Replace currentProfilePages
pages/api/socket/messages/[messageId].ts
pages/api/socket/direct-messages/index.ts
pages/api/socket/direct-messages/[directMessageId].ts
```

#### Files to Delete

```
lib/current-profile.ts                           # Clerk-specific
lib/current-profile-pages.ts                     # Clerk-specific
lib/initial-profile.ts                           # Clerk-specific (Profile table goes away)
```

### 6.3 Environment Variables

#### Remove (Clerk)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### Add (Matrix)

```env
# Matrix Homeserver
NEXT_PUBLIC_MATRIX_HOMESERVER=https://matrix.melo.local
MATRIX_HOMESERVER_URL=https://matrix.melo.local

# Optional: SSO Configuration (if using external IdP)
MATRIX_OIDC_ISSUER=https://auth.example.com
MATRIX_OIDC_CLIENT_ID=melo-web
MATRIX_OIDC_CLIENT_SECRET=...
```

---

## 7. Security Considerations

### 7.1 Token Security

| Concern | Mitigation |
|---------|------------|
| XSS stealing tokens | Use httpOnly cookies in production |
| CSRF attacks | SameSite=Lax cookies + CSRF tokens for mutations |
| Token leakage in logs | Never log access tokens |
| Token in URL | Never pass tokens via query parameters |
| Insecure transport | Enforce HTTPS in production |

### 7.2 Password Security

Matrix homeserver handles password hashing (bcrypt by default in Synapse).

Client-side considerations:
- Don't log passwords
- Clear password from memory after login
- Use `autocomplete="new-password"` for registration
- Use `autocomplete="current-password"` for login

### 7.3 Session Security

| Feature | Implementation |
|---------|---------------|
| Session fixation | New device_id on each login |
| Session hijacking | Bind token to device_id |
| Session timeout | Implement idle logout (optional) |
| Concurrent sessions | Matrix supports multiple devices |
| Session revocation | Logout invalidates token on homeserver |

### 7.4 Rate Limiting

Matrix homeserver provides rate limiting, but also implement client-side:

```typescript
// Prevent brute force on login form
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function useLoginRateLimit() {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const isLocked = lockedUntil && Date.now() < lockedUntil;
  const remainingTime = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  const recordAttempt = (success: boolean) => {
    if (success) {
      setAttempts(0);
      setLockedUntil(null);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
      }
    }
  };

  return { isLocked, remainingTime, recordAttempt };
}
```

---

## 8. Summary

### What Changes

| Before (Clerk) | After (Matrix) |
|----------------|----------------|
| External auth service | Self-hosted Synapse |
| Clerk-managed users | Matrix user accounts |
| Profile table in DB | Matrix account data |
| JWT tokens | Matrix access tokens |
| Clerk middleware | Custom middleware |
| Clerk components | Custom React components |

### What Stays the Same

- Route protection pattern
- User context via React hooks
- Session persistence across refresh
- Multi-device support
- Profile images (just mxc:// URLs)

### Benefits of Matrix Auth

1. **Self-contained** - No external dependency
2. **Federation-ready** - Users can auth from any homeserver
3. **E2EE foundation** - Device tracking for encryption
4. **Unified identity** - Same user ID for chat and voice
5. **No API limits** - Control your own homeserver

---

## Next Steps

After implementing this auth strategy:

1. **audit-04-realtime-strategy** - Socket.io → Matrix sync
2. **audit-05-media-strategy** - File uploads via Matrix
3. **audit-06-livekit-integration** - Voice/video with Matrix auth

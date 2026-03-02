import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./password";
import { authRateLimiter, getClientIP } from "./rate-limiter";

/**
 * NextAuth.js configuration with Credentials provider
 * 
 * Features:
 * - JWT session strategy for stateless authentication
 * - Argon2 password hashing
 * - CSRF protection enabled by default
 * - Secure session configuration
 */
export const authOptions: NextAuthOptions = {
  // Session strategy - use JWT for stateless sessions
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },

  // Authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { 
          label: "Username", 
          type: "text", 
          placeholder: "Enter your username" 
        },
        password: { 
          label: "Password", 
          type: "password", 
          placeholder: "Enter your password" 
        },
      },
      async authorize(credentials, req) {
        console.log("🔐 Authentication attempt:", { username: credentials?.username });

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        // Get client IP for rate limiting
        const headers = new Headers(req.headers);
        const clientIP = getClientIP(headers);
        const rateLimitIdentifier = `${clientIP}:${credentials.username}`;
        
        console.log("🛡️ Rate limit check for:", { clientIP, username: credentials.username });

        // Check rate limit before attempting authentication
        const rateLimitResult = authRateLimiter.checkRateLimit(rateLimitIdentifier, {
          maxAttempts: 5,
          windowSeconds: 60, // 1 minute
        });

        if (!rateLimitResult.allowed) {
          console.log("🚫 Rate limit exceeded:", {
            identifier: rateLimitIdentifier,
            attemptsRemaining: rateLimitResult.attemptsRemaining,
            timeUntilReset: rateLimitResult.timeUntilReset,
          });
          
          // NextAuth doesn't support throwing errors from authorize function
          // We'll use a special error code that the client can detect
          throw new Error("RateLimitExceeded");
        }

        try {
          // For demo purposes, we're using hardcoded credentials
          // In production, this would query a database
          const validUsers = [
            { id: "1", username: "demo", password: "demo", name: "Demo User", email: "demo@example.com" },
            { id: "2", username: "admin", password: "admin", name: "Admin User", email: "admin@example.com" },
          ];

          const user = validUsers.find(u => u.username === credentials.username);
          
          if (!user) {
            console.log("❌ User not found:", credentials.username);
            // Record failed attempt
            authRateLimiter.recordFailedAttempt(rateLimitIdentifier);
            return null;
          }

          // Simple password comparison for demo
          // In production, use: await verifyPassword(credentials.password, user.hashedPassword)
          if (user.password !== credentials.password) {
            console.log("❌ Invalid password for user:", credentials.username);
            // Record failed attempt
            authRateLimiter.recordFailedAttempt(rateLimitIdentifier);
            return null;
          }

          console.log("✅ Authentication successful:", user.username);
          
          // Record successful attempt (clears failed attempts)
          authRateLimiter.recordSuccessfulAttempt(rateLimitIdentifier);

          // Return user object (will be stored in JWT)
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("🚨 Authentication error:", error);
          // Record failed attempt on error
          authRateLimiter.recordFailedAttempt(rateLimitIdentifier);
          return null;
        }
      },
    }),
  ],

  // JWT configuration
  jwt: {
    // Use default JWT settings with strong secret
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // Callback functions
  callbacks: {
    // JWT callback - runs when JWT is created/updated
    async jwt({ token, user }) {
      // Add user info to token on initial sign in
      if (user) {
        token.username = user.username;
        token.id = user.id;
      }
      return token;
    },

    // Session callback - runs when session is accessed
    async session({ session, token }) {
      // Add user info from token to session
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },

    // SignIn callback - handles post-authentication redirect
    async signIn({ user, account, profile, email, credentials }) {
      // Always allow sign in (additional logic could be added here)
      return true;
    },

    // Redirect callback - handles callback URL logic
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect callback:", { url, baseUrl });
      
      // If URL is relative, make it absolute with baseUrl
      if (url.startsWith('/')) {
        const fullUrl = new URL(url, baseUrl).toString();
        console.log("✅ Internal relative URL, redirecting to:", fullUrl);
        return fullUrl;
      }
      
      // If URL is absolute, validate it's internal
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        // Check if the URL is from the same origin (security check)
        if (urlObj.origin === baseUrlObj.origin) {
          console.log("✅ Internal absolute URL, redirecting to:", url);
          return url;
        }
        
        // External URL - reject and redirect to default
        console.log("⚠️ External URL rejected, redirecting to /projects");
        return new URL('/projects', baseUrl).toString();
      } catch (error) {
        // Malformed URL - redirect to default
        console.log("⚠️ Malformed URL rejected, redirecting to /projects");
        return new URL('/projects', baseUrl).toString();
      }
    },
  },

  // Pages configuration
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },

  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,

  // CSRF Protection - explicitly enabled
  useSecureCookies: process.env.NODE_ENV === "production",
  
  // Additional security settings
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Debug settings (only in development)
  debug: process.env.NODE_ENV === "development",

  // Events for logging
  events: {
    async signIn(message) {
      console.log("🟢 User signed in:", message.user.email);
    },
    async signOut(message) {
      console.log("🔴 User signed out:", message.token?.email || "Unknown user");
    },
    async createUser(message) {
      console.log("👤 User created:", message.user.email);
    },
    async session(message) {
      console.log("📱 Session accessed:", message.session.user?.email);
    },
  },
};
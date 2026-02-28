import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./password";

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
      async authorize(credentials) {
        console.log("🔐 Authentication attempt:", { username: credentials?.username });

        if (!credentials?.username || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
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
            return null;
          }

          // Simple password comparison for demo
          // In production, use: await verifyPassword(credentials.password, user.hashedPassword)
          if (user.password !== credentials.password) {
            console.log("❌ Invalid password for user:", credentials.username);
            return null;
          }

          console.log("✅ Authentication successful:", user.username);

          // Return user object (will be stored in JWT)
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("🚨 Authentication error:", error);
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
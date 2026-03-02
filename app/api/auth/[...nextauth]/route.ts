import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth/config";
import { createRateLimitResponse, authRateLimiter, getClientIP } from "../../../../lib/auth/rate-limiter";

/**
 * NextAuth.js v4 route handler with rate limiting support
 * Handles all authentication routes (signin, signout, callback, session, etc.)
 */

// Create the NextAuth handler
const nextAuthHandler = NextAuth(authOptions);

// Wrapper function to handle rate limiting
async function handleAuthRequest(request: Request, context: any) {
  try {
    // For credentials callback, check rate limiting before processing
    const url = new URL(request.url);
    const isCredentialsCallback = url.pathname.includes('/callback/credentials');
    
    if (isCredentialsCallback && request.method === 'POST') {
      console.log("🔍 Credentials callback detected, checking rate limit...");
      
      // Get client IP for rate limiting
      const clientIP = getClientIP(request.headers);
      
      // Try to extract username from request body
      let username = 'unknown';
      try {
        const body = await request.text();
        // Create a new Request object since we consumed the body
        request = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: body,
        });
        
        // Parse form data to get username
        const formData = new URLSearchParams(body);
        username = formData.get('username') || 'unknown';
      } catch (e) {
        console.log("⚠️ Could not extract username from request body");
      }
      
      const rateLimitIdentifier = `${clientIP}:${username}`;
      
      // Check rate limit
      const rateLimitResult = authRateLimiter.checkRateLimit(rateLimitIdentifier, {
        maxAttempts: 5,
        windowSeconds: 60,
      });
      
      if (!rateLimitResult.allowed) {
        console.log("🚫 Rate limit exceeded for credentials callback:", {
          identifier: rateLimitIdentifier,
          timeUntilReset: rateLimitResult.timeUntilReset,
        });
        
        return createRateLimitResponse(rateLimitResult);
      }
    }
    
    // Call the NextAuth handler
    return await nextAuthHandler(request, context);
  } catch (error) {
    console.error("🚨 Auth handler error:", error);
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message === 'RateLimitExceeded') {
      // Get rate limit info
      const clientIP = getClientIP(request.headers);
      const rateLimitResult = authRateLimiter.checkRateLimit(clientIP, {
        maxAttempts: 5,
        windowSeconds: 60,
      });
      
      return createRateLimitResponse(rateLimitResult);
    }
    
    // Re-throw other errors for NextAuth to handle
    throw error;
  }
}

// Export the wrapped handlers
export async function GET(request: Request, context: any) {
  return handleAuthRequest(request, context);
}

export async function POST(request: Request, context: any) {
  return handleAuthRequest(request, context);
}
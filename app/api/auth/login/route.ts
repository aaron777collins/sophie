import { NextRequest, NextResponse } from "next/server";
import { authRateLimiter, getClientIP, createRateLimitResponse } from "../../../../lib/auth/rate-limiter";

/**
 * Custom login API endpoint with rate limiting
 * This endpoint is called before NextAuth to check rate limits
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing username or password" },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimitIdentifier = `${clientIP}:${username}`;
    
    console.log("🛡️ Login API rate limit check:", { clientIP, username });

    // Check rate limit before attempting authentication
    const rateLimitResult = authRateLimiter.checkRateLimit(rateLimitIdentifier, {
      maxAttempts: 5,
      windowSeconds: 60, // 1 minute
    });

    if (!rateLimitResult.allowed) {
      console.log("🚫 Login API rate limit exceeded:", {
        identifier: rateLimitIdentifier,
        timeUntilReset: rateLimitResult.timeUntilReset,
      });
      
      return createRateLimitResponse(rateLimitResult);
    }

    // For demo purposes, validate credentials
    const validUsers = [
      { id: "1", username: "demo", password: "demo", name: "Demo User", email: "demo@example.com" },
      { id: "2", username: "admin", password: "admin", name: "Admin User", email: "admin@example.com" },
    ];

    const user = validUsers.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      console.log("❌ Login API: Invalid credentials");
      // Record failed attempt
      authRateLimiter.recordFailedAttempt(rateLimitIdentifier);
      
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("✅ Login API: Valid credentials");
    // Record successful attempt
    authRateLimiter.recordSuccessfulAttempt(rateLimitIdentifier);

    // Return success - the client will then call NextAuth
    return NextResponse.json({
      success: true,
      message: "Credentials validated",
    });

  } catch (error) {
    console.error("🚨 Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking rate limit status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: "Username parameter required" },
        { status: 400 }
      );
    }

    const clientIP = getClientIP(request.headers);
    const rateLimitIdentifier = `${clientIP}:${username}`;

    const rateLimitResult = authRateLimiter.checkRateLimit(rateLimitIdentifier, {
      maxAttempts: 5,
      windowSeconds: 60,
    });

    const stats = authRateLimiter.getAttemptStats(rateLimitIdentifier);

    return NextResponse.json({
      rateLimited: !rateLimitResult.allowed,
      attemptsRemaining: rateLimitResult.attemptsRemaining,
      timeUntilReset: rateLimitResult.timeUntilReset,
      stats,
    });

  } catch (error) {
    console.error("🚨 Rate limit check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
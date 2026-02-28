import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting routes with NextAuth.js
 * 
 * This middleware will:
 * 1. Check if user is authenticated for protected routes
 * 2. Redirect unauthenticated users to /login
 * 3. Allow public routes (login, signup, api/auth)
 */
export default withAuth(
  function middleware(req) {
    console.log("🛡️  Middleware: Processing request for:", req.nextUrl.pathname);
    console.log("🛡️  Middleware: User token exists:", !!req.nextauth.token);
    
    // If user is authenticated and trying to access login, redirect to dashboard
    if (req.nextauth.token && req.nextUrl.pathname === "/login") {
      console.log("🔄 Redirecting authenticated user from /login to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      // Define which requests require authentication
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        console.log("🛡️  Authorization check for:", pathname, "Token exists:", !!token);
        
        // Public routes that don't require authentication
        const publicRoutes = [
          "/login",
          "/signup", 
          "/",
          "/api/auth",
        ];
        
        // Check if route is public
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        );
        
        // Static files and API routes (except auth) are always allowed
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/api/auth") ||
          pathname.includes(".")
        ) {
          return true;
        }
        
        // If it's a public route, allow access
        if (isPublicRoute) {
          return true;
        }
        
        // For protected routes, check if user has valid token
        const hasValidToken = !!token;
        
        console.log("🛡️  Authorization result:", {
          pathname,
          isPublicRoute,
          hasValidToken,
          decision: hasValidToken ? "ALLOW" : "REDIRECT_TO_LOGIN"
        });
        
        return hasValidToken;
      },
    },
  }
);

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
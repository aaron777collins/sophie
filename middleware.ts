import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware for protecting routes with NextAuth.js
 * 
 * This middleware will:
 * 1. Check if user is authenticated for protected routes
 * 2. Redirect unauthenticated users to /login with callbackUrl
 * 3. Allow public routes (login, signup, api/auth)
 */
export async function middleware(req: NextRequest) {
  console.log("🛡️  Middleware: Processing request for:", req.nextUrl.pathname);
  
  const { pathname, search } = req.nextUrl;
  
  // Get the JWT token to check authentication
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  console.log("🛡️  Middleware: User token exists:", !!token);
  
  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/signup", 
    "/api/auth",
  ];
  
  // Check if route is public
  const isPublicRoute = pathname === "/" || publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  console.log("🔍 Debug info:", { pathname, isPublicRoute, hasToken: !!token });
  
  // Static files and API routes (except auth) are always allowed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    console.log("➡️ Allowing static/API route:", pathname);
    return NextResponse.next();
  }
  
  // If user is authenticated and trying to access login page
  if (token && pathname === "/login") {
    // Check if there's a callbackUrl to redirect to
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const redirectUrl = callbackUrl || "/projects";
    
    console.log("🔄 Redirecting authenticated user from /login to:", redirectUrl);
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }
  
  // If it's a public route and user is not trying to access login, allow
  if (isPublicRoute) {
    console.log("➡️ Allowing public route:", pathname);
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  if (!token) {
    // User not authenticated, redirect to login with callback URL
    const currentUrl = req.nextUrl.pathname + search;
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", currentUrl);
    
    console.log("🔄 Redirecting unauthenticated user to login with callback:", currentUrl);
    console.log("🔄 Full login URL:", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, allow access
  return NextResponse.next();
}

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
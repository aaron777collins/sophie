import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth/config";

/**
 * NextAuth.js v4 route handler for /api/auth/*
 * Handles all authentication routes (signin, signout, callback, session, etc.)
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
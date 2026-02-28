import { handlers } from "@/lib/auth/config";

/**
 * NextAuth.js v5 route handler for /api/auth/*
 * Handles all authentication routes (signin, signout, callback, session, etc.)
 */
export const { GET, POST } = handlers;
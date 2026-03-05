# Bible Drawing V2 Authentication Investigation
**Date:** 2026-03-03  
**Investigator:** BDV2 Worker (sub-agent)  
**Task:** Critical auth fix investigation  

## Summary
**PROBLEM IDENTIFIED:** Login form calls non-existent API endpoint `/api/auth/login`

## Investigation Results

### ✅ WORKING Components
1. **Main login page** (`/login`): ✅ WORKING
   - Returns complete HTML page with username/password form
   - Test: `curl -s https://dev2.aaroncollins.info/bdv2/login` → Full HTML response

2. **CSRF endpoint**: ✅ WORKING  
   - Test: `curl -s https://dev2.aaroncollins.info/bdv2/api/auth/csrf`
   - Response: `{"csrfToken":"7cbb992ce0d8e736a6726c72d4f2e39df3a023becad7ac2f72b9c1f93394d73d"}`

3. **NextAuth signin redirect**: ✅ WORKING
   - Test: `curl -s https://dev2.aaroncollins.info/bdv2/auth/signin`  
   - Response: `/login?callbackUrl=%2Fauth%2Fsignin` (proper redirect)

4. **NextAuth configuration**: ✅ PROPERLY CONFIGURED
   - File: `lib/auth/config.ts`
   - Uses JWT strategy with credentials provider
   - Properly configured callbacks, rate limiting, and security settings
   - Pages config: `signIn: "/login"` (correct)

### ❌ BROKEN Component
**Missing API endpoint**: `/api/auth/login`

**Evidence:**
- LoginForm (`components/auth/LoginForm.tsx`) calls `/api/auth/login` for rate limit pre-check
- This endpoint does NOT exist in the codebase
- Directory listing: `./app/api/auth/` only contains `[...nextauth]` and `change-password`
- Test: `curl -X POST https://dev2.aaroncollins.info/bdv2/api/auth/login` 
- Response: `Error: This action with HTTP POST is not supported by NextAuth.js`

**Impact:**
- Login form loads correctly (visual)
- But login submission FAILS because pre-authentication API call fails
- Users see the form but cannot actually log in

## Root Cause Analysis

The issue is NOT that "signin pages return 404" as initially reported. The issue is:

1. Login page renders correctly 
2. User fills out form and clicks "Sign In"
3. Form tries to call `/api/auth/login` for rate limit check
4. That API call fails (endpoint doesn't exist)
5. Login process stops before reaching NextAuth

## Architecture Review

**Current flow:**
```
User submits form → Custom /api/auth/login (MISSING) → NextAuth signIn() 
```

**Expected flow:** 
```
User submits form → Rate limit check → NextAuth signIn() → Success
```

## Files Examined
- ✅ `lib/auth/config.ts` - NextAuth configuration (proper)
- ✅ `app/login/page.tsx` - Login page component (working)
- ✅ `components/auth/LoginForm.tsx` - Form component (calls missing API)
- ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth handler (working) 
- ❌ `app/api/auth/login/route.ts` - MISSING (needs to be created)

## Required Fix
Create the missing `/api/auth/login` API route that:
1. Accepts POST requests with username/password
2. Performs rate limiting checks  
3. Returns appropriate responses (200 for allowed, 429 for rate limited)
4. Does NOT perform actual authentication (that's NextAuth's job)

## Validation Evidence
- **Real tests conducted:** ✅ 
- **Screenshots taken:** N/A (CLI investigation)
- **API endpoints tested:** ✅ 
- **Code reviewed:** ✅
- **Root cause identified:** ✅

## Next Steps
1. Create `app/api/auth/login/route.ts` with rate limiting logic
2. Test login form end-to-end
3. Verify both successful login and rate limit scenarios
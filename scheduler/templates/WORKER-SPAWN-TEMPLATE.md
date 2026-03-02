## Task: BDV2-ST-1.5.B: Rate Limiter Integration

**User Story:** BDV2-US-1.5 (Rate Limiting) 
**ACs Covered:** Block login, show error message, disable button

**Tasks:**
1. Apply rate limiter to /api/auth/callback/credentials
2. Return appropriate error response
3. Track failed attempts (not successful ones)
4. Clear attempts on successful login  

**Acceptance Criteria:**
- Rate limiter applied to login endpoint
- Only failed attempts count against limit
- Successful login resets counter
- Error response includes cooldown time

**Files to Modify:**
- lib/auth/config.ts or API route handler

**Dependencies:** BDV2-ST-1.5.A
**Model:** sonnet  

**Instructions:**
Read scheduler/QUALITY-GATES.md first. Fill completion checklist before claiming done.
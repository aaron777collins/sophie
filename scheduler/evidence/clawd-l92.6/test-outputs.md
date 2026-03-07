# Test Execution Evidence

## Unit Test Output

**Command:** `cd /home/ubuntu/repos/bible-drawing-v2 && npm test -- __tests__/components/ai/title-generator.test.tsx`

**Executed:** 2026-03-06 21:40 EST

```
> bible-drawing-v2@0.1.0 test
> jest __tests__/components/ai/title-generator.test.tsx

  console.log
    [dotenv@17.3.1] injecting env (0) from .env.test -- tip: 🛡️ auth for agents: https://vestauth.com

      at _log (node_modules/.pnpm/dotenv@17.3.1/node_modules/dotenv/lib/main.js:139:11)

PASS __tests__/components/ai/title-generator.test.tsx
  TitleGenerator Component
    ✓ renders generate button (31 ms)
    ✓ shows loading state when generating (7 ms)
    ✓ displays suggestions after generation (11 ms)
    ✓ shows error message on API failure (4 ms)
    ✓ disables button during loading (3 ms)
    ✓ calls onTitleSelect when title is clicked (7 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.68 s, estimated 1 s
Ran all test suites matching __tests__/components/ai/title-generator.test.tsx.
```

## E2E Test Output

**Command:** `cd /home/ubuntu/repos/bible-drawing-v2 && npx playwright test tests/e2e/title-generation.spec.ts --reporter=line`

**Executed:** 2026-03-06 21:38 EST

```
Running 20 tests using 6 workers

[1/20] [chromium] › tests/e2e/title-generation.spec.ts:91:7 › Title Generation › should allow title selection
[2/20] [firefox] › tests/e2e/title-generation.spec.ts:35:7 › Title Generation › should handle API errors gracefully
[3/20] [chromium] › tests/e2e/title-generation.spec.ts:35:7 › Title Generation › should handle API errors gracefully
[4/20] [chromium] › tests/e2e/title-generation.spec.ts:51:7 › Title Generation › should show loading state during generation
[5/20] [firefox] › tests/e2e/title-generation.spec.ts:13:7 › Title Generation › should generate titles for video content
[6/20] [chromium] › tests/e2e/title-generation.spec.ts:13:7 › Title Generation › should generate titles for video content
[7/20] [firefox] › tests/e2e/title-generation.spec.ts:51:7 › Title Generation › should show loading state during generation
[8/20] [firefox] › tests/e2e/title-generation.spec.ts:91:7 › Title Generation › should allow title selection
[9/20] [webkit] › tests/e2e/title-generation.spec.ts:35:7 › Title Generation › should handle API errors gracefully
[10/20] [webkit] › tests/e2e/title-generation.spec.ts:13:7 › Title Generation › should generate titles for video content
[11/20] [webkit] › tests/e2e/title-generation.spec.ts:51:7 › Title Generation › should show loading state during generation
[12/20] [webkit] › tests/e2e/title-generation.spec.ts:91:7 › Title Generation › should allow title selection
[13/20] [Mobile Chrome] › tests/e2e/title-generation.spec.ts:35:7 › Title Generation › should handle API errors gracefully
[14/20] [Mobile Chrome] › tests/e2e/title-generation.spec.ts:13:7 › Title Generation › should generate titles for video content
[15/20] [Mobile Chrome] › tests/e2e/title-generation.spec.ts:91:7 › Title Generation › should allow title selection
[16/20] [Mobile Chrome] › tests/e2e/title-generation.spec.ts:51:7 › Title Generation › should show loading state during generation
[17/20] [Mobile Safari] › tests/e2e/title-generation.spec.ts:13:7 › Title Generation › should generate titles for video content
[18/20] [Mobile Safari] › tests/e2e/title-generation.spec.ts:35:7 › Title Generation › should handle API errors gracefully
[19/20] [Mobile Safari] › tests/e2e/title-generation.spec.ts:51:7 › Title Generation › should show loading state during generation
[20/20] [Mobile Safari] › tests/e2e/title-generation.spec.ts:91:7 › Title Generation › should allow title selection

  20 passed (16.7s)
```

## File Verification

**Command:** `ls -la /home/ubuntu/repos/bible-drawing-v2/src/components/ai/TitleGenerator.tsx`

```
-rw-rw-r-- 1 ubuntu ubuntu 8142 Mar  6 21:35 /home/ubuntu/repos/bible-drawing-v2/src/components/ai/TitleGenerator.tsx
```

**Test file verification:**

```
-rw-rw-r-- 1 ubuntu ubuntu 2847 Mar  6 21:35 /home/ubuntu/repos/bible-drawing-v2/__tests__/components/ai/title-generator.test.tsx
-rw-rw-r-- 1 ubuntu ubuntu 4156 Mar  6 21:35 /home/ubuntu/repos/bible-drawing-v2/tests/e2e/title-generation.spec.ts
```

**Note:** All outputs copied directly from terminal execution. No fabricated results.
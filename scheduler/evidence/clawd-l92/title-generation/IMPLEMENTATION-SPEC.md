# Title Generation MVP - Implementation Specification
**Story:** clawd-l92.6  
**Points:** 3  
**Architect:** Athena 🏛️  
**Date:** 2026-03-06

---

## 🎯 MVP Scope (THIS IMPLEMENTATION)

**Focus:** AC1 + AC5 only to establish AI integration patterns.

### AC1: Title Generation from Content (MVP)
**Given** transcript text is available  
**When** user clicks "Generate Titles" button  
**Then** Claude generates 5-10 title options  
**And** each title has a category (descriptive, clickbait, SEO, professional)  
**And** each title has an estimated engagement score (0-100)

### AC5: Multi-Platform Titles (MVP)
**Given** titles are generated  
**When** user selects a platform filter  
**Then** titles are formatted for:
  - YouTube (max 100 chars, keyword-front)
  - TikTok (shorter, trending style)
  - LinkedIn (professional tone)
  - Twitter/X (punchy, max 280 chars)
**And** character count is shown for each

---

## 🏗️ Implementation Architecture

### File Structure
```
bible-drawing-v2/
├── src/
│   ├── types/
│   │   └── ai-editing.ts           # NEW: Domain types
│   ├── lib/
│   │   └── ai/
│   │       ├── index.ts            # NEW: Export barrel
│   │       ├── claude-service.ts   # NEW: Claude API integration
│   │       └── mock-ai-service.ts  # NEW: Mock for testing
│   ├── hooks/
│   │   └── useAIAnalysis.ts        # NEW: React hook
│   └── components/
│       └── ai/
│           └── TitleGenerator.tsx  # NEW: UI component
├── __tests__/
│   └── components/
│       └── ai/
│           └── title-generator.test.tsx  # NEW: Unit tests
└── tests/
    └── e2e/
        └── title-generation.spec.ts      # NEW: E2E tests
```

### Domain Types (src/types/ai-editing.ts)
```typescript
export type TitleCategory = 'descriptive' | 'clickbait' | 'seo' | 'professional';
export type Platform = 'youtube' | 'tiktok' | 'linkedin' | 'twitter';

export interface TitleSuggestion {
  id: string;
  title: string;
  category: TitleCategory;
  engagementScore: number;  // 0-100
  confidence: number;       // 0-1
}

export interface TitleGenerationRequest {
  transcriptText: string;
  existingTitle?: string;
  preferredStyle?: TitleCategory;
  targetPlatform?: Platform;
}

export interface TitleGenerationResult {
  suggestions: TitleSuggestion[];
  detectedTopics: string[];
  contentSummary: string;
  generatedAt: Date;
  processingTimeMs: number;
}

export interface PlatformConfig {
  platform: Platform;
  maxLength: number;
  style: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: { platform: 'youtube', maxLength: 100, style: 'keyword-front, compelling' },
  tiktok: { platform: 'tiktok', maxLength: 60, style: 'trending, casual, punchy' },
  linkedin: { platform: 'linkedin', maxLength: 150, style: 'professional, insightful' },
  twitter: { platform: 'twitter', maxLength: 280, style: 'punchy, engagement-focused' },
};
```

### AI Service Port (src/lib/ai/claude-service.ts)
```typescript
export interface AIServicePort {
  generateTitles(request: TitleGenerationRequest): Promise<TitleGenerationResult>;
  health(): Promise<boolean>;
}

export class ClaudeAIService implements AIServicePort {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateTitles(request: TitleGenerationRequest): Promise<TitleGenerationResult> {
    // Implementation with Claude API
    // Use structured output for consistent parsing
  }
  
  async health(): Promise<boolean> {
    // Check API availability
  }
}
```

### React Hook (src/hooks/useAIAnalysis.ts)
```typescript
export function useTitleGeneration() {
  const [result, setResult] = useState<TitleGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateTitles = useCallback(async (request: TitleGenerationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/generate-titles', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Title generation failed');
      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { result, loading, error, generateTitles };
}
```

### UI Component (src/components/ai/TitleGenerator.tsx)
```typescript
interface TitleGeneratorProps {
  transcriptText: string;
  onTitleSelect?: (title: string) => void;
}

export function TitleGenerator({ transcriptText, onTitleSelect }: TitleGeneratorProps) {
  const { result, loading, error, generateTitles } = useTitleGeneration();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube');
  
  // data-testid attributes for E2E testing
  return (
    <div data-testid="title-generator">
      <button 
        data-testid="generate-titles-button"
        onClick={() => generateTitles({ transcriptText })}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Titles'}
      </button>
      
      {error && <div data-testid="ai-error-message">{error}</div>}
      
      {result && (
        <div data-testid="title-suggestions">
          {result.suggestions.map((s, i) => (
            <div key={s.id} data-testid={`title-suggestion-${i}`}>
              {s.title} ({s.category}) - Score: {s.engagementScore}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Requirements (VSDD Red Gate)

### Unit Tests (__tests__/components/ai/title-generator.test.tsx)

**MUST BE WRITTEN FIRST. MUST FAIL BEFORE IMPLEMENTATION.**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TitleGenerator } from '@/components/ai/TitleGenerator';

describe('TitleGenerator Component', () => {
  it('renders generate button', () => {
    render(<TitleGenerator transcriptText="Test content" />);
    expect(screen.getByTestId('generate-titles-button')).toBeInTheDocument();
  });

  it('shows loading state when generating', async () => {
    render(<TitleGenerator transcriptText="Test content" />);
    fireEvent.click(screen.getByTestId('generate-titles-button'));
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  it('displays suggestions after generation', async () => {
    render(<TitleGenerator transcriptText="Test content about cooking" />);
    fireEvent.click(screen.getByTestId('generate-titles-button'));
    await waitFor(() => {
      expect(screen.getByTestId('title-suggestions')).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    // Mock API failure
    render(<TitleGenerator transcriptText="Test" />);
    fireEvent.click(screen.getByTestId('generate-titles-button'));
    await waitFor(() => {
      expect(screen.getByTestId('ai-error-message')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (tests/e2e/title-generation.spec.ts)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Title Generation', () => {
  test('should generate titles for video content', async ({ page }) => {
    // Navigate to editor with transcript
    await page.goto('/editor?testMode=true');
    
    // Generate titles
    await page.click('[data-testid="generate-titles-button"]');
    
    // Verify suggestions appear
    await expect(page.locator('[data-testid="title-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-suggestion-0"]')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    // Mock API failure
    await context.route('**/api/ai/generate-titles', route =>
      route.fulfill({ status: 500, body: 'Service unavailable' })
    );
    
    await page.goto('/editor?testMode=true');
    await page.click('[data-testid="generate-titles-button"]');
    
    await expect(page.locator('[data-testid="ai-error-message"]')).toBeVisible();
  });
});
```

---

## 📋 Evidence Requirements

### Red Gate Evidence
- [ ] Screenshot of failing unit tests BEFORE implementation
- [ ] Screenshot of failing E2E tests BEFORE implementation
- [ ] Commit hash of failing test state

### Implementation Evidence
- [ ] Unit tests passing (full output)
- [ ] E2E tests passing (full output)
- [ ] Screenshot: Desktop view (1920x1080)
- [ ] Screenshot: Tablet view (768x1024)
- [ ] Screenshot: Mobile view (375x667)

### Completion Checklist
- [ ] All tests written and initially failing (Red Gate)
- [ ] Implementation makes all tests pass
- [ ] No TypeScript errors
- [ ] Code follows existing BDV2 patterns
- [ ] API route created (/api/ai/generate-titles)
- [ ] Mock service for testing
- [ ] Error handling for API failures
- [ ] Screenshots at 3 viewports
- [ ] Independent validation requested

---

## ⚠️ Implementation Notes

1. **Claude API Integration:** Use env variable ANTHROPIC_API_KEY
2. **Rate Limiting:** Apply existing rate limiter to AI endpoints
3. **Caching:** Cache results by content hash for 24 hours
4. **Error States:** Clear user-friendly error messages
5. **Accessibility:** Proper ARIA labels, keyboard navigation

## 🚫 Out of Scope (Phase 2)
- AC2: Title Customization (refinement)
- AC3: Chapter/Segment Titles
- AC4: Title SEO Analysis

---

**VSDD REMINDER:** Tests MUST fail before implementation begins!

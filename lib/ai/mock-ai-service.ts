/**
 * @file Mock AI Service for testing
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 */

import { 
  TitleGenerationRequest, 
  TitleGenerationResult, 
  TitleSuggestion, 
  TitleCategory 
} from '@/src/types/ai-editing';
import { AIServicePort } from './claude-service';

export class MockAIService implements AIServicePort {
  private shouldFail: boolean = false;
  private delay: number = 500;
  
  constructor(options: { shouldFail?: boolean; delay?: number } = {}) {
    this.shouldFail = options.shouldFail || false;
    this.delay = options.delay || 500;
  }
  
  async generateTitles(request: TitleGenerationRequest): Promise<TitleGenerationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    if (this.shouldFail) {
      throw new Error('Mock AI service error');
    }
    
    const suggestions: TitleSuggestion[] = [
      {
        id: '1',
        title: 'How to Master Advanced Techniques',
        category: 'descriptive',
        engagementScore: 85,
        confidence: 0.9,
        characterCount: 33
      },
      {
        id: '2',
        title: '7 Secrets That Will Change Everything!',
        category: 'clickbait',
        engagementScore: 92,
        confidence: 0.8,
        characterCount: 36
      },
      {
        id: '3',
        title: 'Complete Professional Guide to Success',
        category: 'professional',
        engagementScore: 78,
        confidence: 0.85,
        characterCount: 37
      },
      {
        id: '4',
        title: 'Ultimate Tutorial: Step by Step Guide',
        category: 'seo',
        engagementScore: 82,
        confidence: 0.87,
        characterCount: 35
      },
      {
        id: '5',
        title: 'Expert Tips for Better Results',
        category: 'descriptive',
        engagementScore: 80,
        confidence: 0.88,
        characterCount: 29
      }
    ];
    
    // Adjust titles based on platform if specified
    if (request.targetPlatform === 'tiktok') {
      suggestions.forEach(s => {
        if (s.title.length > 50) {
          s.title = s.title.substring(0, 47) + '...';
          s.characterCount = s.title.length;
        }
      });
    }
    
    return {
      suggestions,
      detectedTopics: this.extractMockTopics(request.transcriptText),
      contentSummary: this.generateMockSummary(request.transcriptText),
      generatedAt: new Date(),
      processingTimeMs: this.delay
    };
  }
  
  async health(): Promise<boolean> {
    return !this.shouldFail;
  }
  
  // Test helpers
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }
  
  setDelay(delay: number): void {
    this.delay = delay;
  }
  
  private extractMockTopics(text: string): string[] {
    const topics = [];
    
    if (text.toLowerCase().includes('cook')) topics.push('cooking');
    if (text.toLowerCase().includes('pasta')) topics.push('pasta');
    if (text.toLowerCase().includes('tech')) topics.push('technology');
    if (text.toLowerCase().includes('tutorial')) topics.push('education');
    if (text.toLowerCase().includes('business')) topics.push('business');
    
    return topics.length > 0 ? topics : ['general', 'tutorial'];
  }
  
  private generateMockSummary(text: string): string {
    if (text.length < 50) {
      return 'Brief content analysis';
    }
    
    const words = text.split(' ').slice(0, 10);
    return `Content about ${words.join(' ')}...`;
  }
}
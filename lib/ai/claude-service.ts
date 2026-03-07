/**
 * @file Claude AI Service for title generation
 * @spec clawd-l92.6 - Title Generation  
 * @bead clawd-l92.6
 */

import { 
  TitleGenerationRequest, 
  TitleGenerationResult, 
  TitleSuggestion, 
  TitleCategory,
  PLATFORM_CONFIGS 
} from '../../src/types/ai-editing';

export interface AIServicePort {
  generateTitles(request: TitleGenerationRequest): Promise<TitleGenerationResult>;
  health(): Promise<boolean>;
}

export class ClaudeAIService implements AIServicePort {
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateTitles(request: TitleGenerationRequest): Promise<TitleGenerationResult> {
    const startTime = Date.now();
    
    try {
      const prompt = this.buildTitleGenerationPrompt(request);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.content[0].text;
      
      return this.parseTitleGenerationResponse(content, Date.now() - startTime);
    } catch (error) {
      throw new Error(`Title generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async health(): Promise<boolean> {
    try {
      // Simple health check with minimal request
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [
            {
              role: 'user', 
              content: 'Health check. Respond with "OK".'
            }
          ]
        })
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
  
  private buildTitleGenerationPrompt(request: TitleGenerationRequest): string {
    const platformInfo = request.targetPlatform 
      ? `Platform: ${request.targetPlatform} (${PLATFORM_CONFIGS[request.targetPlatform].style}, max ${PLATFORM_CONFIGS[request.targetPlatform].maxLength} chars)`
      : 'Multi-platform (provide variety)';
    
    return `Generate engaging titles for video content based on this transcript:

TRANSCRIPT:
${request.transcriptText}

${request.existingTitle ? `EXISTING TITLE: ${request.existingTitle}` : ''}

REQUIREMENTS:
- Generate 5-10 title options
- ${platformInfo}
- Include variety: descriptive, clickbait, SEO, professional styles
- Provide engagement scores (0-100) and confidence (0-1)

Return your response as a JSON object with this structure:
{
  "suggestions": [
    {
      "id": "1",
      "title": "Generated Title Here",
      "category": "descriptive|clickbait|seo|professional", 
      "engagementScore": 85,
      "confidence": 0.9
    }
  ],
  "detectedTopics": ["topic1", "topic2"],
  "contentSummary": "Brief summary of the content"
}

Ensure all titles are engaging, accurate to content, and appropriate for the target platform.`;
  }
  
  private parseTitleGenerationResponse(content: string, processingTimeMs: number): TitleGenerationResult {
    try {
      // Extract JSON from Claude's response (may include extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Add character counts and IDs if missing
      const suggestions: TitleSuggestion[] = parsed.suggestions.map((s: any, index: number) => ({
        ...s,
        id: s.id || `title-${index + 1}`,
        characterCount: s.title.length
      }));
      
      return {
        suggestions,
        detectedTopics: parsed.detectedTopics || [],
        contentSummary: parsed.contentSummary || 'Content analysis complete',
        generatedAt: new Date(),
        processingTimeMs
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid format'}`);
    }
  }
}
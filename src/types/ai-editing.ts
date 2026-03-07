/**
 * @file Domain types for AI-assisted editing features
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 */

export type TitleCategory = 'descriptive' | 'clickbait' | 'seo' | 'professional';
export type Platform = 'youtube' | 'tiktok' | 'linkedin' | 'twitter';

export interface TitleSuggestion {
  id: string;
  title: string;
  category: TitleCategory;
  engagementScore: number;  // 0-100
  confidence: number;       // 0-1
  characterCount: number;
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
  description: string;
}

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  youtube: { 
    platform: 'youtube', 
    maxLength: 100, 
    style: 'keyword-front, compelling',
    description: 'Optimized for YouTube discovery'
  },
  tiktok: { 
    platform: 'tiktok', 
    maxLength: 60, 
    style: 'trending, casual, punchy',
    description: 'Short and engaging for TikTok'
  },
  linkedin: { 
    platform: 'linkedin', 
    maxLength: 150, 
    style: 'professional, insightful',
    description: 'Professional tone for LinkedIn'
  },
  twitter: { 
    platform: 'twitter', 
    maxLength: 280, 
    style: 'punchy, engagement-focused',
    description: 'Concise and shareable for Twitter/X'
  },
};
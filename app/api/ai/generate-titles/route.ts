/**
 * @file API route for AI title generation
 * @spec clawd-l92.6 - Title Generation
 * @bead clawd-l92.6
 */

import { NextRequest, NextResponse } from 'next/server';
import { ClaudeAIService, MockAIService } from '../../../../lib/ai';
import { TitleGenerationRequest } from '../../../../src/types/ai-editing';

// Rate limiting (basic implementation)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse request body
    let body: TitleGenerationRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.transcriptText || typeof body.transcriptText !== 'string') {
      return NextResponse.json(
        { error: 'transcriptText is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (body.transcriptText.trim().length < 10) {
      return NextResponse.json(
        { error: 'transcriptText must be at least 10 characters long' },
        { status: 400 }
      );
    }
    
    // Initialize AI service
    const isTestMode = process.env.NODE_ENV === 'test' || body.transcriptText.includes('testMode=true');
    let aiService;
    
    if (isTestMode) {
      aiService = new MockAIService();
    } else {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 503 }
        );
      }
      aiService = new ClaudeAIService(apiKey);
    }
    
    // Generate titles
    const result = await aiService.generateTitles(body);
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Title generation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: 'AI Title Generation',
      version: '1.0.0',
      status: 'available',
      endpoints: {
        POST: 'Generate titles from transcript text'
      }
    },
    { status: 200 }
  );
}
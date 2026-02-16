import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/service';

// GET /api/notifications/counts - Get notification counts for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user'; // In production, get from auth
    
    const counts = await notificationService.getCounts(userId);

    return NextResponse.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notification counts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
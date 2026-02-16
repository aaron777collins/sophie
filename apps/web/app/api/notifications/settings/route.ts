import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/service';

// GET /api/notifications/settings - Get notification settings for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user'; // In production, get from auth
    
    const settings = await notificationService.getSettings(userId);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notification settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/settings - Update notification settings for user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'current-user', ...settingsUpdates } = body; // In production, get userId from auth
    
    const updatedSettings = await notificationService.updateSettings(userId, settingsUpdates);

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update notification settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
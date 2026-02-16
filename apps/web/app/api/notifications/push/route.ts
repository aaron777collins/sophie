import { NextRequest, NextResponse } from 'next/server';
import { serverPushService } from '@/lib/notifications/push-service';

// POST /api/notifications/push - Send a push notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification, subscription } = body;

    if (!notification || !subscription) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: notification, subscription' 
        },
        { status: 400 }
      );
    }

    const success = await serverPushService.sendNotification(subscription, notification);

    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send push notification' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully',
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send push notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

// POST /api/notifications/unsubscribe - Remove push notification subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, userId = 'current-user' } = body; // In production, get userId from auth

    if (!subscription) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing subscription data' 
        },
        { status: 400 }
      );
    }

    // In a real implementation, you would remove the subscription from your database
    console.log('Removing push subscription for user:', userId);
    console.log('Subscription endpoint:', subscription.endpoint);

    // TODO: Remove subscription from database
    // await db.pushSubscriptions.deleteMany({
    //   userId,
    //   endpoint: subscription.endpoint,
    // });

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed successfully',
    });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove push subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
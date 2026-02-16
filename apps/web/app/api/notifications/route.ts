import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/service';
import { NotificationFilter } from '@/lib/types/notification';

// GET /api/notifications - Get notifications with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const filter: NotificationFilter = {
      userId: searchParams.get('userId') || 'current-user', // In production, get from auth
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Optional filters
    if (searchParams.get('status')) {
      filter.status = searchParams.get('status')!.split(',') as any;
    }
    if (searchParams.get('type')) {
      filter.type = searchParams.get('type')!.split(',') as any;
    }
    if (searchParams.get('priority')) {
      filter.priority = searchParams.get('priority')!.split(',') as any;
    }
    if (searchParams.get('serverId')) {
      filter.serverId = searchParams.get('serverId')!;
    }
    if (searchParams.get('channelId')) {
      filter.channelId = searchParams.get('channelId')!;
    }
    if (searchParams.get('dateFrom')) {
      filter.dateFrom = new Date(searchParams.get('dateFrom')!);
    }
    if (searchParams.get('dateTo')) {
      filter.dateTo = new Date(searchParams.get('dateTo')!);
    }

    const notifications = await notificationService.getByFilter(filter);

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      type,
      title,
      message,
      priority = 'normal',
      deliveryMethods = ['in_app'],
      userId = 'current-user', // In production, get from auth
      sourceId,
      sourceType,
      channelId,
      serverId,
      data,
      actions,
      icon,
      imageUrl,
      avatarUrl,
      expiresAt,
    } = body;

    // Validate required fields
    if (!type || !title || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: type, title, message' 
        },
        { status: 400 }
      );
    }

    const notification = await notificationService.create({
      type,
      title,
      message,
      priority,
      deliveryMethods,
      userId,
      sourceId,
      sourceType,
      channelId,
      serverId,
      data,
      actions,
      icon,
      imageUrl,
      avatarUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: notification,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Clear all notifications for user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user'; // In production, get from auth
    
    const clearedCount = await notificationService.clear(userId);

    return NextResponse.json({
      success: true,
      message: `Cleared ${clearedCount} notifications`,
      count: clearedCount,
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '../../../../lib/notifications/service';

// GET /api/notifications/[id] - Get a specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const notification = await notificationService.getById(id);
    
    if (!notification) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notification not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/[id] - Update notification status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'mark_read':
        await notificationService.markAsRead(id);
        break;
      case 'dismiss':
        await notificationService.dismiss(id);
        break;
      case 'archive':
        await notificationService.archive(id);
        break;
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action. Supported actions: mark_read, dismiss, archive' 
          },
          { status: 400 }
        );
    }

    // Get updated notification
    const updatedNotification = await notificationService.getById(id);

    return NextResponse.json({
      success: true,
      message: `Notification ${action} successfully`,
      data: updatedNotification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete a specific notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if notification exists
    const notification = await notificationService.getById(id);
    if (!notification) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Notification not found' 
        },
        { status: 404 }
      );
    }

    // Archive the notification instead of deleting
    await notificationService.archive(id);

    return NextResponse.json({
      success: true,
      message: 'Notification archived successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
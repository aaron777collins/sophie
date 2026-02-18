/**
 * API endpoint for unsubscribing from email notifications
 * GDPR-compliant unsubscribe functionality
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock user preferences storage - in production this would be a database
const unsubscribedUsers = new Map<string, {
  userId: string;
  types: Set<string>;
  timestamp: number;
  userAgent?: string;
  ipAddress?: string;
}>();

/**
 * GET /api/notifications/unsubscribe
 * Handle unsubscribe links from emails
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'all';
    const token = searchParams.get('token'); // Optional security token

    if (!userId) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - Missing Information</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px auto; max-width: 600px; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33; }
          </style>
        </head>
        <body>
          <div class="error">
            <h2>❌ Unsubscribe Failed</h2>
            <p>Missing user information. Please use the unsubscribe link from your email notification.</p>
          </div>
        </body>
        </html>
        `,
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Process unsubscribe
    const existing = unsubscribedUsers.get(userId) || {
      userId,
      types: new Set<string>(),
      timestamp: Date.now(),
      userAgent: undefined,
      ipAddress: undefined,
    };

    if (type === 'all') {
      existing.types.add('email');
      existing.types.add('offline');
      existing.types.add('mentions');
      existing.types.add('direct_messages');
    } else {
      existing.types.add(type);
    }

    existing.timestamp = Date.now();
    existing.userAgent = request.headers.get('user-agent') || undefined;
    existing.ipAddress = request.headers.get('x-forwarded-for') || undefined;

    unsubscribedUsers.set(userId, existing);

    // Log the unsubscribe for compliance
    console.log('User unsubscribed:', {
      userId,
      type,
      timestamp: existing.timestamp,
      userAgent: existing.userAgent,
      ipAddress: existing.ipAddress,
    });

    const typesUnsubscribed = Array.from(existing.types).join(', ');

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Successfully Unsubscribed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 40px auto; 
            max-width: 600px; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .success { 
            background: #efe; 
            border: 1px solid #cfc; 
            padding: 20px; 
            border-radius: 8px; 
            color: #363; 
          }
          .info {
            background: #f0f8ff;
            border: 1px solid #b0d4f1;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            color: #1a5490;
          }
          .button {
            display: inline-block;
            background: #007acc;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 15px;
          }
          .button:hover {
            background: #005999;
          }
          small {
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="success">
          <h2>✅ Successfully Unsubscribed</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Unsubscribed from:</strong> ${typesUnsubscribed}</p>
          <p>You will no longer receive email notifications of the selected types.</p>
        </div>

        <div class="info">
          <h3>What happens next?</h3>
          <ul>
            <li>You will stop receiving the selected email notification types immediately</li>
            <li>Your preferences have been saved and will be respected</li>
            <li>You can still receive notifications within the application</li>
            <li>To resubscribe, please visit your notification settings in the app</li>
          </ul>

          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/settings" class="button">
            Go to Notification Settings
          </a>
        </div>

        <p><small>
          Unsubscribed at: ${new Date().toISOString()}<br>
          For questions about this unsubscribe, please contact support.
        </small></p>
      </body>
      </html>
      `,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: sans-serif; margin: 40px auto; max-width: 600px; padding: 20px; }
          .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; color: #c33; }
        </style>
      </head>
      <body>
        <div class="error">
          <h2>❌ Unsubscribe Error</h2>
          <p>An error occurred while processing your unsubscribe request. Please try again or contact support.</p>
        </div>
      </body>
      </html>
      `,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

/**
 * POST /api/notifications/unsubscribe
 * Programmatic unsubscribe (for API usage)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, types = ['all'] } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId',
      }, { status: 400 });
    }

    // Process unsubscribe
    const existing = unsubscribedUsers.get(userId) || {
      userId,
      types: new Set<string>(),
      timestamp: Date.now(),
      userAgent: undefined,
      ipAddress: undefined,
    };

    for (const type of types) {
      if (type === 'all') {
        existing.types.add('email');
        existing.types.add('offline');
        existing.types.add('mentions');
        existing.types.add('direct_messages');
      } else {
        existing.types.add(type);
      }
    }

    existing.timestamp = Date.now();
    existing.userAgent = request.headers.get('user-agent') || undefined;
    existing.ipAddress = request.headers.get('x-forwarded-for') || undefined;

    unsubscribedUsers.set(userId, existing);

    // Log the unsubscribe for compliance
    console.log('User unsubscribed (API):', {
      userId,
      types,
      timestamp: existing.timestamp,
      userAgent: existing.userAgent,
      ipAddress: existing.ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed from ${types.join(', ')}`,
      userId,
      unsubscribedTypes: Array.from(existing.types),
      timestamp: existing.timestamp,
    });

  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * GET /api/notifications/unsubscribe/status
 * Check unsubscribe status for a user
 */
export async function GET_STATUS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId',
      }, { status: 400 });
    }

    const unsubscribeData = unsubscribedUsers.get(userId);

    return NextResponse.json({
      success: true,
      userId,
      isUnsubscribed: !!unsubscribeData,
      unsubscribedTypes: unsubscribeData ? Array.from(unsubscribeData.types) : [],
      unsubscribedAt: unsubscribeData?.timestamp,
    });

  } catch (error) {
    console.error('Error checking unsubscribe status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * Helper function to check if a user is unsubscribed from a notification type
 */
export function isUserUnsubscribed(userId: string, type: string): boolean {
  const unsubscribeData = unsubscribedUsers.get(userId);
  if (!unsubscribeData) return false;
  
  return unsubscribeData.types.has(type) || unsubscribeData.types.has('all') || unsubscribeData.types.has('email');
}

/**
 * Get unsubscribe statistics for monitoring
 */
export function getUnsubscribeStats() {
  const stats = {
    totalUnsubscribed: unsubscribedUsers.size,
    byType: {} as Record<string, number>,
    recentUnsubscribes: [] as any[],
  };

  const now = Date.now();
  const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

  for (const [userId, data] of unsubscribedUsers.entries()) {
    // Count by type
    for (const type of data.types) {
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    }

    // Recent unsubscribes
    if (data.timestamp > oneWeekAgo) {
      stats.recentUnsubscribes.push({
        userId,
        timestamp: data.timestamp,
        types: Array.from(data.types),
      });
    }
  }

  return stats;
}
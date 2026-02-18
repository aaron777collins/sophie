/**
 * API endpoint for offline email notifications
 * Handles processing offline users and sending email notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { OfflineUserDetectionService, defaultOfflineDetectionConfig } from '@/lib/notifications/offline-detection';
import { OfflineEmailService, defaultOfflineEmailConfig } from '@/lib/notifications/offline-email-service';
import { emailService } from '@/lib/notifications/email-service';
import { notificationService } from '@/lib/notifications/service';

// Mock Matrix client for demonstration
// In production, this would be properly initialized with user credentials
const mockMatrixClient = {
  getUser: (userId: string) => ({
    userId,
    displayName: `User ${userId}`,
    avatarUrl: undefined,
    presence: 'offline',
    lastActiveAgo: 3600000, // 1 hour ago
    lastPresenceTs: Date.now() - 3600000,
  }),
  getRooms: () => [],
  on: () => {},
} as any;

// Mock user email addresses - in production this would come from user settings
const mockUserEmails = new Map([
  ['@alice:example.com', 'alice@example.com'],
  ['@bob:example.com', 'bob@example.com'],
  ['@charlie:example.com', 'charlie@example.com'],
]);

// Initialize services
const offlineDetectionService = new OfflineUserDetectionService(
  defaultOfflineDetectionConfig,
  notificationService
);

const offlineEmailService = new OfflineEmailService(
  {
    ...defaultOfflineEmailConfig,
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'notifications@haos.local',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  } as any,
  emailService
);

// Initialize with mock client
offlineDetectionService.initialize(mockMatrixClient);

/**
 * POST /api/notifications/offline
 * Process offline users and send email notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userIds, dryRun = false } = body;

    // Get list of user IDs to check (or use mock data)
    const usersToCheck: string[] = userIds || Array.from(mockUserEmails.keys());

    if (usersToCheck.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No users specified to check',
      }, { status: 400 });
    }

    // Detect offline users
    const offlineUsers = await offlineDetectionService.detectOfflineUsers(usersToCheck);

    if (offlineUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No offline users found with unread messages',
        offlineUsers: [],
        emailResults: [],
      });
    }

    // Get message previews for each offline user
    const messagePreviewsMap = new Map();
    for (const user of offlineUsers) {
      try {
        const previews = await offlineDetectionService.getMessagePreviews(user.userId, 5);
        messagePreviewsMap.set(user.userId, previews);
      } catch (error) {
        console.error(`Error getting message previews for ${user.userId}:`, error);
        messagePreviewsMap.set(user.userId, []);
      }
    }

    let emailResults: any[] = [];

    // Send emails if not a dry run
    if (!dryRun) {
      emailResults = await offlineEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        mockUserEmails
      );

      // Mark emails as sent for rate limiting
      emailResults.filter(r => r.success).forEach(result => {
        offlineDetectionService.markEmailSent(result.userId);
      });
    }

    return NextResponse.json({
      success: true,
      message: `Found ${offlineUsers.length} offline user${offlineUsers.length === 1 ? '' : 's'} with unread messages`,
      offlineUsers: offlineUsers.map(user => ({
        userId: user.userId,
        displayName: user.displayName,
        offlineDurationMs: user.offlineDurationMs,
        offlineDurationHuman: formatDuration(user.offlineDurationMs),
        unreadMessageCount: user.unreadMessageCount,
        unreadMentions: user.unreadMentions,
        unreadDirectMessages: user.unreadDirectMessages,
        messagePreviewCount: messagePreviewsMap.get(user.userId)?.length || 0,
      })),
      emailResults: emailResults.map(result => ({
        success: result.success,
        userId: result.userId,
        emailAddress: result.emailAddress,
        error: result.error,
      })),
      dryRun,
    });

  } catch (error) {
    console.error('Error processing offline notifications:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * GET /api/notifications/offline
 * Get statistics about offline notification processing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    if (action === 'stats') {
      const rateLimitStats = offlineEmailService.getRateLimitStats();
      
      return NextResponse.json({
        success: true,
        stats: {
          rateLimiting: {
            hourly: Object.fromEntries(rateLimitStats.hourly),
            daily: Object.fromEntries(rateLimitStats.daily),
          },
          configuration: {
            offlineThresholdMs: defaultOfflineDetectionConfig.offlineThresholdMs,
            offlineThresholdHuman: formatDuration(defaultOfflineDetectionConfig.offlineThresholdMs),
            rateLimitMs: defaultOfflineDetectionConfig.rateLimitMs,
            rateLimitHuman: formatDuration(defaultOfflineDetectionConfig.rateLimitMs),
            maxEmailsPerHour: (defaultOfflineEmailConfig as any).maxEmailsPerHour,
            maxEmailsPerDay: (defaultOfflineEmailConfig as any).maxEmailsPerDay,
          },
        },
      });
    }

    if (action === 'test-users') {
      // Return list of test users for development
      return NextResponse.json({
        success: true,
        testUsers: Array.from(mockUserEmails.entries()).map(([userId, email]) => ({
          userId,
          emailAddress: email,
        })),
      });
    }

    return NextResponse.json({
      success: false,
      error: `Unknown action: ${action}`,
    }, { status: 400 });

  } catch (error) {
    console.error('Error getting offline notification stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }, { status: 500 });
  }
}

/**
 * Format duration in milliseconds to human readable string
 */
function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  return `${minutes}m`;
}
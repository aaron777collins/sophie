import { NextRequest, NextResponse } from 'next/server';
import { EmailNotificationService } from '../../../../lib/services/email-notification-service';
import { OfflineUserDetectionService } from '../../../../lib/services/offline-user-detection-service';
import { EmailNotificationConfig, UserNotificationPreferences } from '../../../../lib/types/email-notifications';

// Mock configuration - in production, load from environment variables
const mockConfig: EmailNotificationConfig = {
  enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' || true,
  defaultOfflineThresholdMinutes: parseInt(process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES || '60'),
  maxAttemptsPerNotification: parseInt(process.env.MAX_NOTIFICATION_ATTEMPTS || '3'),
  retryDelayMinutes: parseInt(process.env.RETRY_DELAY_MINUTES || '15'),
  batchSize: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '10'),
  rateLimitPerHour: parseInt(process.env.RATE_LIMIT_PER_HOUR || '5'),
  smtpConfig: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@matrix-client.com'
  },
  gdprCompliant: true,
  privacyPolicyUrl: process.env.PRIVACY_POLICY_URL || 'https://matrix-client.com/privacy',
  unsubscribeUrl: process.env.UNSUBSCRIBE_URL || 'https://matrix-client.com/unsubscribe'
};

// Initialize services
const emailService = new EmailNotificationService(mockConfig);
const offlineDetectionService = new OfflineUserDetectionService();

// Mock user preferences - in production, load from database
const getMockUserPreferences = (): UserNotificationPreferences[] => {
  return [
    {
      userId: '@alice:matrix.org',
      emailEnabled: true,
      offlineThresholdMinutes: 60,
      notificationTypes: {
        directMessages: true,
        mentions: true,
        invites: true,
        roomActivity: false
      },
      emailAddress: 'alice@example.com',
      optedOut: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      userId: '@bob:matrix.org',
      emailEnabled: true,
      offlineThresholdMinutes: 30,
      notificationTypes: {
        directMessages: true,
        mentions: true,
        invites: false,
        roomActivity: true
      },
      emailAddress: 'bob@example.com',
      optedOut: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      userId: '@charlie:matrix.org',
      emailEnabled: false,
      offlineThresholdMinutes: 120,
      notificationTypes: {
        directMessages: false,
        mentions: false,
        invites: false,
        roomActivity: false
      },
      emailAddress: 'charlie@example.com',
      optedOut: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];
};

/**
 * POST /api/notifications/process
 * Manually trigger the offline user detection and notification process
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await authenticateAdmin(request);

    const body = await request.json();
    const { dryRun = false, userId = null } = body;

    console.log(`[INFO] Starting notification process (dryRun: ${dryRun})`);

    // Get all user preferences (in production, from database)
    let userPreferences = getMockUserPreferences();

    // Filter to specific user if requested
    if (userId) {
      userPreferences = userPreferences.filter(p => p.userId === userId);
      if (userPreferences.length === 0) {
        return NextResponse.json(
          { error: `User ${userId} not found` },
          { status: 404 }
        );
      }
    }

    console.log(`[INFO] Processing ${userPreferences.length} users`);

    // For demo purposes, simulate some offline users
    // In production, this would use a real Matrix client
    console.log('[INFO] Simulating offline users for demo');
    
    // Mark some users as offline for demonstration
    offlineDetectionService.markUserOffline('@alice:matrix.org', new Date(Date.now() - 90 * 60 * 1000).toISOString()); // 90 minutes ago
    offlineDetectionService.markUserOffline('@bob:matrix.org', new Date(Date.now() - 45 * 60 * 1000).toISOString()); // 45 minutes ago
    offlineDetectionService.markUserOnline('@charlie:matrix.org'); // Online

    // Detect offline users
    const offlineUsers = await offlineDetectionService.detectOfflineUsers(userPreferences);

    console.log(`[INFO] Found ${offlineUsers.length} offline users needing notifications`);

    let processedCount = 0;
    let notificationCount = 0;

    if (!dryRun && offlineUsers.length > 0) {
      // Process offline users and create notifications
      try {
        const startTime = Date.now();
        await emailService.processOfflineUsers(offlineUsers);
        const endTime = Date.now();

        // Send pending notifications
        await emailService.sendPendingNotifications();

        processedCount = offlineUsers.length;
        
        console.log(`[INFO] Processed ${processedCount} offline users in ${endTime - startTime}ms`);

        // Get stats
        const stats = await emailService.getStats();
        notificationCount = stats.totalSent;

      } catch (error) {
        console.error('[ERROR] Error processing offline users:', error);
        return NextResponse.json(
          { error: 'Failed to process offline users' },
          { status: 500 }
        );
      }
    }

    // Get current stats
    const emailStats = await emailService.getStats();
    const offlineStats = offlineDetectionService.getOfflineStats();

    const response = {
      success: true,
      dryRun,
      timestamp: new Date().toISOString(),
      summary: {
        usersChecked: userPreferences.length,
        offlineUsersFound: offlineUsers.length,
        usersProcessed: processedCount,
        notificationsSent: notificationCount
      },
      offlineUsers: offlineUsers.map(user => ({
        userId: user.userId,
        offlineDurationMinutes: user.offlineDurationMinutes,
        unreadMessages: user.unreadMessages.totalUnread,
        lastSeenAt: user.lastSeenAt
      })),
      stats: {
        email: emailStats,
        offline: offlineStats
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in notification process:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process notifications' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/process/stats
 * Get notification processing statistics
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await authenticateAdmin(request);

    const emailStats = await emailService.getStats();
    const offlineStats = offlineDetectionService.getOfflineStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        email: emailStats,
        offline: offlineStats
      },
      config: {
        enabled: mockConfig.enabled,
        defaultOfflineThresholdMinutes: mockConfig.defaultOfflineThresholdMinutes,
        maxAttemptsPerNotification: mockConfig.maxAttemptsPerNotification,
        batchSize: mockConfig.batchSize,
        rateLimitPerHour: mockConfig.rateLimitPerHour
      }
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification stats' },
      { status: 500 }
    );
  }
}
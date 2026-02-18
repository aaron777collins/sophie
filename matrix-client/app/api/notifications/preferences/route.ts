import { NextRequest, NextResponse } from 'next/server';
import { EmailNotificationService } from '../../../../lib/services/email-notification-service';
import { UserNotificationPreferences, EmailNotificationConfig } from '../../../../lib/types/email-notifications';

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

// Initialize service
const emailService = new EmailNotificationService(mockConfig);

/**
 * GET /api/notifications/preferences?userId=@user:domain.com
 * Get user notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const user = await authenticateUser(request);
    // if (user.userId !== userId && !user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const preferences = await emailService.getUserPreferences(userId);

    if (!preferences) {
      // Return default preferences for new user
      const defaultPreferences: UserNotificationPreferences = {
        userId,
        emailEnabled: true,
        offlineThresholdMinutes: mockConfig.defaultOfflineThresholdMinutes,
        notificationTypes: {
          directMessages: true,
          mentions: true,
          invites: true,
          roomActivity: false
        },
        optedOut: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({ preferences: defaultPreferences });
    }

    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/preferences
 * Update user notification preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: 'preferences object is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const user = await authenticateUser(request);
    // if (user.userId !== userId && !user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // Validate email address if provided
    if (preferences.emailAddress) {
      const emailValidation = emailService.validateEmail(preferences.emailAddress);
      if (!emailValidation.isValid) {
        return NextResponse.json(
          { error: `Invalid email address: ${emailValidation.error}` },
          { status: 400 }
        );
      }
    }

    // Validate threshold
    if (preferences.offlineThresholdMinutes !== undefined) {
      if (preferences.offlineThresholdMinutes < 15 || preferences.offlineThresholdMinutes > 1440) {
        return NextResponse.json(
          { error: 'Offline threshold must be between 15 minutes and 24 hours' },
          { status: 400 }
        );
      }
    }

    const updatedPreferences = await emailService.updateUserPreferences(userId, preferences);

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/preferences?userId=@user:domain.com
 * Opt user out of all email notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check (allow self opt-out or admin)
    // const user = await authenticateUser(request);
    // if (user.userId !== userId && !user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    await emailService.optOut(userId);

    // Cancel any pending notifications
    const cancelledCount = await emailService.cancelPendingNotifications(userId);

    return NextResponse.json({
      success: true,
      message: `User ${userId} has been opted out of email notifications`,
      cancelledNotifications: cancelledCount
    });

  } catch (error) {
    console.error('Error opting out user:', error);
    return NextResponse.json(
      { error: 'Failed to opt out user' },
      { status: 500 }
    );
  }
}
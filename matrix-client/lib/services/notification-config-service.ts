import { EmailNotificationConfig } from '../types/email-notifications';

/**
 * Notification Configuration Service
 * Centralizes configuration management for email notifications
 */
export class NotificationConfigService {
  private static instance: NotificationConfigService;
  private config: EmailNotificationConfig;

  private constructor() {
    this.config = this.loadConfigFromEnvironment();
  }

  public static getInstance(): NotificationConfigService {
    if (!NotificationConfigService.instance) {
      NotificationConfigService.instance = new NotificationConfigService();
    }
    return NotificationConfigService.instance;
  }

  /**
   * Load configuration from environment variables with fallbacks
   */
  private loadConfigFromEnvironment(): EmailNotificationConfig {
    // Helper function to parse boolean environment variables
    const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
      if (!value) return defaultValue;
      return value.toLowerCase() === 'true';
    };

    // Helper function to parse integer environment variables
    const parseInteger = (value: string | undefined, defaultValue: number): number => {
      if (!value) return defaultValue;
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const config: EmailNotificationConfig = {
      // Main toggle for email notifications
      enabled: parseBoolean(process.env.EMAIL_NOTIFICATIONS_ENABLED, true),

      // Default settings for users
      defaultOfflineThresholdMinutes: parseInteger(
        process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES,
        60
      ),

      // Retry and reliability settings
      maxAttemptsPerNotification: parseInteger(
        process.env.MAX_NOTIFICATION_ATTEMPTS,
        3
      ),
      retryDelayMinutes: parseInteger(process.env.RETRY_DELAY_MINUTES, 15),

      // Performance settings
      batchSize: parseInteger(process.env.NOTIFICATION_BATCH_SIZE, 10),
      rateLimitPerHour: parseInteger(process.env.RATE_LIMIT_PER_HOUR, 5),

      // SMTP Configuration
      smtpConfig: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInteger(process.env.SMTP_PORT, 587),
        secure: parseBoolean(process.env.SMTP_SECURE, false),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || 'noreply@matrix-client.com'
      },

      // Compliance and legal
      gdprCompliant: parseBoolean(process.env.GDPR_COMPLIANT, true),
      privacyPolicyUrl:
        process.env.PRIVACY_POLICY_URL || 'https://matrix-client.com/privacy',
      unsubscribeUrl:
        process.env.UNSUBSCRIBE_URL || 'https://matrix-client.com/unsubscribe'
    };

    // Validate required SMTP settings if email is enabled
    if (config.enabled && (!config.smtpConfig.user || !config.smtpConfig.pass)) {
      console.warn(
        '[WARNING] Email notifications are enabled but SMTP credentials are missing. ' +
        'Set SMTP_USER and SMTP_PASS environment variables.'
      );
    }

    return config;
  }

  /**
   * Get current configuration
   */
  getConfig(): EmailNotificationConfig {
    return { ...this.config }; // Return a copy to prevent mutations
  }

  /**
   * Update configuration (for testing or runtime changes)
   */
  updateConfig(updates: Partial<EmailNotificationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Validate SMTP configuration
   */
  validateSmtpConfig(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const smtp = this.config.smtpConfig;

    if (!smtp.host) {
      errors.push('SMTP host is required');
    }

    if (!smtp.port || smtp.port < 1 || smtp.port > 65535) {
      errors.push('SMTP port must be between 1 and 65535');
    }

    if (!smtp.user) {
      errors.push('SMTP user is required');
    }

    if (!smtp.pass) {
      errors.push('SMTP password is required');
    }

    if (!smtp.from) {
      errors.push('SMTP from address is required');
    }

    // Validate from email format
    if (smtp.from && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(smtp.from)) {
      errors.push('SMTP from address is not a valid email');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration summary for logging/debugging
   */
  getConfigSummary(): Record<string, any> {
    const config = this.getConfig();
    
    return {
      enabled: config.enabled,
      defaultOfflineThresholdMinutes: config.defaultOfflineThresholdMinutes,
      maxAttemptsPerNotification: config.maxAttemptsPerNotification,
      retryDelayMinutes: config.retryDelayMinutes,
      batchSize: config.batchSize,
      rateLimitPerHour: config.rateLimitPerHour,
      gdprCompliant: config.gdprCompliant,
      smtp: {
        host: config.smtpConfig.host,
        port: config.smtpConfig.port,
        secure: config.smtpConfig.secure,
        from: config.smtpConfig.from,
        userConfigured: !!config.smtpConfig.user,
        passwordConfigured: !!config.smtpConfig.pass
      },
      urls: {
        privacyPolicy: config.privacyPolicyUrl,
        unsubscribe: config.unsubscribeUrl
      }
    };
  }

  /**
   * Environment variable documentation
   */
  static getEnvironmentVariableDocumentation(): Record<string, string> {
    return {
      EMAIL_NOTIFICATIONS_ENABLED: 'Enable/disable email notifications (default: true)',
      DEFAULT_OFFLINE_THRESHOLD_MINUTES: 'Default minutes before user is considered offline (default: 60)',
      MAX_NOTIFICATION_ATTEMPTS: 'Maximum retry attempts per notification (default: 3)',
      RETRY_DELAY_MINUTES: 'Minutes to wait between retry attempts (default: 15)',
      NOTIFICATION_BATCH_SIZE: 'Number of notifications to process at once (default: 10)',
      RATE_LIMIT_PER_HOUR: 'Maximum emails per user per hour (default: 5)',
      SMTP_HOST: 'SMTP server hostname (default: smtp.gmail.com)',
      SMTP_PORT: 'SMTP server port (default: 587)',
      SMTP_SECURE: 'Use secure SMTP connection (default: false)',
      SMTP_USER: 'SMTP username (required for email sending)',
      SMTP_PASS: 'SMTP password (required for email sending)',
      SMTP_FROM: 'From email address (default: noreply@matrix-client.com)',
      GDPR_COMPLIANT: 'Enable GDPR compliance features (default: true)',
      PRIVACY_POLICY_URL: 'URL to privacy policy (default: https://matrix-client.com/privacy)',
      UNSUBSCRIBE_URL: 'URL for unsubscribing (default: https://matrix-client.com/unsubscribe)'
    };
  }

  /**
   * Create a sample .env file content
   */
  static generateSampleEnvFile(): string {
    const docs = this.getEnvironmentVariableDocumentation();
    let content = '# Email Notification Configuration\n\n';

    Object.entries(docs).forEach(([key, description]) => {
      content += `# ${description}\n`;
      content += `${key}=\n\n`;
    });

    content += `# Example Gmail configuration:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@yourdomain.com

# Example SendGrid configuration:
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=apikey
# SMTP_PASS=your-sendgrid-api-key
# SMTP_FROM=noreply@yourdomain.com

# Example AWS SES configuration:
# SMTP_HOST=email-smtp.us-east-1.amazonaws.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-aws-access-key-id
# SMTP_PASS=your-aws-secret-access-key
# SMTP_FROM=noreply@yourdomain.com
`;

    return content;
  }

  /**
   * Load configuration from a file (for testing)
   */
  static loadFromFile(filePath: string): EmailNotificationConfig {
    // This would be used for loading config from JSON/YAML files in more complex setups
    throw new Error('File-based configuration not implemented yet');
  }

  /**
   * Reset configuration to defaults (for testing)
   */
  resetToDefaults(): void {
    this.config = this.loadConfigFromEnvironment();
  }
}
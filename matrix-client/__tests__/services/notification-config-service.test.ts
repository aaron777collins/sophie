import { NotificationConfigService } from '../../lib/services/notification-config-service';

describe('NotificationConfigService', () => {
  let service: NotificationConfigService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
    
    // Clear any existing instance
    (NotificationConfigService as any).instance = null;
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationConfigService.getInstance();
      const instance2 = NotificationConfigService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration Loading', () => {
    it('should load default configuration when no environment variables are set', () => {
      // Clear all relevant environment variables
      delete process.env.EMAIL_NOTIFICATIONS_ENABLED;
      delete process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES;
      delete process.env.MAX_NOTIFICATION_ATTEMPTS;
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      service = NotificationConfigService.getInstance();
      const config = service.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.defaultOfflineThresholdMinutes).toBe(60);
      expect(config.maxAttemptsPerNotification).toBe(3);
      expect(config.smtpConfig.host).toBe('smtp.gmail.com');
      expect(config.smtpConfig.port).toBe(587);
      expect(config.smtpConfig.from).toBe('noreply@matrix-client.com');
    });

    it('should load configuration from environment variables', () => {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = 'false';
      process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES = '120';
      process.env.MAX_NOTIFICATION_ATTEMPTS = '5';
      process.env.RETRY_DELAY_MINUTES = '30';
      process.env.NOTIFICATION_BATCH_SIZE = '20';
      process.env.RATE_LIMIT_PER_HOUR = '10';
      process.env.SMTP_HOST = 'smtp.sendgrid.net';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_SECURE = 'true';
      process.env.SMTP_USER = 'testuser';
      process.env.SMTP_PASS = 'testpass';
      process.env.SMTP_FROM = 'test@example.com';
      process.env.GDPR_COMPLIANT = 'false';
      process.env.PRIVACY_POLICY_URL = 'https://example.com/privacy';
      process.env.UNSUBSCRIBE_URL = 'https://example.com/unsubscribe';

      service = NotificationConfigService.getInstance();
      const config = service.getConfig();

      expect(config.enabled).toBe(false);
      expect(config.defaultOfflineThresholdMinutes).toBe(120);
      expect(config.maxAttemptsPerNotification).toBe(5);
      expect(config.retryDelayMinutes).toBe(30);
      expect(config.batchSize).toBe(20);
      expect(config.rateLimitPerHour).toBe(10);
      expect(config.smtpConfig.host).toBe('smtp.sendgrid.net');
      expect(config.smtpConfig.port).toBe(465);
      expect(config.smtpConfig.secure).toBe(true);
      expect(config.smtpConfig.user).toBe('testuser');
      expect(config.smtpConfig.pass).toBe('testpass');
      expect(config.smtpConfig.from).toBe('test@example.com');
      expect(config.gdprCompliant).toBe(false);
      expect(config.privacyPolicyUrl).toBe('https://example.com/privacy');
      expect(config.unsubscribeUrl).toBe('https://example.com/unsubscribe');
    });

    it('should handle invalid environment variable values gracefully', () => {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = 'invalid';
      process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES = 'not_a_number';
      process.env.SMTP_PORT = 'invalid_port';
      process.env.SMTP_SECURE = 'not_boolean';

      service = NotificationConfigService.getInstance();
      const config = service.getConfig();

      // Should use defaults for invalid values
      expect(config.enabled).toBe(true); // 'invalid' is not 'true', so defaults to true
      expect(config.defaultOfflineThresholdMinutes).toBe(60); // Invalid number defaults to 60
      expect(config.smtpConfig.port).toBe(587); // Invalid port defaults to 587
      expect(config.smtpConfig.secure).toBe(false); // Invalid boolean defaults to false
    });
  });

  describe('Configuration Updates', () => {
    beforeEach(() => {
      service = NotificationConfigService.getInstance();
    });

    it('should update configuration', () => {
      const updates = {
        enabled: false,
        defaultOfflineThresholdMinutes: 90,
        batchSize: 25
      };

      service.updateConfig(updates);
      const config = service.getConfig();

      expect(config.enabled).toBe(false);
      expect(config.defaultOfflineThresholdMinutes).toBe(90);
      expect(config.batchSize).toBe(25);
      // Other properties should remain unchanged
      expect(config.maxAttemptsPerNotification).toBe(3);
    });

    it('should return a copy to prevent mutations', () => {
      const config1 = service.getConfig();
      const config2 = service.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different object instances

      // Mutating one should not affect the other
      config1.enabled = !config1.enabled;
      expect(config2.enabled).not.toBe(config1.enabled);
    });
  });

  describe('SMTP Validation', () => {
    beforeEach(() => {
      service = NotificationConfigService.getInstance();
    });

    it('should validate valid SMTP configuration', () => {
      service.updateConfig({
        smtpConfig: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          user: 'test@gmail.com',
          pass: 'password123',
          from: 'noreply@example.com'
        }
      });

      const validation = service.validateSmtpConfig();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required SMTP fields', () => {
      service.updateConfig({
        smtpConfig: {
          host: '',
          port: 0,
          secure: false,
          user: '',
          pass: '',
          from: ''
        }
      });

      const validation = service.validateSmtpConfig();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('SMTP host is required');
      expect(validation.errors).toContain('SMTP port must be between 1 and 65535');
      expect(validation.errors).toContain('SMTP user is required');
      expect(validation.errors).toContain('SMTP password is required');
      expect(validation.errors).toContain('SMTP from address is required');
    });

    it('should validate SMTP port range', () => {
      service.updateConfig({
        smtpConfig: {
          host: 'smtp.test.com',
          port: 70000, // Invalid port
          secure: false,
          user: 'test',
          pass: 'pass',
          from: 'test@example.com'
        }
      });

      const validation = service.validateSmtpConfig();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('SMTP port must be between 1 and 65535');
    });

    it('should validate from email format', () => {
      service.updateConfig({
        smtpConfig: {
          host: 'smtp.test.com',
          port: 587,
          secure: false,
          user: 'test',
          pass: 'pass',
          from: 'invalid-email' // Invalid email format
        }
      });

      const validation = service.validateSmtpConfig();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('SMTP from address is not a valid email');
    });
  });

  describe('Configuration Summary', () => {
    beforeEach(() => {
      service = NotificationConfigService.getInstance();
    });

    it('should provide configuration summary', () => {
      service.updateConfig({
        enabled: true,
        smtpConfig: {
          host: 'smtp.test.com',
          port: 587,
          secure: false,
          user: 'testuser',
          pass: 'testpass',
          from: 'test@example.com'
        }
      });

      const summary = service.getConfigSummary();

      expect(summary.enabled).toBe(true);
      expect(summary.smtp.host).toBe('smtp.test.com');
      expect(summary.smtp.userConfigured).toBe(true);
      expect(summary.smtp.passwordConfigured).toBe(true);
      // Sensitive information should not be included
      expect(summary.smtp.user).toBeUndefined();
      expect(summary.smtp.pass).toBeUndefined();
    });

    it('should indicate when credentials are missing', () => {
      service.updateConfig({
        smtpConfig: {
          host: 'smtp.test.com',
          port: 587,
          secure: false,
          user: '',
          pass: '',
          from: 'test@example.com'
        }
      });

      const summary = service.getConfigSummary();

      expect(summary.smtp.userConfigured).toBe(false);
      expect(summary.smtp.passwordConfigured).toBe(false);
    });
  });

  describe('Environment Variable Documentation', () => {
    it('should provide environment variable documentation', () => {
      const docs = NotificationConfigService.getEnvironmentVariableDocumentation();

      expect(docs).toHaveProperty('EMAIL_NOTIFICATIONS_ENABLED');
      expect(docs).toHaveProperty('SMTP_HOST');
      expect(docs).toHaveProperty('SMTP_PORT');
      expect(docs).toHaveProperty('SMTP_USER');
      expect(docs).toHaveProperty('SMTP_PASS');

      expect(typeof docs.EMAIL_NOTIFICATIONS_ENABLED).toBe('string');
      expect(docs.EMAIL_NOTIFICATIONS_ENABLED.length).toBeGreaterThan(0);
    });
  });

  describe('Sample Environment File Generation', () => {
    it('should generate sample .env file content', () => {
      const sampleEnv = NotificationConfigService.generateSampleEnvFile();

      expect(sampleEnv).toContain('# Email Notification Configuration');
      expect(sampleEnv).toContain('EMAIL_NOTIFICATIONS_ENABLED=');
      expect(sampleEnv).toContain('SMTP_HOST=');
      expect(sampleEnv).toContain('# Example Gmail configuration:');
      expect(sampleEnv).toContain('# Example SendGrid configuration:');
      expect(sampleEnv).toContain('# Example AWS SES configuration:');

      // Should include all environment variables
      const docs = NotificationConfigService.getEnvironmentVariableDocumentation();
      Object.keys(docs).forEach(key => {
        expect(sampleEnv).toContain(`${key}=`);
      });
    });
  });

  describe('Reset to Defaults', () => {
    beforeEach(() => {
      service = NotificationConfigService.getInstance();
    });

    it('should reset configuration to defaults', () => {
      // First modify the configuration
      service.updateConfig({
        enabled: false,
        defaultOfflineThresholdMinutes: 999,
        batchSize: 999
      });

      let config = service.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.defaultOfflineThresholdMinutes).toBe(999);

      // Reset to defaults
      service.resetToDefaults();

      config = service.getConfig();
      expect(config.enabled).toBe(true); // Default value
      expect(config.defaultOfflineThresholdMinutes).toBe(60); // Default value
      expect(config.batchSize).toBe(10); // Default value
    });
  });

  describe('Warning for Missing SMTP Credentials', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should warn when email is enabled but SMTP credentials are missing', () => {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = 'true';
      process.env.SMTP_USER = '';
      process.env.SMTP_PASS = '';

      service = NotificationConfigService.getInstance();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Email notifications are enabled but SMTP credentials are missing')
      );
    });

    it('should not warn when email is disabled', () => {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = 'false';
      process.env.SMTP_USER = '';
      process.env.SMTP_PASS = '';

      service = NotificationConfigService.getInstance();

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should not warn when SMTP credentials are provided', () => {
      process.env.EMAIL_NOTIFICATIONS_ENABLED = 'true';
      process.env.SMTP_USER = 'testuser';
      process.env.SMTP_PASS = 'testpass';

      service = NotificationConfigService.getInstance();

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});
/**
 * Email notification service implementation
 */

import { Notification } from '@/lib/types/notification';

export interface EmailNotificationService {
  send(notification: Notification, recipient: string): Promise<boolean>;
  isConfigured(): boolean;
}

// HTML email template
const generateEmailHtml = (notification: Notification): string => {
  const priorityColor = {
    low: '#6b7280',
    normal: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
  }[notification.priority];

  const typeIcon = {
    message: '💬',
    mention: '🔔',
    direct_message: '📧',
    voice_call: '📞',
    server_update: '📢',
    role_update: '👑',
    system: '⚙️',
    custom: '🔸',
  }[notification.type];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${notification.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .notification-card {
            border-left: 4px solid ${priorityColor};
            background: #f8f9fa;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 20px;
        }
        .notification-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .notification-icon {
            font-size: 20px;
            margin-right: 10px;
        }
        .notification-title {
            font-weight: 600;
            font-size: 18px;
            margin: 0;
        }
        .notification-message {
            font-size: 16px;
            color: #666;
            margin: 0;
        }
        .notification-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #9ca3af;
        }
        .priority-badge {
            background: ${priorityColor};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .actions {
            text-align: center;
            margin-top: 30px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 0 10px;
        }
        .button:hover {
            background: #5a6fd8;
        }
        .button.secondary {
            background: #6b7280;
        }
        .button.secondary:hover {
            background: #4b5563;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
            }
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🏠 HAOS Notification</h1>
        </div>
        
        <div class="content">
            <div class="notification-card">
                <div class="notification-header">
                    <span class="notification-icon">${typeIcon}</span>
                    <h2 class="notification-title">${notification.title}</h2>
                </div>
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">
                    <div>
                        <span class="priority-badge">${notification.priority}</span>
                    </div>
                    <div>
                        ${notification.createdAt.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                    </div>
                </div>
            </div>

            ${notification.actions?.length ? `
            <div class="actions">
                ${notification.actions.map(action => `
                    <a href="#" class="button ${action.id === 'dismiss' ? 'secondary' : ''}">${action.label}</a>
                `).join('')}
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>
                This notification was sent from <a href="#">HAOS</a>.
                <br>
                <a href="#">Manage your notification settings</a> | 
                <a href="#">Unsubscribe from email notifications</a>
            </p>
        </div>
    </div>
</body>
</html>`;
};

// Plain text email template (fallback)
const generateEmailText = (notification: Notification): string => {
  const priorityText = notification.priority.toUpperCase();
  const timestamp = notification.createdAt.toISOString();

  return `
HAOS NOTIFICATION

${notification.title}

${notification.message}

Priority: ${priorityText}
Type: ${notification.type.replace('_', ' ')}
Time: ${timestamp}

${notification.actions?.length ? `
Available Actions:
${notification.actions.map(action => `- ${action.label}`).join('\n')}
` : ''}

---
This notification was sent from HAOS.
Manage your notification settings or unsubscribe from email notifications.
`;
};

// Mock email service implementation
export class MockEmailService implements EmailNotificationService {
  private isEnabled: boolean = false;

  constructor() {
    // Check if email is configured (in production, this would check for SMTP settings, API keys, etc.)
    this.isEnabled = !!process.env.EMAIL_ENABLED;
  }

  async send(notification: Notification, recipient: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured, skipping email notification');
      return false;
    }

    try {
      // In production, this would use a real email service like SendGrid, AWS SES, etc.
      const emailHtml = generateEmailHtml(notification);
      const emailText = generateEmailText(notification);

      console.log('📧 Email Notification Sent (Mock)');
      console.log(`To: ${recipient}`);
      console.log(`Subject: ${notification.title}`);
      console.log('--- HTML ---');
      console.log(emailHtml);
      console.log('--- TEXT ---');
      console.log(emailText);
      console.log('--- END ---');

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return this.isEnabled;
  }
}

// Real email service implementation (skeleton for production)
export class RealEmailService implements EmailNotificationService {
  private apiKey?: string;
  private fromAddress?: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY;
    this.fromAddress = process.env.EMAIL_FROM_ADDRESS;
  }

  async send(notification: Notification, recipient: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      // Example using a generic email API
      const emailData = {
        to: recipient,
        from: this.fromAddress,
        subject: notification.title,
        html: generateEmailHtml(notification),
        text: generateEmailText(notification),
      };

      // In production, replace this with actual email service call
      // const response = await fetch('https://api.emailservice.com/send', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      //   body: JSON.stringify(emailData),
      // });

      // return response.ok;

      console.log('Would send email:', emailData);
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.fromAddress);
  }
}

// Export the appropriate service based on environment
export const emailService: EmailNotificationService = process.env.NODE_ENV === 'production' 
  ? new RealEmailService() 
  : new MockEmailService();
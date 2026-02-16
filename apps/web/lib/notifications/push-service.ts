/**
 * Push notification service implementation
 */

// Temporary interface definition to bypass Turbopack import issue
interface Notification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  actions?: Array<{
    id: string;
    label: string;
  }>;
  data?: Record<string, any>;
  serverId?: string;
  channelId?: string;
}

export interface PushNotificationService {
  send(notification: Notification, subscription: PushSubscription): Promise<boolean>;
  subscribe(subscription: PushSubscription): Promise<void>;
  unsubscribe(subscription: PushSubscription): Promise<void>;
  isSupported(): boolean;
  requestPermission(): Promise<NotificationPermission>;
  getSubscription(): Promise<PushSubscription | null>;
}

// VAPID keys for push notifications (in production, these should be environment variables)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BMhzm0rjF9Z4sK5X3eM8KxGl6ZJ4Q9Qf2A5x_7yK3R8m4N6P9V2L8C1E0G3J6S9';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_VAPID_KEY_HERE';

class ClientPushService implements PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      this.initializeServiceWorker();
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async send(notification: Notification, subscription: PushSubscription): Promise<boolean> {
    // This method is called from the server side or through an API
    // It would typically send the notification through a push service like FCM
    try {
      // In production, this would make an API call to your backend
      // which would then send the push notification using web-push or similar
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification: {
            title: notification.title,
            body: notification.message,
            icon: notification.icon || '/icons/notification-icon.png',
            badge: '/icons/badge-icon.png',
            data: {
              notificationId: notification.id,
              url: this.getNotificationUrl(notification),
              actions: notification.actions,
            },
            actions: notification.actions?.map(action => ({
              action: action.id,
              title: action.label,
              icon: `/icons/action-${action.id}.png`,
            })) || [],
          },
          subscription,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  async subscribe(subscription: PushSubscription): Promise<void> {
    // Store subscription in the backend
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });
    } catch (error) {
      console.error('Failed to store push subscription:', error);
      throw error;
    }
  }

  async unsubscribe(subscription: PushSubscription): Promise<void> {
    try {
      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Remove subscription from backend
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initializeServiceWorker();
    }

    if (!this.registration) {
      throw new Error('Service Worker not available');
    }

    return this.registration.pushManager.getSubscription();
  }

  async createSubscription(): Promise<PushSubscription> {
    if (!this.registration) {
      await this.initializeServiceWorker();
    }

    if (!this.registration) {
      throw new Error('Service Worker not available');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Push notification permission not granted');
    }

    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Store the subscription
    await this.subscribe(subscription);

    return subscription;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const buffer = new ArrayBuffer(rawData.length);
    const outputArray = new Uint8Array(buffer);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private getNotificationUrl(notification: Notification): string {
    // Generate URL based on notification type and data
    const baseUrl = window.location.origin;
    
    if (notification.serverId && notification.channelId) {
      return `${baseUrl}/servers/${notification.serverId}/channels/${notification.channelId}`;
    }
    
    if (notification.serverId) {
      return `${baseUrl}/servers/${notification.serverId}`;
    }
    
    return `${baseUrl}/notifications`;
  }
}

// Server-side push service (for API routes)
class ServerPushService {
  private webpush: any;

  constructor() {
    // In production, you would install and import web-push:
    // this.webpush = require('web-push');
    // this.webpush.setVapidDetails(
    //   'mailto:your-email@example.com',
    //   VAPID_PUBLIC_KEY,
    //   VAPID_PRIVATE_KEY
    // );
  }

  async sendNotification(subscription: PushSubscription, payload: any): Promise<boolean> {
    try {
      // Mock implementation - in production use web-push
      console.log('📱 Push Notification Sent (Mock)');
      console.log('Subscription:', subscription);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }
}

// Hook for using push notifications in React components
export function usePushNotifications() {
  const pushService = new ClientPushService();

  const enablePushNotifications = async (): Promise<PushSubscription | null> => {
    try {
      if (!pushService.isSupported()) {
        throw new Error('Push notifications are not supported');
      }

      let subscription = await pushService.getSubscription();
      
      if (!subscription) {
        subscription = await pushService.createSubscription();
      }

      return subscription;
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
      return null;
    }
  };

  const disablePushNotifications = async (): Promise<void> => {
    try {
      const subscription = await pushService.getSubscription();
      if (subscription) {
        await pushService.unsubscribe(subscription);
      }
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
      throw error;
    }
  };

  const checkSupport = (): boolean => {
    return pushService.isSupported();
  };

  const checkPermission = (): NotificationPermission => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'default';
    }
    return Notification.permission;
  };

  return {
    enablePushNotifications,
    disablePushNotifications,
    checkSupport,
    checkPermission,
    isSupported: pushService.isSupported(),
    permission: checkPermission(),
  };
}

export const pushService = new ClientPushService();
export const serverPushService = new ServerPushService();
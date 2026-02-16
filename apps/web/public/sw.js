// Service Worker for HAOS Push Notifications

const CACHE_NAME = 'haos-notifications-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/icons/notification-icon.png',
        '/icons/badge-icon.png',
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received', event);

  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    const { notification, actions } = data;

    const notificationOptions = {
      body: notification.body || notification.message,
      icon: notification.icon || '/icons/notification-icon.png',
      badge: notification.badge || '/icons/badge-icon.png',
      data: notification.data || {},
      actions: notification.actions || [],
      tag: notification.data?.notificationId || `haos-notification-${Date.now()}`,
      requireInteraction: notification.data?.priority === 'urgent',
      silent: false,
    };

    // Add default actions if none provided
    if (!notificationOptions.actions.length) {
      notificationOptions.actions = [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png',
        },
      ];
    }

    event.waitUntil(
      self.registration.showNotification(
        notification.title,
        notificationOptions
      )
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('HAOS Notification', {
        body: 'You have a new notification',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close the notification
  notification.close();

  if (action === 'dismiss') {
    // Just close the notification, no further action needed
    return;
  }

  // Handle different actions
  let urlToOpen = '/';
  
  if (action === 'view' || !action) {
    // Default action - open the relevant page
    if (data.url) {
      urlToOpen = data.url;
    } else if (data.serverId && data.channelId) {
      urlToOpen = `/servers/${data.serverId}/channels/${data.channelId}`;
    } else if (data.serverId) {
      urlToOpen = `/servers/${data.serverId}`;
    } else {
      urlToOpen = '/notifications';
    }
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no matching window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );

  // Send message to client about the notification action
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          action: action || 'view',
          data: data,
          notificationId: data.notificationId,
        });
      }
    })
  );
});

// Background sync (future feature)
self.addEventListener('sync', (event) => {
  console.log('Background sync event', event.tag);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // In a real implementation, this would sync unread notifications
    // with the server and update the badge count
    console.log('Syncing notifications in background');
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'UPDATE_BADGE':
      // Update badge count (if supported by browser)
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(payload.count);
      }
      break;
    case 'CLEAR_BADGE':
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge();
      }
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

// Fetch event (for caching strategy)
self.addEventListener('fetch', (event) => {
  // Only handle specific resources for notifications
  if (event.request.url.includes('/icons/') && 
      (event.request.url.includes('notification') || event.request.url.includes('action'))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
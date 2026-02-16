/**
 * React hook for managing notifications
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Notification, 
  NotificationEvent, 
  NotificationFilter, 
  NotificationCounts, 
  NotificationSettings,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '../lib/types/notification';
// import { notificationService } from '@/lib/notifications/service';
// import { emailService } from '@/lib/notifications/email-service';
import { usePushNotifications } from '../lib/notifications/push-service';

export interface UseNotificationsOptions {
  userId?: string;
  autoLoad?: boolean;
  filter?: Partial<NotificationFilter>;
  realTime?: boolean;
}

export interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  counts: NotificationCounts | null;
  settings: NotificationSettings | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingSettings: boolean;
  isSaving: boolean;
  
  // Error states
  error: string | null;
  settingsError: string | null;
  
  // Actions
  loadNotifications: (filter?: NotificationFilter) => Promise<void>;
  loadCounts: () => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  
  // Notification actions
  markAsRead: (id: string | string[]) => Promise<void>;
  dismiss: (id: string | string[]) => Promise<void>;
  archive: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Create notifications
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Notification>;
  
  // Filters
  filter: NotificationFilter;
  updateFilter: (updates: Partial<NotificationFilter>) => void;
  resetFilter: () => void;
  
  // Push notifications
  pushService: ReturnType<typeof usePushNotifications>;
}

const DEFAULT_COUNTS: NotificationCounts = {
  total: 0,
  unread: 0,
  byType: {
    message: 0,
    mention: 0,
    direct_message: 0,
    voice_call: 0,
    server_update: 0,
    role_update: 0,
    system: 0,
    custom: 0,
  },
  byPriority: {
    low: 0,
    normal: 0,
    high: 0,
    urgent: 0,
  },
};

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { 
    userId = 'current-user', // In production, get from auth context
    autoLoad = true,
    filter: initialFilter = {},
    realTime = true,
  } = options;

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>({ userId, ...initialFilter });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Push notifications
  const pushService = usePushNotifications();

  // Load notifications
  const loadNotifications = useCallback(async (loadFilter?: NotificationFilter) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // const finalFilter = loadFilter || filter;
      // const result = await notificationService.getByFilter(finalFilter);
      const result: Notification[] = []; // Mock for testing
      setNotifications(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(message);
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Load counts
  const loadCounts = useCallback(async () => {
    try {
      // const result = await notificationService.getCounts(userId);
      setCounts(DEFAULT_COUNTS); // Mock for testing
    } catch (err) {
      console.error('Error loading notification counts:', err);
      setCounts(DEFAULT_COUNTS);
    }
  }, [userId]);

  // Load settings
  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    setSettingsError(null);
    
    try {
      // const result = await notificationService.getSettings(userId);
      // setSettings(result);
      setSettings(null); // Mock for testing
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setSettingsError(message);
      console.error('Error loading notification settings:', err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, [userId]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    setIsSaving(true);
    setSettingsError(null);
    
    try {
      // const result = await notificationService.updateSettings(userId, updates);
      // setSettings(result);
      
      // Handle push notification subscription changes
      // if ('enablePushNotifications' in updates) {
      //   if (updates.enablePushNotifications) {
      //     await pushService.enablePushNotifications();
      //   } else {
      //     await pushService.disablePushNotifications();
      //   }
      // }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update settings';
      setSettingsError(message);
      console.error('Error updating notification settings:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  // Mark as read
  const markAsRead = useCallback(async (id: string | string[]) => {
    try {
      // await notificationService.markAsRead(id);
      
      // Update local state
      const ids = Array.isArray(id) ? id : [id];
      setNotifications(prev => prev.map(n => 
        ids.includes(n.id) ? { ...n, status: 'read' as NotificationStatus, readAt: new Date() } : n
      ));
      
      // Reload counts
      await loadCounts();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      throw err;
    }
  }, [loadCounts]);

  // Dismiss notifications
  const dismiss = useCallback(async (id: string | string[]) => {
    try {
      // await notificationService.dismiss(id);
      
      // Update local state
      const ids = Array.isArray(id) ? id : [id];
      setNotifications(prev => prev.map(n => 
        ids.includes(n.id) ? { ...n, status: 'dismissed' as NotificationStatus, dismissedAt: new Date() } : n
      ));
      
      // Reload counts
      await loadCounts();
    } catch (err) {
      console.error('Error dismissing notifications:', err);
      throw err;
    }
  }, [loadCounts]);

  // Archive notification
  const archive = useCallback(async (id: string) => {
    try {
      // await notificationService.archive(id);
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, status: 'archived' as NotificationStatus } : n
      ));
      
      // Reload counts
      await loadCounts();
    } catch (err) {
      console.error('Error archiving notification:', err);
      throw err;
    }
  }, [loadCounts]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      // await notificationService.clear(userId);
      setNotifications([]);
      setCounts(DEFAULT_COUNTS);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      throw err;
    }
  }, [userId]);

  // Create notification
  const createNotification = useCallback(async (
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) => {
    try {
      // Mock notification for testing
      const notification: Notification = {
        ...notificationData,
        id: 'mock-id',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'unread',
      };
      
      return notification;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  }, [userId, settings]);

  // Filter management
  const updateFilter = useCallback((updates: Partial<NotificationFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({ userId });
  }, [userId]);

  // Real-time event handling
  // useEffect(() => {
  //   if (!realTime) return;

  //   const unsubscribe = notificationService.subscribe(userId, (event: NotificationEvent) => {
  //     // Event handling logic...
  //   });

  //   return unsubscribe;
  // }, [userId, realTime, settings?.enableDesktopNotifications, loadCounts]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadNotifications();
      loadCounts();
      loadSettings();
    }
  }, [autoLoad, loadNotifications, loadCounts, loadSettings]);

  // Reload notifications when filter changes
  useEffect(() => {
    if (autoLoad) {
      loadNotifications(filter);
    }
  }, [filter, autoLoad, loadNotifications]);

  // Memoized return value
  return useMemo(() => ({
    // Data
    notifications,
    counts: counts || DEFAULT_COUNTS,
    settings,
    
    // Loading states
    isLoading,
    isLoadingSettings,
    isSaving,
    
    // Error states
    error,
    settingsError,
    
    // Actions
    loadNotifications,
    loadCounts,
    loadSettings,
    updateSettings,
    
    // Notification actions
    markAsRead,
    dismiss,
    archive,
    clearAll,
    
    // Create notifications
    createNotification,
    
    // Filters
    filter,
    updateFilter,
    resetFilter,
    
    // Push notifications
    pushService: { // Mock for testing
      enablePushNotifications: async () => null,
      disablePushNotifications: async () => {},
      checkSupport: () => false,
      checkPermission: () => 'default' as NotificationPermission,
      isSupported: false,
      permission: 'default' as NotificationPermission,
    },
  }), [
    notifications,
    counts,
    settings,
    isLoading,
    isLoadingSettings,
    isSaving,
    error,
    settingsError,
    loadNotifications,
    loadCounts,
    loadSettings,
    updateSettings,
    markAsRead,
    dismiss,
    archive,
    clearAll,
    createNotification,
    filter,
    updateFilter,
    resetFilter,
    pushService,
  ]);
}

// Export statement removed to avoid conflicts - interfaces are already exported above
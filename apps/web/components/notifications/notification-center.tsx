'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Settings, 
  CheckCheck, 
  Trash2, 
  Archive, 
  Filter,
  Search,
  X,
  AlertCircle,
  MessageCircle,
  Phone,
  Crown,
  Megaphone,
  Cog,
  Dot,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { 
  Notification, 
  NotificationType, 
  NotificationStatus, 
  NotificationPriority 
} from '@/lib/types/notification';
import styles from './notification-center.module.css';

interface NotificationCenterProps {
  userId?: string;
  className?: string;
  onClose?: () => void;
  showSettings?: boolean;
}

const TYPE_ICONS: Record<NotificationType, React.ComponentType> = {
  message: MessageCircle,
  mention: Bell,
  direct_message: MessageCircle,
  voice_call: Phone,
  server_update: Megaphone,
  role_update: Crown,
  system: Cog,
  custom: Dot,
};

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: '#6b7280',
  normal: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onArchive: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDismiss, onArchive }: NotificationItemProps) {
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  
  const IconComponent = TYPE_ICONS[notification.type];
  const priorityColor = PRIORITY_COLORS[notification.priority];

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`${styles.notificationItem} ${
        notification.status === 'unread' ? styles.unread : ''
      }`}
      onMouseEnter={() => setIsActionsVisible(true)}
      onMouseLeave={() => setIsActionsVisible(false)}
      style={{ '--priority-color': priorityColor } as React.CSSProperties}
    >
      <div className={styles.notificationContent}>
        <div className={styles.notificationHeader}>
          <div className={styles.notificationIcon}>
            <IconComponent />
          </div>
          <div className={styles.notificationMeta}>
            <span className={styles.notificationTime}>
              {formatTimestamp(notification.createdAt)}
            </span>
            <span className={`${styles.priorityBadge} ${styles[notification.priority]}`}>
              {notification.priority}
            </span>
          </div>
        </div>
        
        <h4 className={styles.notificationTitle}>{notification.title}</h4>
        <p className={styles.notificationMessage}>{notification.message}</p>
        
        {notification.actions && notification.actions.length > 0 && (
          <div className={styles.notificationActions}>
            {notification.actions.map((action) => (
              <button
                key={action.id}
                className={`${styles.actionButton} ${styles[action.action]}`}
                onClick={() => {
                  // Handle action
                  console.log('Action clicked:', action);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isActionsVisible && (
        <div className={styles.itemActions}>
          {notification.status === 'unread' && (
            <button
              className={styles.actionIcon}
              onClick={() => onMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <CheckCheck size={16} />
            </button>
          )}
          <button
            className={styles.actionIcon}
            onClick={() => onDismiss(notification.id)}
            title="Dismiss"
          >
            <X size={16} />
          </button>
          <button
            className={styles.actionIcon}
            onClick={() => onArchive(notification.id)}
            title="Archive"
          >
            <Archive size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function NotificationCenter({ 
  userId, 
  className, 
  onClose, 
  showSettings = true 
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'mentions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([]);
  
  const {
    notifications,
    counts,
    isLoading,
    error,
    markAsRead,
    dismiss,
    archive,
    clearAll,
    updateFilter,
  } = useNotifications({ 
    userId,
    autoLoad: true,
    realTime: true,
  });

  // Filter notifications based on active tab, search, and filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply tab filter
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => n.status === 'unread');
        break;
      case 'mentions':
        filtered = filtered.filter(n => n.type === 'mention' || n.type === 'direct_message');
        break;
      // 'all' shows all notifications
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(n => selectedTypes.includes(n.type));
    }

    return filtered;
  }, [notifications, activeTab, searchQuery, selectedTypes]);

  const handleMarkAllAsRead = async () => {
    const unreadIds = filteredNotifications
      .filter(n => n.status === 'unread')
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };

  const handleTypeFilterToggle = (type: NotificationType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (error) {
    return (
      <div className={`${styles.notificationCenter} ${className}`}>
        <div className={styles.error}>
          <AlertCircle size={24} />
          <p>Failed to load notifications</p>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.notificationCenter} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <Bell size={20} />
            Notifications
            {counts && counts.unread > 0 && (
              <span className={styles.badge}>{counts.unread}</span>
            )}
          </h2>
        </div>
        <div className={styles.headerRight}>
          {showSettings && (
            <button className={styles.headerButton} title="Settings">
              <Settings size={16} />
            </button>
          )}
          {onClose && (
            <button className={styles.headerButton} onClick={onClose} title="Close">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({counts?.total ?? 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'unread' ? styles.active : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({counts?.unread ?? 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mentions' ? styles.active : ''}`}
          onClick={() => setActiveTab('mentions')}
        >
          Mentions ({(counts?.byType?.mention ?? 0) + (counts?.byType?.direct_message ?? 0)})
        </button>
      </div>

      {/* Search and Actions */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.controlButtons}>
          <button
            className={styles.controlButton}
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            <Filter size={16} />
          </button>
          <button
            className={styles.controlButton}
            onClick={handleMarkAllAsRead}
            disabled={(counts?.unread ?? 0) === 0}
            title="Mark all as read"
          >
            <CheckCheck size={16} />
          </button>
          <button
            className={styles.controlButton}
            onClick={clearAll}
            title="Clear all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={styles.filters}>
          <h4>Filter by type:</h4>
          <div className={styles.typeFilters}>
            {Object.keys(TYPE_ICONS).map(type => {
              const IconComponent = TYPE_ICONS[type as NotificationType];
              return (
                <button
                  key={type}
                  className={`${styles.typeFilter} ${
                    selectedTypes.includes(type as NotificationType) ? styles.active : ''
                  }`}
                  onClick={() => handleTypeFilterToggle(type as NotificationType)}
                >
                  <IconComponent />
                  {type.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={48} />
            <h3>No notifications</h3>
            <p>
              {searchQuery || selectedTypes.length > 0 
                ? 'No notifications match your current filters.'
                : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDismiss={dismiss}
              onArchive={archive}
            />
          ))
        )}
      </div>
    </div>
  );
}
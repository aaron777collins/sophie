'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Input, Select, Button, Avatar } from '../ui';
import type { AuditLogEntry } from '@/lib/types/server';
import styles from './settings-sections.module.css';
import auditStyles from './audit-log-settings.module.css';

interface AuditLogSettingsProps {
  entries: AuditLogEntry[];
  users: Map<string, { displayName: string; avatarUrl?: string }>;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
}

// Action types with human-readable names
const ACTION_TYPES: Record<string, { label: string; category: string }> = {
  // Server
  SERVER_UPDATE: { label: 'Server Updated', category: 'server' },
  
  // Channels
  CHANNEL_CREATE: { label: 'Channel Created', category: 'channels' },
  CHANNEL_UPDATE: { label: 'Channel Updated', category: 'channels' },
  CHANNEL_DELETE: { label: 'Channel Deleted', category: 'channels' },
  CHANNEL_OVERWRITE_CREATE: { label: 'Permission Override Created', category: 'channels' },
  CHANNEL_OVERWRITE_UPDATE: { label: 'Permission Override Updated', category: 'channels' },
  CHANNEL_OVERWRITE_DELETE: { label: 'Permission Override Deleted', category: 'channels' },
  
  // Members
  MEMBER_KICK: { label: 'Member Kicked', category: 'members' },
  MEMBER_BAN_ADD: { label: 'Member Banned', category: 'members' },
  MEMBER_BAN_REMOVE: { label: 'Ban Removed', category: 'members' },
  MEMBER_UPDATE: { label: 'Member Updated', category: 'members' },
  MEMBER_ROLE_UPDATE: { label: 'Member Roles Updated', category: 'members' },
  MEMBER_MOVE: { label: 'Member Moved', category: 'members' },
  MEMBER_DISCONNECT: { label: 'Member Disconnected', category: 'members' },
  
  // Roles
  ROLE_CREATE: { label: 'Role Created', category: 'roles' },
  ROLE_UPDATE: { label: 'Role Updated', category: 'roles' },
  ROLE_DELETE: { label: 'Role Deleted', category: 'roles' },
  
  // Invites
  INVITE_CREATE: { label: 'Invite Created', category: 'invites' },
  INVITE_UPDATE: { label: 'Invite Updated', category: 'invites' },
  INVITE_DELETE: { label: 'Invite Deleted', category: 'invites' },
  
  // Webhooks
  WEBHOOK_CREATE: { label: 'Webhook Created', category: 'webhooks' },
  WEBHOOK_UPDATE: { label: 'Webhook Updated', category: 'webhooks' },
  WEBHOOK_DELETE: { label: 'Webhook Deleted', category: 'webhooks' },
  
  // Emojis
  EMOJI_CREATE: { label: 'Emoji Created', category: 'emojis' },
  EMOJI_UPDATE: { label: 'Emoji Updated', category: 'emojis' },
  EMOJI_DELETE: { label: 'Emoji Deleted', category: 'emojis' },
  
  // Messages
  MESSAGE_DELETE: { label: 'Message Deleted', category: 'messages' },
  MESSAGE_BULK_DELETE: { label: 'Messages Bulk Deleted', category: 'messages' },
  MESSAGE_PIN: { label: 'Message Pinned', category: 'messages' },
  MESSAGE_UNPIN: { label: 'Message Unpinned', category: 'messages' },
  
  // Integrations
  INTEGRATION_CREATE: { label: 'Integration Created', category: 'integrations' },
  INTEGRATION_UPDATE: { label: 'Integration Updated', category: 'integrations' },
  INTEGRATION_DELETE: { label: 'Integration Deleted', category: 'integrations' },
};

const CATEGORIES = [
  { value: '', label: 'All Actions' },
  { value: 'server', label: 'Server' },
  { value: 'channels', label: 'Channels' },
  { value: 'members', label: 'Members' },
  { value: 'roles', label: 'Roles' },
  { value: 'invites', label: 'Invites' },
  { value: 'webhooks', label: 'Webhooks' },
  { value: 'emojis', label: 'Emojis' },
  { value: 'messages', label: 'Messages' },
  { value: 'integrations', label: 'Integrations' },
];

export function AuditLogSettings({
  entries,
  users,
  onLoadMore,
  hasMore,
  isLoading,
}: AuditLogSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Category filter
      if (categoryFilter) {
        const actionInfo = ACTION_TYPES[entry.actionType];
        if (!actionInfo || actionInfo.category !== categoryFilter) {
          return false;
        }
      }

      // User filter
      if (userFilter && entry.userId !== userFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const actionInfo = ACTION_TYPES[entry.actionType];
        const user = users.get(entry.userId);
        const searchLower = searchQuery.toLowerCase();
        
        const matchesAction = actionInfo?.label.toLowerCase().includes(searchLower);
        const matchesUser = user?.displayName.toLowerCase().includes(searchLower);
        const matchesReason = entry.reason?.toLowerCase().includes(searchLower);
        
        if (!matchesAction && !matchesUser && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [entries, categoryFilter, userFilter, searchQuery, users]);

  const uniqueUsers = useMemo(() => {
    const userIds = new Set(entries.map((e) => e.userId));
    return Array.from(userIds)
      .map((id) => {
        const user = users.get(id);
        return user ? { value: id, label: user.displayName } : null;
      })
      .filter((u): u is { value: string; label: string } => u !== null);
  }, [entries, users]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (days < 7) {
      return date.toLocaleDateString([], {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const formatChanges = (changes: AuditLogEntry['changes']) => {
    return changes.map((change, index) => (
      <div key={index} className={auditStyles.change}>
        <span className={auditStyles.changeKey}>{change.key}:</span>
        {change.oldValue !== undefined && (
          <span className={auditStyles.changeOld}>
            {JSON.stringify(change.oldValue)}
          </span>
        )}
        {change.oldValue !== undefined && change.newValue !== undefined && (
          <span className={auditStyles.changeArrow}>→</span>
        )}
        {change.newValue !== undefined && (
          <span className={auditStyles.changeNew}>
            {JSON.stringify(change.newValue)}
          </span>
        )}
      </div>
    ));
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Audit Log</h2>
      <p className={styles.sectionDescription}>
        View a record of changes and actions taken in your server.
      </p>

      <div className={styles.filterBar}>
        <div className={styles.filterBarSearch}>
          <Input
            placeholder="Search audit log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            leftIcon={<SearchIcon />}
          />
        </div>
        <Select
          options={CATEGORIES}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          size="small"
        />
        <Select
          options={[{ value: '', label: 'All Users' }, ...uniqueUsers]}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          size="small"
        />
      </div>

      <div className={auditStyles.logList}>
        {filteredEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyIcon className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>No audit log entries found</h3>
            <p className={styles.emptyStateDescription}>
              {entries.length === 0
                ? 'There are no audit log entries to display yet.'
                : 'No entries match your current filters.'}
            </p>
          </div>
        ) : (
          <>
            {filteredEntries.map((entry) => {
              const user = users.get(entry.userId);
              const actionInfo = ACTION_TYPES[entry.actionType] || {
                label: entry.actionType,
                category: 'unknown',
              };

              return (
                <div key={entry.id} className={auditStyles.logEntry}>
                  <Avatar
                    src={user?.avatarUrl}
                    alt={user?.displayName || 'Unknown'}
                    size="sm"
                  />
                  <div className={auditStyles.logContent}>
                    <div className={auditStyles.logHeader}>
                      <span className={auditStyles.logUser}>
                        {user?.displayName || 'Unknown User'}
                      </span>
                      <span className={auditStyles.logAction}>
                        {actionInfo.label}
                      </span>
                      {entry.targetId && (
                        <>
                          <span className={auditStyles.logTarget}>
                            {entry.targetType}: {entry.targetId}
                          </span>
                        </>
                      )}
                    </div>
                    {entry.reason && (
                      <div className={auditStyles.logReason}>
                        Reason: {entry.reason}
                      </div>
                    )}
                    {entry.changes.length > 0 && (
                      <div className={auditStyles.logChanges}>
                        {formatChanges(entry.changes)}
                      </div>
                    )}
                    <div className={auditStyles.logDate}>
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className={auditStyles.loadMore}>
                <Button
                  variant="secondary"
                  onClick={onLoadMore}
                  loading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 14L10 10M11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 24H40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 32H40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 40H32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AuditLogSettings;

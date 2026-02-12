'use client';

import React, { useState, useMemo } from 'react';
import { Input, Button, Avatar, FormSection } from '../ui';
import type { ServerInvite } from '@/lib/types/server';
import styles from './settings-sections.module.css';
import invitesStyles from './invites-settings.module.css';

interface InvitesSettingsProps {
  invites: ServerInvite[];
  channels: Map<string, { name: string; type: 'text' | 'voice' }>;
  users: Map<string, { displayName: string; avatarUrl?: string }>;
  onDeleteInvite: (code: string) => Promise<void>;
  onPauseInvites: () => Promise<void>;
  isPaused: boolean;
}

export function InvitesSettings({
  invites,
  channels,
  users,
  onDeleteInvite,
  onPauseInvites,
  isPaused,
}: InvitesSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const sortedInvites = useMemo(() => {
    return [...invites].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [invites]);

  const filteredInvites = useMemo(() => {
    if (!searchQuery) return sortedInvites;
    
    const query = searchQuery.toLowerCase();
    return sortedInvites.filter((invite) => {
      const inviter = users.get(invite.inviterId);
      const channel = channels.get(invite.channelId);
      return (
        invite.code.toLowerCase().includes(query) ||
        inviter?.displayName.toLowerCase().includes(query) ||
        channel?.name.toLowerCase().includes(query)
      );
    });
  }, [sortedInvites, searchQuery, users, channels]);

  const totalUses = useMemo(
    () => invites.reduce((sum, inv) => sum + inv.uses, 0),
    [invites]
  );

  const handleDeleteInvite = async (code: string) => {
    setDeletingCode(code);
    try {
      await onDeleteInvite(code);
    } finally {
      setDeletingCode(null);
    }
  };

  const formatExpiry = (invite: ServerInvite) => {
    if (invite.maxAge === 0) return 'Never';
    if (!invite.expiresAt) return 'Unknown';
    
    const now = new Date();
    const diff = invite.expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Invites</h2>
      <p className={styles.sectionDescription}>
        Manage server invites. View who created each invite and track usage.
      </p>

      {/* Stats */}
      <div className={invitesStyles.stats}>
        <div className={invitesStyles.statItem}>
          <span className={invitesStyles.statValue}>{invites.length}</span>
          <span className={invitesStyles.statLabel}>Active Invites</span>
        </div>
        <div className={invitesStyles.statItem}>
          <span className={invitesStyles.statValue}>{totalUses}</span>
          <span className={invitesStyles.statLabel}>Total Uses</span>
        </div>
      </div>

      {isPaused && (
        <div className={styles.warningBox}>
          <WarningIcon className={styles.warningBoxIcon} />
          <div className={styles.infoBoxContent}>
            <p className={styles.infoBoxTitle}>Invites Paused</p>
            <p className={styles.infoBoxText}>
              Invite links are currently disabled. New members cannot join using
              invite links until invites are resumed.
            </p>
          </div>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.filterBarSearch}>
          <Input
            placeholder="Search invites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            leftIcon={<SearchIcon />}
          />
        </div>
        <Button
          variant={isPaused ? 'primary' : 'secondary'}
          size="small"
          onClick={onPauseInvites}
        >
          {isPaused ? 'Resume Invites' : 'Pause All Invites'}
        </Button>
      </div>

      <div className={invitesStyles.inviteList}>
        {filteredInvites.length === 0 ? (
          <div className={styles.emptyState}>
            <LinkIcon className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>
              {invites.length === 0 ? 'No invites' : 'No matching invites'}
            </h3>
            <p className={styles.emptyStateDescription}>
              {invites.length === 0
                ? 'No invite links have been created for this server.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Inviter</th>
                <th>Code</th>
                <th>Channel</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvites.map((invite) => {
                const inviter = users.get(invite.inviterId);
                const channel = channels.get(invite.channelId);
                const isDeleting = deletingCode === invite.code;

                return (
                  <tr key={invite.code} className={styles.tableRow}>
                    <td>
                      <div className={invitesStyles.inviter}>
                        <Avatar
                          src={inviter?.avatarUrl}
                          alt={inviter?.displayName || 'Unknown'}
                          size="xs"
                        />
                        <span>{inviter?.displayName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <code className={invitesStyles.inviteCode}>
                        {invite.code}
                      </code>
                    </td>
                    <td>
                      <span className={invitesStyles.channel}>
                        {channel?.type === 'voice' ? '🔊' : '#'} {channel?.name || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={invitesStyles.uses}>
                        {invite.uses}
                        {invite.maxUses > 0 && ` / ${invite.maxUses}`}
                      </span>
                    </td>
                    <td>
                      <span className={invitesStyles.expiry}>
                        {formatExpiry(invite)}
                      </span>
                    </td>
                    <td>
                      <span className={invitesStyles.date}>
                        {formatDate(invite.createdAt)}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDeleteInvite(invite.code)}
                        loading={isDeleting}
                        disabled={isDeleting}
                      >
                        <TrashIcon />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

function LinkIcon({ className }: { className?: string }) {
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
        d="M26.6667 34.6667C28.0533 36.5089 29.8261 38.0289 31.8634 39.1191C33.9007 40.2094 36.1523 40.8425 38.4587 40.9746C40.765 41.1067 43.0727 40.7347 45.2175 39.8855C47.3624 39.0364 49.2918 37.7309 50.8667 36.0667L58.8667 28.0667C61.6896 25.1229 63.2429 21.2013 63.1919 17.1327C63.1409 13.0641 61.4896 9.18247 58.5936 6.31308C55.6976 3.4437 51.7977 1.82927 47.7291 1.81693C43.6605 1.80458 39.7563 3.39424 36.8267 6.24002L31.7867 11.2534"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M37.3333 29.3334C35.9467 27.4912 34.1739 25.9712 32.1366 24.8809C30.0993 23.7907 27.8477 23.1576 25.5413 23.0255C23.235 22.8934 20.9273 23.2654 18.7825 24.1145C16.6376 24.9637 14.7082 26.2692 13.1333 27.9334L5.13334 35.9334C2.31039 38.8772 0.757119 42.7988 0.808089 46.8674C0.859059 50.936 2.51037 54.8176 5.40638 57.687C8.30239 60.5564 12.2023 62.1708 16.2709 62.1831C20.3395 62.1955 24.2437 60.6058 27.1733 57.76L32.1867 52.7467"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 4H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3333V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.33333 4V2.66667C5.33333 2 6 1.33334 6.66667 1.33334H9.33333C10 1.33334 10.6667 2 10.6667 2.66667V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.57465 3.21665L1.51632 14.1666C1.37079 14.4187 1.29379 14.7044 1.29298 14.9954C1.29216 15.2864 1.36756 15.5726 1.51167 15.8255C1.65579 16.0785 1.86359 16.2893 2.11441 16.4371C2.36523 16.5849 2.65032 16.6645 2.94132 16.6666H17.058C17.349 16.6645 17.6341 16.5849 17.8849 16.4371C18.1357 16.2893 18.3435 16.0785 18.4876 15.8255C18.6317 15.5726 18.7071 15.2864 18.7063 14.9954C18.7055 14.7044 18.6285 14.4187 18.483 14.1666L11.4247 3.21665C11.2761 2.97174 11.0669 2.76925 10.8173 2.62874C10.5677 2.48824 10.2861 2.41443 9.99965 2.41443C9.71321 2.41443 9.43159 2.48824 9.18199 2.62874C8.93238 2.76925 8.72321 2.97174 8.57465 3.21665Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7.5V10.8333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14.1667H10.0083"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default InvitesSettings;

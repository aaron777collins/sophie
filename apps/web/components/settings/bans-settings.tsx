'use client';

import React, { useState, useMemo } from 'react';
import { Input, Button, Avatar, FormSection } from '../ui';
import type { ServerBan } from '@/lib/types/server';
import styles from './settings-sections.module.css';
import bansStyles from './bans-settings.module.css';

interface BansSettingsProps {
  bans: ServerBan[];
  users: Map<string, { displayName: string; avatarUrl?: string }>;
  onUnban: (userId: string) => Promise<void>;
  onBan: (userId: string, reason?: string, deleteDays?: number) => Promise<void>;
}

export function BansSettings({
  bans,
  users,
  onUnban,
  onBan,
}: BansSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [unbanningId, setUnbanningId] = useState<string | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);

  const filteredBans = useMemo(() => {
    if (!searchQuery) return bans;
    
    const query = searchQuery.toLowerCase();
    return bans.filter((ban) => {
      const user = users.get(ban.userId);
      return (
        user?.displayName.toLowerCase().includes(query) ||
        ban.userId.toLowerCase().includes(query) ||
        ban.reason?.toLowerCase().includes(query)
      );
    });
  }, [bans, searchQuery, users]);

  const handleUnban = async (userId: string) => {
    setUnbanningId(userId);
    try {
      await onUnban(userId);
    } finally {
      setUnbanningId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Bans</h2>
      <p className={styles.sectionDescription}>
        View and manage banned members. Banned users cannot rejoin the server
        until they are unbanned.
      </p>

      <div className={styles.filterBar}>
        <div className={styles.filterBarSearch}>
          <Input
            placeholder="Search bans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            leftIcon={<SearchIcon />}
          />
        </div>
        <span className={bansStyles.banCount}>
          {bans.length} {bans.length === 1 ? 'ban' : 'bans'}
        </span>
      </div>

      <div className={bansStyles.banList}>
        {filteredBans.length === 0 ? (
          <div className={styles.emptyState}>
            <BanIcon className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>
              {bans.length === 0 ? 'No bans' : 'No matching bans'}
            </h3>
            <p className={styles.emptyStateDescription}>
              {bans.length === 0
                ? 'No members have been banned from this server.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        ) : (
          filteredBans.map((ban) => {
            const user = users.get(ban.userId);
            const bannedBy = users.get(ban.bannedBy);
            const isUnbanning = unbanningId === ban.userId;

            return (
              <div key={ban.userId} className={bansStyles.banItem}>
                <Avatar
                  src={user?.avatarUrl}
                  alt={user?.displayName || 'Unknown'}
                  size="md"
                />
                <div className={bansStyles.banInfo}>
                  <div className={bansStyles.banHeader}>
                    <span className={bansStyles.banUser}>
                      {user?.displayName || 'Unknown User'}
                    </span>
                    <span className={bansStyles.banUserId}>{ban.userId}</span>
                  </div>
                  {ban.reason && (
                    <div className={bansStyles.banReason}>
                      <span className={bansStyles.banReasonLabel}>Reason:</span>{' '}
                      {ban.reason}
                    </div>
                  )}
                  <div className={bansStyles.banMeta}>
                    <span>
                      Banned by {bannedBy?.displayName || 'Unknown'} on{' '}
                      {formatDate(ban.bannedAt)}
                    </span>
                  </div>
                </div>
                <div className={bansStyles.banActions}>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleUnban(ban.userId)}
                    loading={isUnbanning}
                    disabled={isUnbanning}
                  >
                    Revoke Ban
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {bans.length > 0 && (
        <>
          <FormSection title="Bulk Actions">
            <div className={styles.warningBox}>
              <WarningIcon className={styles.warningBoxIcon} />
              <div className={styles.infoBoxContent}>
                <p className={styles.infoBoxTitle}>Proceed with caution</p>
                <p className={styles.infoBoxText}>
                  Unbanning users will allow them to rejoin the server if they
                  have an invite link.
                </p>
              </div>
            </div>
          </FormSection>
        </>
      )}
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

function BanIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="15"
        y1="15"
        x2="49"
        y2="49"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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

export default BansSettings;

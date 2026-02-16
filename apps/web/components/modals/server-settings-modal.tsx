'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Tabs, TabList, TabTrigger, TabContent, TabGroup } from '../ui';
import { OverviewSettings } from '../settings/overview-settings';
import { RolesSettings } from '../settings/roles-settings';
import { ModerationSettings } from '../settings/moderation-settings';
import { AuditLogSettings } from '../settings/audit-log-settings';
import { BansSettings } from '../settings/bans-settings';
import { InvitesSettings } from '../settings/invites-settings';
import type {
  Server,
  ServerSettingsTab,
  Role,
  AuditLogEntry,
  ServerBan,
  ServerInvite,
} from '@/lib/types/server';
import styles from './server-settings-modal.module.css';

// Icons for tabs
const TabIcons: Record<ServerSettingsTab, React.ReactNode> = {
  overview: <OverviewIcon />,
  members: <div>👥</div>,
  roles: <RolesIcon />,
  emoji: <EmojiIcon />,
  stickers: <StickersIcon />,
  moderation: <ModerationIcon />,
  'audit-log': <AuditLogIcon />,
  integrations: <IntegrationsIcon />,
  widgets: <WidgetsIcon />,
  'server-template': <TemplateIcon />,
  invites: <InvitesIcon />,
  bans: <BansIcon />,
  'safety-setup': <SafetyIcon />,
  community: <CommunityIcon />,
};

export interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  
  // Data for various tabs
  channels: { id: string; name: string; type: 'text' | 'voice' }[];
  auditLog: AuditLogEntry[];
  bans: ServerBan[];
  invites: ServerInvite[];
  users: Map<string, { displayName: string; avatarUrl?: string }>;
  
  // Permissions
  canManageServer: boolean;
  canManageRoles: boolean;
  canManageEmojis: boolean;
  canViewAuditLog: boolean;
  canBanMembers: boolean;
  canManageInvites: boolean;
  
  // Callbacks
  onUpdateServer: (updates: Partial<Server>) => Promise<void>;
  onCreateRole: () => Promise<Role>;
  onUpdateRole: (roleId: string, updates: Partial<Role>) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onReorderRoles: (roleIds: string[]) => Promise<void>;
  onLoadMoreAuditLog: () => Promise<void>;
  hasMoreAuditLog: boolean;
  isLoadingAuditLog: boolean;
  onUnbanUser: (userId: string) => Promise<void>;
  onBanUser: (userId: string, reason?: string, deleteDays?: number) => Promise<void>;
  onDeleteInvite: (code: string) => Promise<void>;
  onPauseInvites: () => Promise<void>;
  isInvitesPaused: boolean;
}

export function ServerSettingsModal({
  isOpen,
  onClose,
  server,
  channels,
  auditLog,
  bans,
  invites,
  users,
  canManageServer,
  canManageRoles,
  canManageEmojis,
  canViewAuditLog,
  canBanMembers,
  canManageInvites,
  onUpdateServer,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onReorderRoles,
  onLoadMoreAuditLog,
  hasMoreAuditLog,
  isLoadingAuditLog,
  onUnbanUser,
  onBanUser,
  onDeleteInvite,
  onPauseInvites,
  isInvitesPaused,
}: ServerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ServerSettingsTab>('overview');

  // Convert channels to Map for invites
  const channelsMap = useMemo(
    () =>
      new Map(
        channels.map((c) => [c.id, { name: c.name, type: c.type }])
      ),
    [channels]
  );

  // Define available tabs based on permissions
  const availableTabs = useMemo(() => {
    const tabs: { group: string; items: { id: ServerSettingsTab; label: string }[] }[] = [
      {
        group: 'Server Settings',
        items: [
          ...(canManageServer ? [{ id: 'overview' as const, label: 'Overview' }] : []),
          ...(canManageRoles ? [{ id: 'roles' as const, label: 'Roles' }] : []),
          ...(canManageEmojis
            ? [
                { id: 'emoji' as const, label: 'Emoji' },
                { id: 'stickers' as const, label: 'Stickers' },
              ]
            : []),
        ],
      },
      {
        group: 'Moderation',
        items: [
          ...(canManageServer ? [{ id: 'moderation' as const, label: 'Safety Setup' }] : []),
          ...(canViewAuditLog ? [{ id: 'audit-log' as const, label: 'Audit Log' }] : []),
          ...(canBanMembers ? [{ id: 'bans' as const, label: 'Bans' }] : []),
        ],
      },
      {
        group: 'User Management',
        items: [
          ...(canManageInvites ? [{ id: 'invites' as const, label: 'Invites' }] : []),
        ],
      },
      {
        group: 'Apps',
        items: [
          ...(canManageServer
            ? [
                { id: 'integrations' as const, label: 'Integrations' },
                { id: 'widgets' as const, label: 'Widget' },
              ]
            : []),
        ],
      },
      {
        group: 'Community',
        items: [
          ...(canManageServer
            ? [
                { id: 'community' as const, label: 'Enable Community' },
                { id: 'server-template' as const, label: 'Server Template' },
              ]
            : []),
        ],
      },
    ];

    // Filter out empty groups
    return tabs.filter((group) => group.items.length > 0);
  }, [
    canManageServer,
    canManageRoles,
    canManageEmojis,
    canViewAuditLog,
    canBanMembers,
    canManageInvites,
  ]);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewSettings
            server={server}
            onSave={onUpdateServer}
            channels={channels}
          />
        );

      case 'roles':
        return (
          <RolesSettings
            roles={server.roles}
            onCreateRole={onCreateRole}
            onUpdateRole={onUpdateRole}
            onDeleteRole={onDeleteRole}
            onReorderRoles={onReorderRoles}
          />
        );

      case 'moderation':
        return (
          <ModerationSettings
            server={server}
            onSave={onUpdateServer}
          />
        );

      case 'audit-log':
        return (
          <AuditLogSettings
            entries={auditLog}
            users={users}
            onLoadMore={onLoadMoreAuditLog}
            hasMore={hasMoreAuditLog}
            isLoading={isLoadingAuditLog}
          />
        );

      case 'bans':
        return (
          <BansSettings
            bans={bans}
            users={users}
            onUnban={onUnbanUser}
            onBan={onBanUser}
          />
        );

      case 'invites':
        return (
          <InvitesSettings
            invites={invites}
            channels={channelsMap}
            users={users}
            onDeleteInvite={onDeleteInvite}
            onPauseInvites={onPauseInvites}
            isPaused={isInvitesPaused}
          />
        );

      case 'emoji':
        return (
          <PlaceholderContent
            title="Emoji"
            description="Custom emoji management coming soon. You'll be able to upload, organize, and manage custom emojis for your server."
          />
        );

      case 'stickers':
        return (
          <PlaceholderContent
            title="Stickers"
            description="Custom sticker management coming soon. Create and manage sticker packs for your server members."
          />
        );

      case 'integrations':
        return (
          <PlaceholderContent
            title="Integrations"
            description="Manage bots, webhooks, and third-party integrations for your server."
          />
        );

      case 'widgets':
        return (
          <PlaceholderContent
            title="Server Widget"
            description="Configure a widget that can be embedded on external websites to show your server's online status."
          />
        );

      case 'server-template':
        return (
          <PlaceholderContent
            title="Server Template"
            description="Create a template from your server that others can use to create similar servers."
          />
        );

      case 'safety-setup':
        return (
          <PlaceholderContent
            title="Safety Setup"
            description="Configure safety features like verification levels and content filtering."
          />
        );

      case 'community':
        return (
          <PlaceholderContent
            title="Community"
            description="Enable community features to make your server discoverable and unlock additional features."
          />
        );

      default:
        return null;
    }
  }, [
    activeTab,
    server,
    channels,
    channelsMap,
    auditLog,
    bans,
    invites,
    users,
    onUpdateServer,
    onCreateRole,
    onUpdateRole,
    onDeleteRole,
    onReorderRoles,
    onLoadMoreAuditLog,
    hasMoreAuditLog,
    isLoadingAuditLog,
    onUnbanUser,
    onBanUser,
    onDeleteInvite,
    onPauseInvites,
    isInvitesPaused,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      showCloseButton={false}
      className={styles.settingsModal}
    >
      <div className={styles.settingsLayout}>
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as ServerSettingsTab)}
          orientation="vertical"
        >
          <TabList aria-label="Server settings" className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.serverName}>{server.name}</h2>
            </div>

            {availableTabs.map((group, groupIndex) => (
              <TabGroup key={group.group} label={group.group}>
                {group.items.map((item) => (
                  <TabTrigger
                    key={item.id}
                    value={item.id}
                    icon={TabIcons[item.id]}
                  >
                    {item.label}
                  </TabTrigger>
                ))}
              </TabGroup>
            ))}

            <div className={styles.sidebarFooter}>
              <button
                type="button"
                className={styles.deleteServerButton}
                onClick={() => {
                  // Show delete confirmation
                }}
              >
                Delete Server
              </button>
            </div>
          </TabList>

          <div className={styles.content}>
            <div className={styles.contentHeader}>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close settings"
              >
                <CloseIcon />
                <span>ESC</span>
              </button>
            </div>

            <TabContent value={activeTab} className={styles.tabContent}>
              {renderTabContent()}
            </TabContent>
          </div>
        </Tabs>
      </div>
    </Modal>
  );
}

// Placeholder component for unimplemented tabs
function PlaceholderContent({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles.placeholder}>
      <h2 className={styles.placeholderTitle}>{title}</h2>
      <p className={styles.placeholderDescription}>{description}</p>
    </div>
  );
}

// Icon components
function OverviewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5L1.5 5.25L9 9L16.5 5.25L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 12.75L9 16.5L16.5 12.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 9L9 12.75L16.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RolesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M12.75 15.75V14.25C12.75 13.4544 12.4339 12.6913 11.8713 12.1287C11.3087 11.5661 10.5456 11.25 9.75 11.25H3.75C2.95435 11.25 2.19129 11.5661 1.62868 12.1287C1.06607 12.6913 0.75 13.4544 0.75 14.25V15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 8.25C8.40685 8.25 9.75 6.90685 9.75 5.25C9.75 3.59315 8.40685 2.25 6.75 2.25C5.09315 2.25 3.75 3.59315 3.75 5.25C3.75 6.90685 5.09315 8.25 6.75 8.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.25 15.75V14.25C17.2495 13.5853 17.0283 12.9396 16.621 12.4143C16.2138 11.889 15.6436 11.5137 15 11.3475"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.34753C12.6453 2.51276 13.2173 2.88805 13.6257 3.41427C14.0342 3.94049 14.2559 4.58778 14.2559 5.25378C14.2559 5.91978 14.0342 6.56707 13.6257 7.09329C13.2173 7.61951 12.6453 7.9948 12 8.16003"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmojiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.625 10.5C6.1875 11.8125 7.5 12.75 9 12.75C10.5 12.75 11.8125 11.8125 12.375 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="6.375" cy="6.75" r="0.75" fill="currentColor" />
      <circle cx="11.625" cy="6.75" r="0.75" fill="currentColor" />
    </svg>
  );
}

function StickersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M15.75 9.75V5.25C15.75 3.5 14.25 2.25 12.75 2.25H5.25C3.5 2.25 2.25 3.75 2.25 5.25V12.75C2.25 14.5 3.75 15.75 5.25 15.75H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 15.75L15.75 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 9H12C10.5 9 9 10.5 9 12V15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModerationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 16.5C9 16.5 15 13.5 15 9V3.75L9 1.5L3 3.75V9C3 13.5 9 16.5 9 16.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AuditLogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M12.75 2.25H14.25C14.6478 2.25 15.0294 2.40804 15.3107 2.68934C15.592 2.97064 15.75 3.35218 15.75 3.75V15.75C15.75 16.1478 15.592 16.5294 15.3107 16.8107C15.0294 17.092 14.6478 17.25 14.25 17.25H3.75C3.35218 17.25 2.97064 17.092 2.68934 16.8107C2.40804 16.5294 2.25 16.1478 2.25 15.75V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 0.75H6.75C6.33579 0.75 6 1.08579 6 1.5V3C6 3.41421 6.33579 3.75 6.75 3.75H11.25C11.6642 3.75 12 3.41421 12 3V1.5C12 1.08579 11.6642 0.75 11.25 0.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IntegrationsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M6 3H3C2.17157 3 1.5 3.67157 1.5 4.5V15C1.5 15.8284 2.17157 16.5 3 16.5H13.5C14.3284 16.5 15 15.8284 15 15V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.5 6L16.5 1.5L12 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 9.75L16.5 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WidgetsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x="1.5"
        y="1.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="10.5"
        y="1.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="1.5"
        y="10.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="10.5"
        y="10.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M15.75 11.25V3.75C15.75 2.92157 15.0784 2.25 14.25 2.25H3.75C2.92157 2.25 2.25 2.92157 2.25 3.75V11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M1.5 11.25H16.5V14.25C16.5 15.0784 15.8284 15.75 15 15.75H3C2.17157 15.75 1.5 15.0784 1.5 14.25V11.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 11.25V15.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function InvitesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M7.5 10.5C8.61935 11.6553 10.0783 12.4121 11.6558 12.6631C13.2333 12.914 14.8505 12.6464 16.25 11.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.875 6.125L9.5 3.5C10.0304 2.96957 10.7348 2.65315 11.4775 2.60948C12.2201 2.5658 12.9559 2.79776 13.5456 3.26245C14.1354 3.72714 14.5393 4.39285 14.6778 5.1329C14.8164 5.87295 14.6795 6.63806 14.2925 7.285L13.125 9.125"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 7.5C9.38065 6.34471 7.92166 5.58795 6.34419 5.33695C4.76672 5.08596 3.14954 5.35355 1.75 6.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.125 11.875L8.5 14.5C7.96957 15.0304 7.26522 15.3469 6.52255 15.3905C5.77987 15.4342 5.04414 15.2022 4.45437 14.7375C3.86461 14.2729 3.46074 13.6071 3.32218 12.8671C3.18363 12.1271 3.3205 11.3619 3.7075 10.715L4.875 8.875"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BansIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.75 3.75L14.25 14.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SafetyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 16.5C9 16.5 15 13.5 15 9V3.75L9 1.5L3 3.75V9C3 13.5 9 16.5 9 16.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 9L8.25 10.5L11.25 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M6.75 8.25C8.40685 8.25 9.75 6.90685 9.75 5.25C9.75 3.59315 8.40685 2.25 6.75 2.25C5.09315 2.25 3.75 3.59315 3.75 5.25C3.75 6.90685 5.09315 8.25 6.75 8.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.75 15.75V14.25C0.75 13.4544 1.06607 12.6913 1.62868 12.1287C2.19129 11.5661 2.95435 11.25 3.75 11.25H9.75C10.5456 11.25 11.3087 11.5661 11.8713 12.1287C12.4339 12.6913 12.75 13.4544 12.75 14.25V15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.34003C12.6453 2.50526 13.2173 2.88055 13.6257 3.40677C14.0342 3.93299 14.2559 4.58028 14.2559 5.24628C14.2559 5.91228 14.0342 6.55957 13.6257 7.08579C13.2173 7.61201 12.6453 7.9873 12 8.15253"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 11.295C15.6539 11.4567 16.2353 11.8323 16.6506 12.3622C17.0658 12.892 17.2912 13.5454 17.29 14.2175V15.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle
        cx="9"
        cy="9"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.25 6.75L6.75 11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.75 6.75L11.25 11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default ServerSettingsModal;

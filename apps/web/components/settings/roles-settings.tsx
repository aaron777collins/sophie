'use client';

import React, { useState, useMemo } from 'react';
import {
  Input,
  Button,
  Toggle,
  ColorPicker,
  FormSection,
  Divider,
  Avatar,
} from '../ui';
import type { Role, RolePermissionKey } from '@/lib/types/server';
import { RolePermissions } from '@/lib/types/server';
import styles from './settings-sections.module.css';
import roleStyles from './roles-settings.module.css';

interface RolesSettingsProps {
  roles: Role[];
  onCreateRole: () => Promise<Role>;
  onUpdateRole: (roleId: string, updates: Partial<Role>) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onReorderRoles: (roleIds: string[]) => Promise<void>;
}

// Permission categories for organization
const PERMISSION_CATEGORIES = {
  general: {
    label: 'General Server Permissions',
    permissions: [
      'VIEW_CHANNELS',
      'MANAGE_CHANNELS',
      'MANAGE_ROLES',
      'MANAGE_EMOJIS',
      'VIEW_AUDIT_LOG',
      'MANAGE_WEBHOOKS',
      'MANAGE_SERVER',
    ] as RolePermissionKey[],
  },
  membership: {
    label: 'Membership Permissions',
    permissions: [
      'CREATE_INVITES',
      'CHANGE_NICKNAME',
      'MANAGE_NICKNAMES',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'TIMEOUT_MEMBERS',
    ] as RolePermissionKey[],
  },
  text: {
    label: 'Text Channel Permissions',
    permissions: [
      'SEND_MESSAGES',
      'SEND_MESSAGES_IN_THREADS',
      'CREATE_THREADS',
      'EMBED_LINKS',
      'ATTACH_FILES',
      'ADD_REACTIONS',
      'USE_EXTERNAL_EMOJIS',
      'USE_EXTERNAL_STICKERS',
      'MENTION_EVERYONE',
      'MANAGE_MESSAGES',
      'MANAGE_THREADS',
      'READ_MESSAGE_HISTORY',
      'SEND_TTS_MESSAGES',
    ] as RolePermissionKey[],
  },
  voice: {
    label: 'Voice Channel Permissions',
    permissions: [
      'CONNECT',
      'SPEAK',
      'STREAM',
      'USE_VOICE_ACTIVITY',
      'USE_SOUNDBOARD',
      'MUTE_MEMBERS',
      'DEAFEN_MEMBERS',
      'MOVE_MEMBERS',
      'PRIORITY_SPEAKER',
    ] as RolePermissionKey[],
  },
  advanced: {
    label: 'Advanced Permissions',
    permissions: ['ADMINISTRATOR'] as RolePermissionKey[],
  },
};

// Human-readable permission names
const PERMISSION_LABELS: Record<RolePermissionKey, { name: string; description: string }> = {
  VIEW_CHANNELS: {
    name: 'View Channels',
    description: 'Allows members to view channels by default',
  },
  MANAGE_CHANNELS: {
    name: 'Manage Channels',
    description: 'Allows management and editing of channels',
  },
  MANAGE_ROLES: {
    name: 'Manage Roles',
    description: 'Allows management and editing of roles',
  },
  MANAGE_EMOJIS: {
    name: 'Manage Expressions',
    description: 'Allows management and editing of emojis, stickers, and soundboard sounds',
  },
  VIEW_AUDIT_LOG: {
    name: 'View Audit Log',
    description: 'Allows viewing of audit logs',
  },
  MANAGE_WEBHOOKS: {
    name: 'Manage Webhooks',
    description: 'Allows management and editing of webhooks',
  },
  MANAGE_SERVER: {
    name: 'Manage Server',
    description: 'Allows management and editing of the server',
  },
  CREATE_INVITES: {
    name: 'Create Invite',
    description: 'Allows creating invites',
  },
  CHANGE_NICKNAME: {
    name: 'Change Nickname',
    description: 'Allows changing own nickname',
  },
  MANAGE_NICKNAMES: {
    name: 'Manage Nicknames',
    description: 'Allows management and editing of other members\' nicknames',
  },
  KICK_MEMBERS: {
    name: 'Kick Members',
    description: 'Allows kicking members from the server',
  },
  BAN_MEMBERS: {
    name: 'Ban Members',
    description: 'Allows banning members from the server',
  },
  TIMEOUT_MEMBERS: {
    name: 'Timeout Members',
    description: 'Allows timing out members to prevent them from sending messages',
  },
  SEND_MESSAGES: {
    name: 'Send Messages',
    description: 'Allows sending messages in text channels',
  },
  SEND_MESSAGES_IN_THREADS: {
    name: 'Send Messages in Threads',
    description: 'Allows sending messages in threads',
  },
  CREATE_THREADS: {
    name: 'Create Public Threads',
    description: 'Allows creating public threads',
  },
  EMBED_LINKS: {
    name: 'Embed Links',
    description: 'Allows links sent to show embedded content',
  },
  ATTACH_FILES: {
    name: 'Attach Files',
    description: 'Allows uploading files',
  },
  ADD_REACTIONS: {
    name: 'Add Reactions',
    description: 'Allows adding reactions to messages',
  },
  USE_EXTERNAL_EMOJIS: {
    name: 'Use External Emojis',
    description: 'Allows the usage of custom emojis from other servers',
  },
  USE_EXTERNAL_STICKERS: {
    name: 'Use External Stickers',
    description: 'Allows the usage of custom stickers from other servers',
  },
  MENTION_EVERYONE: {
    name: 'Mention @everyone, @here, and All Roles',
    description: 'Allows mentioning @everyone, @here, and all roles',
  },
  MANAGE_MESSAGES: {
    name: 'Manage Messages',
    description: 'Allows deleting and pinning messages from other members',
  },
  MANAGE_THREADS: {
    name: 'Manage Threads',
    description: 'Allows archiving, deleting, and editing threads',
  },
  READ_MESSAGE_HISTORY: {
    name: 'Read Message History',
    description: 'Allows reading message history',
  },
  SEND_TTS_MESSAGES: {
    name: 'Send Text-to-Speech Messages',
    description: 'Allows sending TTS messages',
  },
  USE_VOICE_ACTIVITY: {
    name: 'Use Voice Activity',
    description: 'Allows using voice activity detection (speaking without push-to-talk)',
  },
  CONNECT: {
    name: 'Connect',
    description: 'Allows connecting to voice channels',
  },
  SPEAK: {
    name: 'Speak',
    description: 'Allows speaking in voice channels',
  },
  STREAM: {
    name: 'Video',
    description: 'Allows streaming video in voice channels',
  },
  USE_SOUNDBOARD: {
    name: 'Use Soundboard',
    description: 'Allows using sounds from the soundboard',
  },
  MUTE_MEMBERS: {
    name: 'Mute Members',
    description: 'Allows muting members in voice channels',
  },
  DEAFEN_MEMBERS: {
    name: 'Deafen Members',
    description: 'Allows deafening members in voice channels',
  },
  MOVE_MEMBERS: {
    name: 'Move Members',
    description: 'Allows moving members between voice channels',
  },
  PRIORITY_SPEAKER: {
    name: 'Priority Speaker',
    description: 'Allows using priority speaker in voice channels',
  },
  ADMINISTRATOR: {
    name: 'Administrator',
    description: 'Members with this permission have every permission and bypass channel-specific permissions. This is a dangerous permission to grant.',
  },
};

export function RolesSettings({
  roles,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onReorderRoles,
}: RolesSettingsProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    roles[0]?.id || null
  );
  const [editedRole, setEditedRole] = useState<Partial<Role> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => b.position - a.position),
    [roles]
  );

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId),
    [roles, selectedRoleId]
  );

  const currentRole = editedRole
    ? { ...selectedRole, ...editedRole }
    : selectedRole;

  const hasChanges = editedRole !== null;

  const handleSelectRole = (roleId: string) => {
    if (hasChanges) {
      // Could show confirmation dialog here
    }
    setSelectedRoleId(roleId);
    setEditedRole(null);
  };

  const handleUpdateField = <K extends keyof Role>(
    field: K,
    value: Role[K]
  ) => {
    setEditedRole((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasPermission = (permission: RolePermissionKey): boolean => {
    if (!currentRole || currentRole.permissions === undefined) return false;
    const permValue = RolePermissions[permission];
    return (currentRole.permissions & permValue) === permValue;
  };

  const togglePermission = (permission: RolePermissionKey) => {
    if (!currentRole || currentRole.permissions === undefined) return;
    const permValue = RolePermissions[permission];
    const newPermissions = hasPermission(permission)
      ? currentRole.permissions & ~permValue
      : currentRole.permissions | permValue;
    handleUpdateField('permissions', newPermissions);
  };

  const handleCreateRole = async () => {
    setIsCreating(true);
    try {
      const newRole = await onCreateRole();
      setSelectedRoleId(newRole.id);
      setEditedRole(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId || !editedRole) return;
    setIsSaving(true);
    try {
      await onUpdateRole(selectedRoleId, editedRole);
      setEditedRole(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoleId) return;
    // Could show confirmation dialog here
    await onDeleteRole(selectedRoleId);
    setSelectedRoleId(sortedRoles[0]?.id || null);
    setEditedRole(null);
  };

  const handleReset = () => {
    setEditedRole(null);
  };

  const filteredRoles = searchQuery
    ? sortedRoles.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedRoles;

  return (
    <div className={roleStyles.rolesContainer}>
      {/* Role List Sidebar */}
      <div className={roleStyles.rolesList}>
        <div className={roleStyles.rolesHeader}>
          <h3 className={roleStyles.rolesTitle}>Roles — {roles.length}</h3>
          <Button
            variant="primary"
            size="small"
            onClick={handleCreateRole}
            loading={isCreating}
          >
            Create Role
          </Button>
        </div>

        <div className={roleStyles.rolesSearch}>
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            leftIcon={<SearchIcon />}
          />
        </div>

        <div className={roleStyles.rolesListItems}>
          {filteredRoles.map((role) => (
            <button
              key={role.id}
              className={`${roleStyles.roleItem} ${
                role.id === selectedRoleId ? roleStyles.selected : ''
              }`}
              onClick={() => handleSelectRole(role.id)}
            >
              <span
                className={roleStyles.roleColor}
                style={{ backgroundColor: role.color }}
              />
              <span className={roleStyles.roleName}>{role.name}</span>
              <span className={roleStyles.roleMemberCount}>
                {role.memberCount ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Editor */}
      <div className={roleStyles.roleEditor}>
        {currentRole ? (
          <>
            <div className={roleStyles.roleEditorHeader}>
              <div className={roleStyles.rolePreview}>
                <span
                  className={roleStyles.rolePreviewColor}
                  style={{ backgroundColor: currentRole.color }}
                />
                <span className={roleStyles.rolePreviewName}>
                  {currentRole.name}
                </span>
              </div>
            </div>

            <div className={roleStyles.roleEditorContent}>
              {/* Display Tab */}
              <FormSection title="Role Display">
                <Input
                  label="Role Name"
                  value={currentRole.name}
                  onChange={(e) => handleUpdateField('name', e.target.value)}
                  maxLength={100}
                  fullWidth
                />

                <ColorPicker
                  label="Role Color"
                  value={currentRole.color || '#99aab5'}
                  onChange={(color) => handleUpdateField('color', color)}
                />

                <Toggle
                  label="Display role members separately from online members"
                  checked={currentRole.hoist}
                  onChange={(e) => handleUpdateField('hoist', e.target.checked)}
                />

                <Toggle
                  label="Allow anyone to @mention this role"
                  checked={currentRole.mentionable}
                  onChange={(e) =>
                    handleUpdateField('mentionable', e.target.checked)
                  }
                />
              </FormSection>

              <Divider />

              {/* Permissions */}
              <FormSection title="Permissions">
                {Object.entries(PERMISSION_CATEGORIES).map(
                  ([categoryKey, category]) => (
                    <div key={categoryKey} className={roleStyles.permissionCategory}>
                      <h4 className={roleStyles.permissionCategoryTitle}>
                        {category.label}
                      </h4>
                      <div className={roleStyles.permissionList}>
                        {category.permissions.map((permission) => {
                          const info = PERMISSION_LABELS[permission];
                          const isAdmin = permission === 'ADMINISTRATOR';
                          return (
                            <div
                              key={permission}
                              className={`${roleStyles.permissionItem} ${
                                isAdmin ? roleStyles.dangerPermission : ''
                              }`}
                            >
                              <Toggle
                                label={info.name}
                                description={info.description}
                                checked={hasPermission(permission)}
                                onChange={() => togglePermission(permission)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </FormSection>

              <Divider />

              {/* Danger Zone */}
              {!currentRole.managed && currentRole.name !== '@everyone' && (
                <FormSection title="Delete Role">
                  <p className={roleStyles.dangerText}>
                    Deleting a role is irreversible. All members with this role
                    will lose its permissions.
                  </p>
                  <Button variant="danger" onClick={handleDelete}>
                    Delete Role
                  </Button>
                </FormSection>
              )}
            </div>

            {hasChanges && (
              <div className={styles.saveBar}>
                <span className={styles.saveBarText}>
                  Careful — you have unsaved changes!
                </span>
                <div className={styles.saveBarActions}>
                  <Button variant="ghost" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="primary" onClick={handleSave} loading={isSaving}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={roleStyles.noRoleSelected}>
            <p>Select a role to edit or create a new one</p>
          </div>
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

export default RolesSettings;

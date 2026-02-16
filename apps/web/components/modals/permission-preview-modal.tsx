'use client';

import React, { useMemo } from 'react';
import { Modal, Button, Avatar, Divider } from '../ui';
import type { ServerMember, Role, RolePermissionKey } from '@/lib/types/server';
import { RolePermissions } from '@/lib/types/server';
import { RoleChange } from '../settings/member-management';
import styles from './permission-preview-modal.module.css';

interface PermissionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  members: ServerMember[];
  roles: Role[];
  roleChanges: RoleChange[];
  isLoading?: boolean;
}

// Human-readable permission names (subset from roles-settings.tsx)
const PERMISSION_LABELS: Partial<Record<RolePermissionKey, string>> = {
  ADMINISTRATOR: 'Administrator',
  MANAGE_SERVER: 'Manage Server',
  MANAGE_ROLES: 'Manage Roles',
  MANAGE_CHANNELS: 'Manage Channels',
  KICK_MEMBERS: 'Kick Members',
  BAN_MEMBERS: 'Ban Members',
  MANAGE_MESSAGES: 'Manage Messages',
  MANAGE_NICKNAMES: 'Manage Nicknames',
  VIEW_AUDIT_LOG: 'View Audit Log',
  MENTION_EVERYONE: 'Mention @everyone',
  MANAGE_WEBHOOKS: 'Manage Webhooks',
  SEND_MESSAGES: 'Send Messages',
  VIEW_CHANNELS: 'View Channels',
};

// Get significant permissions for preview
const SIGNIFICANT_PERMISSIONS: RolePermissionKey[] = [
  'ADMINISTRATOR',
  'MANAGE_SERVER',
  'MANAGE_ROLES',
  'MANAGE_CHANNELS', 
  'KICK_MEMBERS',
  'BAN_MEMBERS',
  'MANAGE_MESSAGES',
  'MANAGE_NICKNAMES',
  'VIEW_AUDIT_LOG',
  'MENTION_EVERYONE',
];

export function PermissionPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  members,
  roles,
  roleChanges,
  isLoading = false,
}: PermissionPreviewModalProps) {
  // Calculate permission changes for each member
  const memberPermissionChanges = useMemo(() => {
    return members.map(member => {
      const currentRoles = member.roles.map(roleId => roles.find(r => r.id === roleId)).filter(Boolean) as Role[];
      const currentPermissions = calculateCombinedPermissions(currentRoles);
      
      // Apply role changes
      const newRoleIds = [...member.roles];
      roleChanges.forEach(change => {
        if (change.action === 'add') {
          if (!newRoleIds.includes(change.roleId)) {
            newRoleIds.push(change.roleId);
          }
        } else {
          const index = newRoleIds.indexOf(change.roleId);
          if (index > -1) {
            newRoleIds.splice(index, 1);
          }
        }
      });
      
      const newRoles = newRoleIds.map(roleId => roles.find(r => r.id === roleId)).filter(Boolean) as Role[];
      const newPermissions = calculateCombinedPermissions(newRoles);
      
      const gainedPermissions = getPermissionDifferences(currentPermissions, newPermissions);
      const lostPermissions = getPermissionDifferences(newPermissions, currentPermissions);
      
      return {
        member,
        currentRoles,
        newRoles,
        gainedPermissions,
        lostPermissions,
        hasSignificantChanges: gainedPermissions.some(p => SIGNIFICANT_PERMISSIONS.includes(p)) ||
                             lostPermissions.some(p => SIGNIFICANT_PERMISSIONS.includes(p))
      };
    });
  }, [members, roles, roleChanges]);

  function calculateCombinedPermissions(memberRoles: Role[]): bigint {
    return memberRoles.reduce((perms, role) => perms | role.permissions, 0n);
  }

  function getPermissionDifferences(oldPerms: bigint, newPerms: bigint): RolePermissionKey[] {
    const diff = newPerms & ~oldPerms; // Permissions in new but not in old
    const permissions: RolePermissionKey[] = [];
    
    for (const [key, value] of Object.entries(RolePermissions)) {
      if ((diff & value) === value) {
        permissions.push(key as RolePermissionKey);
      }
    }
    
    return permissions;
  }

  const membersWithSignificantChanges = memberPermissionChanges.filter(m => m.hasSignificantChanges);
  const totalMembers = members.length;
  const rolesBeingAdded = roleChanges.filter(c => c.action === 'add').map(c => roles.find(r => r.id === c.roleId)).filter(Boolean) as Role[];
  const rolesBeingRemoved = roleChanges.filter(c => c.action === 'remove').map(c => roles.find(r => r.id === c.roleId)).filter(Boolean) as Role[];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Review Permission Changes"
      size="large"
    >
      <div className={styles.container}>
        <div className={styles.summary}>
          <h3>Summary of Changes</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{totalMembers}</span>
              <span className={styles.statLabel}>Members Affected</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{roleChanges.length}</span>
              <span className={styles.statLabel}>Role Changes</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{membersWithSignificantChanges.length}</span>
              <span className={styles.statLabel}>Significant Changes</span>
            </div>
          </div>
        </div>

        {/* Role Changes Overview */}
        <div className={styles.section}>
          <h4>Role Changes</h4>
          {rolesBeingAdded.length > 0 && (
            <div className={styles.roleChangeGroup}>
              <span className={styles.changeLabel}>Adding Roles:</span>
              <div className={styles.roleList}>
                {rolesBeingAdded.map(role => (
                  <span
                    key={role.id}
                    className={`${styles.roleTag} ${styles.addRole}`}
                    style={{ backgroundColor: role.color }}
                  >
                    + {role.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {rolesBeingRemoved.length > 0 && (
            <div className={styles.roleChangeGroup}>
              <span className={styles.changeLabel}>Removing Roles:</span>
              <div className={styles.roleList}>
                {rolesBeingRemoved.map(role => (
                  <span
                    key={role.id}
                    className={`${styles.roleTag} ${styles.removeRole}`}
                    style={{ backgroundColor: role.color }}
                  >
                    - {role.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Significant Permission Changes */}
        {membersWithSignificantChanges.length > 0 && (
          <div className={styles.section}>
            <h4 className={styles.warningTitle}>
              <WarningIcon />
              Members with Significant Permission Changes
            </h4>
            <p className={styles.warningText}>
              These members will gain or lose important permissions. Please review carefully.
            </p>
            
            <div className={styles.memberList}>
              {membersWithSignificantChanges.slice(0, 5).map(({ member, gainedPermissions, lostPermissions }) => (
                <div key={member.id} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    <Avatar
                      src={member.avatarUrl}
                      alt={member.displayName}
                      size="sm"
                    />
                    <span className={styles.memberName}>
                      {member.nickname || member.displayName}
                    </span>
                  </div>
                  
                  <div className={styles.permissionChanges}>
                    {gainedPermissions.filter(p => SIGNIFICANT_PERMISSIONS.includes(p)).map(permission => (
                      <span key={permission} className={`${styles.permissionTag} ${styles.gained}`}>
                        + {PERMISSION_LABELS[permission] || permission}
                      </span>
                    ))}
                    {lostPermissions.filter(p => SIGNIFICANT_PERMISSIONS.includes(p)).map(permission => (
                      <span key={permission} className={`${styles.permissionTag} ${styles.lost}`}>
                        - {PERMISSION_LABELS[permission] || permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              {membersWithSignificantChanges.length > 5 && (
                <div className={styles.moreMembers}>
                  and {membersWithSignificantChanges.length - 5} more members...
                </div>
              )}
            </div>
          </div>
        )}

        {/* No significant changes */}
        {membersWithSignificantChanges.length === 0 && (
          <div className={styles.section}>
            <div className={styles.noSignificantChanges}>
              <CheckIcon />
              <div>
                <h4>No Significant Permission Changes</h4>
                <p>These role changes will not grant or remove any dangerous permissions.</p>
              </div>
            </div>
          </div>
        )}

        <Divider />

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={membersWithSignificantChanges.length > 0 ? "danger" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
          >
            {membersWithSignificantChanges.length > 0
              ? `Apply Changes (${membersWithSignificantChanges.length} high-risk)`
              : "Apply Changes"
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.516-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        fill="#F23F42"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.6667 5L7.50001 14.1667L3.33334 10"
        stroke="#00D26A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PermissionPreviewModal;
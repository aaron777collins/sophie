'use client';

import React, { useState, useMemo } from 'react';
import {
  Input,
  Button,
  Checkbox,
  Select,
  FormSection,
  Avatar,
  Divider,
} from '../ui';
import type { ServerMember, Role, AuditLogEntry } from '@/lib/types/server';
import styles from './settings-sections.module.css';
import memberStyles from './member-management.module.css';

interface MemberManagementProps {
  members: ServerMember[];
  roles: Role[];
  auditLog: AuditLogEntry[];
  onBulkRoleAssignment: (memberIds: string[], roleChanges: RoleChange[]) => Promise<void>;
  onUndoRoleChanges: (changeIds: string[]) => Promise<void>;
  canManageRoles: boolean;
}

export interface RoleChange {
  roleId: string;
  action: 'add' | 'remove';
}

export function MemberManagement({
  members,
  roles,
  auditLog,
  onBulkRoleAssignment,
  onUndoRoleChanges,
  canManageRoles,
}: MemberManagementProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.displayName.toLowerCase().includes(query) ||
          member.nickname?.toLowerCase().includes(query)
      );
    }

    // Filter by role
    if (roleFilter !== 'all') {
      if (roleFilter === 'none') {
        filtered = filtered.filter((member) => member.roles.length === 0);
      } else {
        filtered = filtered.filter((member) => member.roles.includes(roleFilter));
      }
    }

    return filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [members, searchQuery, roleFilter]);

  // Get recent role changes that can be undone
  const recentRoleChanges = useMemo(() => {
    const roleChangeEntries = auditLog
      .filter((entry) => entry.actionType === 'MEMBER_ROLE_UPDATE')
      .slice(0, 10); // Last 10 role changes

    return roleChangeEntries.map((entry) => ({
      id: entry.id,
      memberName: getMemberName(entry.targetId),
      userId: entry.userId,
      targetId: entry.targetId,
      changes: entry.changes,
      createdAt: entry.createdAt,
      canUndo: (Date.now() - entry.createdAt.getTime()) < 24 * 60 * 60 * 1000, // 24 hours
    }));
  }, [auditLog]);

  function getMemberName(userId?: string): string {
    if (!userId) return 'Unknown User';
    const member = members.find(m => m.userId === userId);
    return member?.displayName || 'Unknown User';
  }

  function getRoleName(roleId: string): string {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  }

  const handleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const handleSelectMember = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const handleBulkRoleAssignment = async (roleChanges: RoleChange[]) => {
    if (selectedMembers.size === 0 || roleChanges.length === 0) return;

    setIsLoading(true);
    try {
      await onBulkRoleAssignment(Array.from(selectedMembers), roleChanges);
      setSelectedMembers(new Set());
      setShowBulkActions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndoChanges = async (changeIds: string[]) => {
    setIsLoading(true);
    try {
      await onUndoRoleChanges(changeIds);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Members' },
    { value: 'none', label: 'No Roles' },
    ...roles.map(role => ({ value: role.id, label: role.name }))
  ];

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Member Management</h2>
      <p className={styles.sectionDescription}>
        View and manage server members, assign roles in bulk, and review role change history.
      </p>

      {/* Search and Filters */}
      <FormSection title="Filters">
        <div className={memberStyles.filtersRow}>
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon />}
            fullWidth
          />
          <Select
            value={roleFilter}
            onChange={(value) => setRoleFilter(value)}
            options={roleOptions}
            placeholder="Filter by role"
          />
        </div>
      </FormSection>

      <Divider />

      {/* Member List */}
      <FormSection 
        title={`Members — ${filteredMembers.length}`}
        action={
          canManageRoles ? (
            <div className={memberStyles.bulkActions}>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowBulkActions(!showBulkActions)}
                disabled={selectedMembers.size === 0}
              >
                Bulk Actions ({selectedMembers.size})
              </Button>
            </div>
          ) : undefined
        }
      >
        {canManageRoles && (
          <div className={memberStyles.memberListHeader}>
            <Checkbox
              label="Select all members"
              checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
              indeterminate={selectedMembers.size > 0 && selectedMembers.size < filteredMembers.length}
              onChange={handleSelectAll}
            />
            <span className={memberStyles.headerLabel}>Member</span>
            <span className={memberStyles.headerLabel}>Roles</span>
            <span className={memberStyles.headerLabel}>Joined</span>
          </div>
        )}

        <div className={memberStyles.memberList}>
          {filteredMembers.map((member) => (
            <div key={member.id} className={memberStyles.memberRow}>
              {canManageRoles && (
                <Checkbox
                  checked={selectedMembers.has(member.id)}
                  onChange={() => handleSelectMember(member.id)}
                  aria-label={`Select ${member.displayName}`}
                />
              )}
              
              <div className={memberStyles.memberInfo}>
                <Avatar
                  src={member.avatarUrl}
                  name={member.displayName}
                  size="small"
                />
                <div className={memberStyles.memberDetails}>
                  <span className={memberStyles.memberName}>
                    {member.nickname || member.displayName}
                  </span>
                  {member.nickname && (
                    <span className={memberStyles.memberUsername}>
                      {member.displayName}
                    </span>
                  )}
                </div>
              </div>

              <div className={memberStyles.memberRoles}>
                {member.roles.length === 0 ? (
                  <span className={memberStyles.noRoles}>No roles</span>
                ) : (
                  member.roles.slice(0, 3).map((roleId) => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <span
                        key={roleId}
                        className={memberStyles.roleTag}
                        style={{ backgroundColor: role.color }}
                      >
                        {role.name}
                      </span>
                    ) : null;
                  })
                )}
                {member.roles.length > 3 && (
                  <span className={memberStyles.moreRoles}>
                    +{member.roles.length - 3} more
                  </span>
                )}
              </div>

              <div className={memberStyles.memberJoined}>
                {new Date(member.joinedAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className={memberStyles.noMembers}>
              <p>No members found matching your filters.</p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedMembers.size > 0 && canManageRoles && (
        <div className={memberStyles.bulkActionsPanel}>
          <h3>Bulk Role Assignment</h3>
          <p>Apply role changes to {selectedMembers.size} selected member{selectedMembers.size === 1 ? '' : 's'}:</p>
          <BulkRoleAssignmentForm
            roles={roles}
            onAssign={handleBulkRoleAssignment}
            isLoading={isLoading}
          />
        </div>
      )}

      <Divider />

      {/* Recent Role Changes */}
      <FormSection title="Recent Role Changes">
        {recentRoleChanges.length === 0 ? (
          <p className={styles.emptyState}>No recent role changes.</p>
        ) : (
          <div className={memberStyles.auditList}>
            {recentRoleChanges.slice(0, 5).map((entry) => (
              <div key={entry.id} className={memberStyles.auditEntry}>
                <div className={memberStyles.auditInfo}>
                  <span className={memberStyles.auditMember}>
                    {entry.memberName}
                  </span>
                  <span className={memberStyles.auditDetails}>
                    Role changes by {getMemberName(entry.userId)}
                  </span>
                  <span className={memberStyles.auditTime}>
                    {entry.createdAt.toLocaleString()}
                  </span>
                </div>
                {entry.canUndo && canManageRoles && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleUndoChanges([entry.id])}
                    disabled={isLoading}
                  >
                    Undo
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </FormSection>
    </div>
  );
}

// Bulk Role Assignment Form Component
interface BulkRoleAssignmentFormProps {
  roles: Role[];
  onAssign: (roleChanges: RoleChange[]) => Promise<void>;
  isLoading: boolean;
}

function BulkRoleAssignmentForm({ roles, onAssign, isLoading }: BulkRoleAssignmentFormProps) {
  const [roleChanges, setRoleChanges] = useState<RoleChange[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [action, setAction] = useState<'add' | 'remove'>('add');

  const addRoleChange = () => {
    if (!selectedRole) return;
    
    const exists = roleChanges.some(change => 
      change.roleId === selectedRole && change.action === action
    );
    
    if (!exists) {
      setRoleChanges([...roleChanges, { roleId: selectedRole, action }]);
    }
    setSelectedRole('');
  };

  const removeRoleChange = (index: number) => {
    setRoleChanges(roleChanges.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (roleChanges.length === 0) return;
    onAssign(roleChanges);
  };

  return (
    <div className={memberStyles.bulkForm}>
      <div className={memberStyles.formRow}>
        <Select
          value={selectedRole}
          onChange={setSelectedRole}
          options={roles.map(role => ({ value: role.id, label: role.name }))}
          placeholder="Select a role"
        />
        <Select
          value={action}
          onChange={(value) => setAction(value as 'add' | 'remove')}
          options={[
            { value: 'add', label: 'Add Role' },
            { value: 'remove', label: 'Remove Role' }
          ]}
        />
        <Button
          variant="ghost"
          onClick={addRoleChange}
          disabled={!selectedRole}
        >
          Add Change
        </Button>
      </div>

      {roleChanges.length > 0 && (
        <div className={memberStyles.roleChangesList}>
          <h4>Planned Changes:</h4>
          {roleChanges.map((change, index) => {
            const role = roles.find(r => r.id === change.roleId);
            return (
              <div key={index} className={memberStyles.roleChangeItem}>
                <span className={memberStyles.changeAction}>
                  {change.action === 'add' ? '+ Add' : '- Remove'}
                </span>
                <span className={memberStyles.changRole}>
                  {role?.name || 'Unknown Role'}
                </span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => removeRoleChange(index)}
                >
                  ×
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className={memberStyles.formActions}>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={roleChanges.length === 0 || isLoading}
          loading={isLoading}
        >
          Apply Role Changes
        </Button>
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

export default MemberManagement;
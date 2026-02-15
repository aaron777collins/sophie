'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, Select, Checkbox, Avatar, Divider } from '../ui';
import { PermissionPreviewModal } from './permission-preview-modal';
import type { ServerMember, Role } from '@/lib/types/server';
import { RoleChange } from '../settings/member-management';
import styles from './bulk-role-assignment-modal.module.css';

interface BulkRoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ServerMember[];
  roles: Role[];
  preSelectedMembers?: string[];
  onAssign: (memberIds: string[], roleChanges: RoleChange[]) => Promise<void>;
}

export function BulkRoleAssignmentModal({
  isOpen,
  onClose,
  members,
  roles,
  preSelectedMembers = [],
  onAssign,
}: BulkRoleAssignmentModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(preSelectedMembers));
  const [roleChanges, setRoleChanges] = useState<RoleChange[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter members
  const filteredMembers = members.filter(member => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !member.displayName.toLowerCase().includes(query) &&
        !member.nickname?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (roleFilter !== 'all') {
      if (roleFilter === 'none') {
        return member.roles.length === 0;
      } else {
        return member.roles.includes(roleFilter);
      }
    }

    return true;
  });

  const selectedMemberObjects = members.filter(m => selectedMembers.has(m.id));

  const handleClose = () => {
    setSelectedMembers(new Set());
    setRoleChanges([]);
    setSearchQuery('');
    setRoleFilter('all');
    setShowPreview(false);
    onClose();
  };

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

  const addRoleChange = (roleId: string, action: 'add' | 'remove') => {
    const exists = roleChanges.some(change => 
      change.roleId === roleId && change.action === action
    );
    
    if (!exists) {
      setRoleChanges([...roleChanges, { roleId, action }]);
    }
  };

  const removeRoleChange = (index: number) => {
    setRoleChanges(roleChanges.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    if (selectedMembers.size === 0 || roleChanges.length === 0) return;
    setShowPreview(true);
  };

  const handleConfirmAssignment = async () => {
    if (selectedMembers.size === 0 || roleChanges.length === 0) return;

    setIsLoading(true);
    try {
      await onAssign(Array.from(selectedMembers), roleChanges);
      handleClose();
    } finally {
      setIsLoading(false);
      setShowPreview(false);
    }
  };

  const roleOptions = [
    { value: 'all', label: 'All Members' },
    { value: 'none', label: 'No Roles' },
    ...roles.map(role => ({ value: role.id, label: role.name }))
  ];

  return (
    <>
      <Modal
        isOpen={isOpen && !showPreview}
        onClose={handleClose}
        title="Bulk Role Assignment"
        size="large"
      >
        <div className={styles.container}>
          {/* Member Selection */}
          <div className={styles.section}>
            <h3>Select Members</h3>
            
            <div className={styles.filters}>
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<SearchIcon />}
                fullWidth
              />
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                options={roleOptions}
                placeholder="Filter by role"
              />
            </div>

            <div className={styles.memberSelection}>
              <div className={styles.selectionHeader}>
                <Checkbox
                  label={`Select all (${filteredMembers.length} members)`}
                  checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                  indeterminate={selectedMembers.size > 0 && selectedMembers.size < filteredMembers.length}
                  onChange={handleSelectAll}
                />
                <span className={styles.selectedCount}>
                  {selectedMembers.size} selected
                </span>
              </div>

              <div className={styles.memberList}>
                {filteredMembers.slice(0, 50).map((member) => (
                  <div
                    key={member.id}
                    className={`${styles.memberItem} ${selectedMembers.has(member.id) ? styles.selected : ''}`}
                    onClick={() => handleSelectMember(member.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onChange={() => handleSelectMember(member.id)}
                    />
                    <Avatar
                      src={member.avatarUrl}
                      name={member.displayName}
                      size="small"
                    />
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>
                        {member.nickname || member.displayName}
                      </span>
                      <div className={styles.memberRoles}>
                        {member.roles.length === 0 ? (
                          <span className={styles.noRoles}>No roles</span>
                        ) : (
                          member.roles.slice(0, 2).map((roleId) => {
                            const role = roles.find(r => r.id === roleId);
                            return role ? (
                              <span
                                key={roleId}
                                className={styles.roleTag}
                                style={{ backgroundColor: role.color }}
                              >
                                {role.name}
                              </span>
                            ) : null;
                          })
                        )}
                        {member.roles.length > 2 && (
                          <span className={styles.moreRoles}>
                            +{member.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredMembers.length > 50 && (
                  <div className={styles.moreMembers}>
                    and {filteredMembers.length - 50} more members...
                  </div>
                )}

                {filteredMembers.length === 0 && (
                  <div className={styles.noMembers}>
                    <p>No members found matching your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Role Changes */}
          <div className={styles.section}>
            <h3>Role Changes</h3>
            <p className={styles.sectionDescription}>
              Add or remove roles for the selected members.
            </p>

            <RoleChangeBuilder
              roles={roles}
              onAddChange={addRoleChange}
            />

            {roleChanges.length > 0 && (
              <div className={styles.roleChangesList}>
                <h4>Planned Changes:</h4>
                {roleChanges.map((change, index) => {
                  const role = roles.find(r => r.id === change.roleId);
                  return (
                    <div key={index} className={styles.roleChangeItem}>
                      <span className={`${styles.changeAction} ${styles[change.action]}`}>
                        {change.action === 'add' ? '+ Add' : '- Remove'}
                      </span>
                      <span
                        className={styles.changeRole}
                        style={{ color: role?.color }}
                      >
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
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <div className={styles.summary}>
              {selectedMembers.size > 0 && roleChanges.length > 0 && (
                <p>
                  Apply <strong>{roleChanges.length} role change{roleChanges.length === 1 ? '' : 's'}</strong> to{' '}
                  <strong>{selectedMembers.size} member{selectedMembers.size === 1 ? '' : 's'}</strong>
                </p>
              )}
            </div>
            <div className={styles.actionButtons}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePreview}
                disabled={selectedMembers.size === 0 || roleChanges.length === 0}
              >
                Preview Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Permission Preview Modal */}
      <PermissionPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmAssignment}
        members={selectedMemberObjects}
        roles={roles}
        roleChanges={roleChanges}
        isLoading={isLoading}
      />
    </>
  );
}

// Role Change Builder Component
interface RoleChangeBuilderProps {
  roles: Role[];
  onAddChange: (roleId: string, action: 'add' | 'remove') => void;
}

function RoleChangeBuilder({ roles, onAddChange }: RoleChangeBuilderProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [action, setAction] = useState<'add' | 'remove'>('add');

  const handleAdd = () => {
    if (selectedRole) {
      onAddChange(selectedRole, action);
      setSelectedRole('');
    }
  };

  return (
    <div className={styles.roleChangeBuilder}>
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
        onClick={handleAdd}
        disabled={!selectedRole}
      >
        Add Change
      </Button>
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

export default BulkRoleAssignmentModal;
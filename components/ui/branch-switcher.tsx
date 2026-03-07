/**
 * @spec clawd-kus.12: Branch Switching Component
 * Main branch switcher component with dropdown, branch list, and delete functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';
import { Button } from './button';
import { UnsavedChangesWarningDialog } from './unsaved-changes-warning';
import { BranchCreateModal } from './branch-create-modal';
import { BranchMergeDialog } from './branch-merge-dialog';
import { useBranchState } from '../../lib/hooks/useBranchState';
import { cn } from '../../lib/utils';
import type { BranchType } from '../../types/branch';
import type { MergeConflict } from './merge-types';

interface BranchSwitcherProps {
  projectId: string;
  className?: string;
  onBranchChange?: (branchId: string) => void;
}

/**
 * Branch switcher component with dropdown menu
 * Handles branch switching, unsaved changes warnings, and branch deletion
 */
export const BranchSwitcher: React.FC<BranchSwitcherProps> = ({
  projectId,
  className,
  onBranchChange
}) => {
  const {
    branchState,
    currentBranch,
    showUnsavedChangesWarning,
    unsavedChangesWarning,
    switchToBranch,
    createBranch,
    deleteBranch,
    refreshBranches,
    dismissWarning
  } = useBranchState({ projectId });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mergeDialog, setMergeDialog] = useState<{
    isOpen: boolean;
    sourceBranch: BranchType | null;
    conflicts: MergeConflict[];
    isLoading: boolean;
  }>({ isOpen: false, sourceBranch: null, conflicts: [], isLoading: false });

  // Keyboard shortcut: Cmd+B (Mac) or Ctrl+B (Windows/Linux)
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
        event.preventDefault();
        setDropdownOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  // Notify parent of branch changes
  useEffect(() => {
    if (currentBranch) {
      onBranchChange?.(currentBranch.id);
    }
  }, [currentBranch, onBranchChange]);

  const handleBranchSelect = async (branchId: string) => {
    if (branchId === currentBranch?.id) return;
    await switchToBranch(branchId);
  };

  const handleDeleteBranch = async (branchId: string) => {
    const targetBranch = branchState.availableBranches.find(b => b.id === branchId);
    
    if (!targetBranch) return;
    
    if (targetBranch.isMain) {
      // Show error - cannot delete main branch
      return;
    }

    setShowDeleteConfirmation(branchId);
  };

  const confirmDeleteBranch = async (branchId: string) => {
    await deleteBranch(branchId);
    setShowDeleteConfirmation(null);
  };

  const handleCreateBranch = async (data: {
    name: string;
    description?: string;
    sourceVersionId?: string;
    sourceBranchId?: string;
  }) => {
    try {
      const newBranch = await createBranch(data);
      setShowCreateModal(false);
      setDropdownOpen(false);
      
      // Switch to the newly created branch
      await switchToBranch(newBranch.id);
    } catch (error) {
      // Error handling is managed by the modal component
      throw error;
    }
  };

  const handleMergeBranch = (sourceBranch: BranchType) => {
    setDropdownOpen(false);
    // Simulate conflict detection (in real app, this would call an API)
    const mockConflicts: MergeConflict[] = [];
    setMergeDialog({
      isOpen: true,
      sourceBranch,
      conflicts: mockConflicts,
      isLoading: false
    });
  };

  const handleConfirmMerge = async (resolvedConflicts?: MergeConflict[]) => {
    if (!mergeDialog.sourceBranch || !currentBranch) return;
    setMergeDialog(prev => ({ ...prev, isLoading: true }));
    try {
      // In real app, this would call merge API
      await new Promise(resolve => setTimeout(resolve, 800));
      setMergeDialog({ isOpen: false, sourceBranch: null, conflicts: [], isLoading: false });
    } catch {
      setMergeDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAbortMerge = () => {
    setMergeDialog({ isOpen: false, sourceBranch: null, conflicts: [], isLoading: false });
  };

  const formatLastModified = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
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

  const getBranchIcon = (branch: BranchType): string => {
    if (branch.isMain) return '🏠'; // Home icon for main
    return '🌿'; // Branch icon for feature branches
  };

  if (branchState.isLoading && !currentBranch) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-md" data-testid="branch-switcher-loading" />
      </div>
    );
  }

  if (branchState.error) {
    return (
      <div className={cn('inline-flex items-center text-red-600', className)} data-testid="branch-switcher-error">
        <span className="text-sm">Error: {branchState.error}</span>
      </div>
    );
  }

  return (
    <>
      <div className={cn('inline-flex items-center', className)} data-testid="branch-switcher">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                'justify-between min-w-[200px] font-normal',
                branchState.hasUnsavedChanges && 'border-orange-300 bg-orange-50'
              )}
              disabled={branchState.isLoading}
              data-testid="branch-switcher-trigger"
              aria-label={`Current branch: ${currentBranch?.name || 'Loading...'}, ${branchState.availableBranches.length} branches available`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{currentBranch ? getBranchIcon(currentBranch) : '⏳'}</span>
                <span className="truncate">
                  {currentBranch?.name || 'Loading...'}
                </span>
                {branchState.hasUnsavedChanges && (
                  <span className="text-xs text-orange-600" data-testid="unsaved-indicator">●</span>
                )}
              </span>
              <svg 
                className="h-4 w-4 opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                data-testid="dropdown-chevron"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-80" data-testid="branch-dropdown-menu">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Switch Branch ({branchState.availableBranches.length})
              </p>
              
              {branchState.availableBranches.map((branch) => (
                <div key={branch.id} className="group">
                  <DropdownMenuItem
                    onClick={() => handleBranchSelect(branch.id)}
                    className={cn(
                      'flex items-center justify-between p-3 cursor-pointer',
                      currentBranch?.id === branch.id && 'bg-blue-50 border-blue-200'
                    )}
                    data-testid={`branch-item-${branch.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-base flex-shrink-0">{getBranchIcon(branch)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-medium truncate',
                            currentBranch?.id === branch.id && 'text-blue-700'
                          )}>
                            {branch.name}
                          </span>
                          {branch.isMain && (
                            <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex-shrink-0">
                              main
                            </span>
                          )}
                          {currentBranch?.id === branch.id && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                              current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{branch.versionCount} version{branch.versionCount !== 1 ? 's' : ''}</span>
                          <span>Updated {formatLastModified(branch.lastModifiedAt)}</span>
                        </div>
                        {branch.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {branch.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!branch.isMain && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ml-2">
                        {/* Merge button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMergeBranch(branch);
                          }}
                          className="p-1 hover:bg-violet-100 rounded text-violet-600 flex-shrink-0"
                          data-testid={`merge-branch-${branch.id}`}
                          aria-label={`Merge branch ${branch.name} into current branch`}
                          title={`Merge ${branch.name} into current branch`}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBranch(branch.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0"
                        data-testid={`delete-branch-${branch.id}`}
                        aria-label={`Delete branch ${branch.name}`}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      </div>
                    )}
                  </DropdownMenuItem>
                </div>
              ))}

              <DropdownMenuSeparator className="my-2" />
              
              <DropdownMenuItem 
                onClick={() => setShowCreateModal(true)}
                className="text-blue-600 justify-center font-medium"
                data-testid="create-branch"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Branch
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={refreshBranches}
                className="text-gray-600 justify-center"
                data-testid="refresh-branches"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Branches
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {branchState.hasUnsavedChanges && (
          <div className="ml-2 text-xs text-orange-600" data-testid="unsaved-changes-indicator">
            Unsaved changes
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning Dialog */}
      <UnsavedChangesWarningDialog
        open={showUnsavedChangesWarning}
        warning={unsavedChangesWarning}
        onClose={dismissWarning}
      />

      {/* Delete Branch Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" data-testid="delete-confirmation-dialog">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Branch</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the branch "{branchState.availableBranches.find(b => b.id === showDeleteConfirmation)?.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirmation(null)}
                data-testid="cancel-delete"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDeleteBranch(showDeleteConfirmation)}
                className="bg-red-600 text-white hover:bg-red-700"
                data-testid="confirm-delete"
              >
                Delete Branch
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Branch Modal */}
      <BranchCreateModal
        isOpen={showCreateModal}
        projectId={projectId}
        sourceBranchId={currentBranch?.id}
        existingBranches={branchState.availableBranches.map(b => b.name)}
        onClose={() => setShowCreateModal(false)}
        onCreateBranch={handleCreateBranch}
      />

      {/* Branch Merge Dialog */}
      {mergeDialog.isOpen && mergeDialog.sourceBranch && currentBranch && (
        <BranchMergeDialog
          isOpen={mergeDialog.isOpen}
          sourceBranch={mergeDialog.sourceBranch}
          targetBranch={currentBranch}
          conflicts={mergeDialog.conflicts}
          onMerge={handleConfirmMerge}
          onAbort={handleAbortMerge}
          onClose={handleAbortMerge}
          isLoading={mergeDialog.isLoading}
        />
      )}
    </>
  );
};
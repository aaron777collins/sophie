/**
 * @spec VH-013: Branch Merging - BranchMergeDialog Component
 *
 * Merge dialog showing source/target branches, conflict list,
 * and merge/abort actions.
 */

'use client';

import React, { useState } from 'react';
import type { BranchType } from '../../types/branch';
import type { MergeConflict } from './merge-types';
import { ConflictResolutionView } from './conflict-resolution-view';
import { cn } from '../../lib/utils';

interface BranchMergeDialogProps {
  isOpen: boolean;
  sourceBranch: BranchType;
  targetBranch: BranchType;
  conflicts: MergeConflict[];
  onMerge: (resolvedConflicts?: MergeConflict[]) => Promise<void>;
  onAbort: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const BranchMergeDialog: React.FC<BranchMergeDialogProps> = ({
  isOpen,
  sourceBranch,
  targetBranch,
  conflicts,
  onMerge,
  onAbort,
  onClose,
  isLoading = false
}) => {
  const [localConflicts, setLocalConflicts] = useState<MergeConflict[]>(conflicts);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  // Keep local conflicts in sync with prop changes
  React.useEffect(() => {
    setLocalConflicts(conflicts);
  }, [conflicts]);

  const unresolvedCount = localConflicts.filter(c => !c.resolution).length;
  const hasConflicts = localConflicts.length > 0;
  const canMerge = !isLoading && unresolvedCount === 0;

  const handleResolveConflict = (
    conflictId: string,
    resolution: 'ours' | 'theirs' | 'manual',
    resolvedContent: string
  ) => {
    setLocalConflicts(prev =>
      prev.map(c =>
        c.id === conflictId ? { ...c, resolution, resolvedContent } : c
      )
    );
  };

  const handleMerge = async () => {
    await onMerge(localConflicts);
  };

  const handleAbortClick = () => {
    if (hasConflicts) {
      setShowAbortConfirm(true);
    } else {
      onAbort();
    }
  };

  const handleConfirmAbort = () => {
    setShowAbortConfirm(false);
    onAbort();
  };

  const handleCancelAbort = () => {
    setShowAbortConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      data-testid="branch-merge-dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            {/* Git merge icon */}
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Merge Branch</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"
            data-testid="close-merge-dialog"
            aria-label="Close merge dialog"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Merge direction preview */}
          <div
            className="px-6 py-5 border-b border-slate-100"
            data-testid="merge-preview"
          >
            <div
              className="flex items-center justify-center gap-4"
              data-testid="merge-direction"
            >
              {/* Source branch */}
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <div
                    className="text-sm font-semibold text-emerald-900"
                    data-testid="merge-source-branch"
                  >
                    {sourceBranch.name}
                  </div>
                  <div className="text-xs text-emerald-600">{sourceBranch.versionCount} versions</div>
                </div>
              </div>

              {/* Arrow */}
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              {/* Target branch */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <div
                    className="text-sm font-semibold text-blue-900"
                    data-testid="merge-target-branch"
                  >
                    {targetBranch.name}
                  </div>
                  <div className="text-xs text-blue-600">{targetBranch.versionCount} versions</div>
                </div>
              </div>
            </div>

            <p
              className="mt-3 text-sm text-slate-500 text-center"
              data-testid="merge-result-description"
            >
              Changes from <strong>{sourceBranch.name}</strong> will be merged into <strong>{targetBranch.name}</strong>
            </p>
          </div>

          {/* Conflict status */}
          <div className="px-6 py-4">
            {hasConflicts ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium text-slate-700">
                      Conflicts detected:&nbsp;
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-100 text-amber-700 rounded-full"
                        data-testid="conflict-count"
                      >
                        {localConflicts.length}
                      </span>
                    </span>
                    {unresolvedCount > 0 && (
                      <span className="text-xs text-amber-600">({unresolvedCount} unresolved)</span>
                    )}
                  </div>
                  {unresolvedCount === 0 && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All resolved
                    </span>
                  )}
                </div>

                <div className="space-y-4" data-testid="conflict-list">
                  {localConflicts.map((conflict, index) => (
                    <div
                      key={conflict.id}
                      className={cn(
                        'rounded-lg border-2 overflow-hidden conflict-highlight',
                        conflict.resolution
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-amber-200 bg-amber-50/30'
                      )}
                      data-testid={`conflict-item-${conflict.id}`}
                    >
                      <ConflictResolutionView
                        conflict={conflict}
                        conflictIndex={index}
                        totalConflicts={localConflicts.length}
                        onResolve={handleResolveConflict}
                      />
                      {/* Side-by-side previews in conflict list */}
                      <div className="grid grid-cols-2 border-t border-slate-200">
                        <div
                          className="p-3 border-r border-slate-200 bg-slate-50"
                          data-testid={`conflict-ours-${conflict.id}`}
                        >
                          <div className="text-xs font-medium text-slate-500 mb-1">Current (ours)</div>
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-3">
                            {conflict.ourContent}
                          </pre>
                        </div>
                        <div
                          className="p-3 bg-slate-50"
                          data-testid={`conflict-theirs-${conflict.id}`}
                        >
                          <div className="text-xs font-medium text-slate-500 mb-1">Incoming (theirs)</div>
                          <pre className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-3">
                            {conflict.theirContent}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                data-testid="no-conflicts-message"
              >
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-emerald-800">No conflicts found</p>
                  <p className="text-xs text-emerald-600 mt-0.5">This merge can be completed automatically</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          {/* Loading indicator */}
          {isLoading && (
            <div
              className="flex items-center gap-2 mb-3 text-sm text-slate-600"
              data-testid="merge-loading-indicator"
            >
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Merging branches...
            </div>
          )}

          {/* Abort confirmation overlay */}
          {showAbortConfirm && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              data-testid="abort-confirmation"
            >
              <p className="text-sm text-red-700 font-medium mb-2">
                Abort merge? Your conflict resolutions will be lost.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmAbort}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  data-testid="confirm-abort-button"
                >
                  Abort Merge
                </button>
                <button
                  onClick={handleCancelAbort}
                  className="px-3 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                  data-testid="cancel-abort-button"
                >
                  Continue Resolving
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={handleAbortClick}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="abort-merge-button"
            >
              Abort Merge
            </button>

            <div className="flex items-center gap-3">
              {hasConflicts && unresolvedCount > 0 && (
                <span className="text-xs text-amber-600">
                  Resolve {unresolvedCount} conflict{unresolvedCount > 1 ? 's' : ''} to merge
                </span>
              )}
              <button
                onClick={handleMerge}
                disabled={!canMerge}
                className={cn(
                  'px-5 py-2 text-sm font-medium rounded-lg transition-colors',
                  canMerge
                    ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
                data-testid="confirm-merge-button"
              >
                {isLoading ? 'Merging...' : `Merge into ${targetBranch.name}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchMergeDialog;

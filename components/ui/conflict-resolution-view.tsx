/**
 * @spec VH-013: Branch Merging - ConflictResolutionView Component
 *
 * Side-by-side conflict resolution with choose mine/theirs/manual edit.
 */

'use client';

import React, { useState } from 'react';
import type { MergeConflict } from './merge-types';
import { cn } from '../../lib/utils';

interface ConflictResolutionViewProps {
  conflict: MergeConflict;
  conflictIndex: number;
  totalConflicts: number;
  onResolve: (
    conflictId: string,
    resolution: 'ours' | 'theirs' | 'manual',
    resolvedContent: string
  ) => void;
}

export const ConflictResolutionView: React.FC<ConflictResolutionViewProps> = ({
  conflict,
  conflictIndex,
  totalConflicts,
  onResolve
}) => {
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [manualContent, setManualContent] = useState(conflict.ourContent);

  const isResolved = !!conflict.resolution;
  const isOursSelected = conflict.resolution === 'ours';
  const isTheirsSelected = conflict.resolution === 'theirs';

  const handleChooseOurs = () => {
    onResolve(conflict.id, 'ours', conflict.ourContent);
  };

  const handleChooseTheirs = () => {
    onResolve(conflict.id, 'theirs', conflict.theirContent);
  };

  const handleOpenManualEditor = () => {
    setManualContent(conflict.resolvedContent || conflict.ourContent);
    setShowManualEditor(true);
  };

  const handleSaveManualEdit = () => {
    onResolve(conflict.id, 'manual', manualContent);
    setShowManualEditor(false);
  };

  const handleCancelManualEdit = () => {
    setShowManualEditor(false);
  };

  return (
    <div
      className="p-3"
      data-testid="conflict-resolution-view"
    >
      {/* Conflict header */}
      <div
        className="flex items-center justify-between mb-3"
        data-testid="conflict-header"
      >
        <div className="flex items-center gap-2">
          {isResolved ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="text-xs font-medium text-slate-600">
            Conflict {conflictIndex + 1} of {totalConflicts}
          </span>
          <span
            className="text-xs text-slate-400"
            data-testid="conflict-line-range"
          >
            (line {conflict.lineStart}–{conflict.lineEnd})
          </span>
        </div>

        {isResolved && (
          <span
            className="text-xs font-medium text-emerald-600 flex items-center gap-1"
            data-testid="conflict-resolved-indicator"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Resolved ({conflict.resolution})
          </span>
        )}
      </div>

      {/* Manual editor (when open) */}
      {showManualEditor ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">Edit resolution manually:</label>
          <textarea
            value={manualContent}
            onChange={(e) => setManualContent(e.target.value)}
            className="w-full h-32 px-3 py-2 text-sm font-mono text-slate-800 bg-white border border-slate-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            data-testid="manual-editor"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveManualEdit}
              className="px-3 py-1.5 text-xs font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              data-testid="save-manual-edit-button"
            >
              Apply
            </button>
            <button
              onClick={handleCancelManualEdit}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
              data-testid="cancel-manual-edit-button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Side-by-side panels */
        <div className="grid grid-cols-2 gap-2">
          {/* Our version panel */}
          <div
            className={cn(
              'rounded-lg border-2 overflow-hidden transition-colors',
              isOursSelected
                ? 'border-violet-400 bg-violet-50 selected'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            )}
            role="region"
            aria-label="Our version (current branch)"
            data-testid="our-version-panel"
          >
            <div className={cn(
              'px-3 py-1.5 border-b text-xs font-medium',
              isOursSelected
                ? 'bg-violet-100 border-violet-300 text-violet-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            )}>
              Current branch (ours)
            </div>
            <pre className="p-3 text-xs text-slate-700 whitespace-pre-wrap overflow-auto max-h-28 leading-relaxed">
              {conflict.ourContent}
            </pre>
            <div className="px-3 pb-2">
              <button
                onClick={handleChooseOurs}
                className={cn(
                  'w-full py-1.5 text-xs font-medium rounded-md transition-colors',
                  isOursSelected
                    ? 'bg-violet-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700'
                )}
                aria-label="Choose our version to resolve this conflict"
                data-testid="choose-ours-button"
              >
                {isOursSelected ? '✓ Chosen' : 'Choose Mine'}
              </button>
            </div>
          </div>

          {/* Their version panel */}
          <div
            className={cn(
              'rounded-lg border-2 overflow-hidden transition-colors',
              isTheirsSelected
                ? 'border-emerald-400 bg-emerald-50 selected'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            )}
            role="region"
            aria-label="Incoming version (their branch)"
            data-testid="their-version-panel"
          >
            <div className={cn(
              'px-3 py-1.5 border-b text-xs font-medium',
              isTheirsSelected
                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            )}>
              Incoming branch (theirs)
            </div>
            <pre className="p-3 text-xs text-slate-700 whitespace-pre-wrap overflow-auto max-h-28 leading-relaxed">
              {conflict.theirContent}
            </pre>
            <div className="px-3 pb-2">
              <button
                onClick={handleChooseTheirs}
                className={cn(
                  'w-full py-1.5 text-xs font-medium rounded-md transition-colors',
                  isTheirsSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                )}
                aria-label="Choose their version to resolve this conflict"
                data-testid="choose-theirs-button"
              >
                {isTheirsSelected ? '✓ Chosen' : 'Choose Theirs'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual edit button (only when not in editor mode) */}
      {!showManualEditor && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleOpenManualEditor}
            className="text-xs text-slate-500 hover:text-violet-600 flex items-center gap-1 transition-colors"
            data-testid="edit-manually-button"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit manually
          </button>
        </div>
      )}
    </div>
  );
};

export default ConflictResolutionView;

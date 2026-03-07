'use client';

import React, { useState } from 'react';
import { BranchMergeDialog } from '../../../components/ui/branch-merge-dialog';
import { ConflictResolutionView } from '../../../components/ui/conflict-resolution-view';
import type { MergeConflict } from '../../../components/ui/merge-types';

const mockSourceBranch = {
  id: 'feature-1',
  projectId: 'test-project',
  name: 'feature-branch',
  description: 'Feature development branch',
  isMain: false,
  status: 'active' as const,
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-07T10:00:00Z',
  lastModifiedAt: '2026-03-07T10:00:00Z',
  versionCount: 8
};

const mockTargetBranch = {
  id: 'main',
  projectId: 'test-project',
  name: 'main',
  description: 'Main branch',
  isMain: true,
  status: 'active' as const,
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-07T12:00:00Z',
  lastModifiedAt: '2026-03-07T12:00:00Z',
  versionCount: 12
};

const mockConflicts: MergeConflict[] = [
  {
    id: 'conflict-1',
    sectionId: 'section-title',
    lineStart: 1,
    lineEnd: 3,
    ourContent: 'In the beginning God created the heavens and the earth.\nThe earth was formless and empty.',
    theirContent: 'In the beginning, God created the heavens and the earth.\nNow the earth was formless and void.',
    baseContent: 'In the beginning God created',
    resolution: undefined,
    resolvedContent: undefined
  },
  {
    id: 'conflict-2',
    sectionId: 'section-verse',
    lineStart: 10,
    lineEnd: 12,
    ourContent: 'And God said, "Let there be light," and there was light.',
    theirContent: 'God said: "Let there be light" — and light appeared.',
    baseContent: 'God said let there be light',
    resolution: undefined,
    resolvedContent: undefined
  }
];

export default function BranchMergingTestPage() {
  const [dialogScenario, setDialogScenario] = useState<'clean' | 'conflicts' | 'resolved' | null>(null);
  const [conflictState, setConflictState] = useState<MergeConflict[]>(mockConflicts);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const log = (msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setActionLog(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const handleResolveConflict = (conflictId: string, resolution: 'ours' | 'theirs' | 'manual', resolvedContent: string) => {
    setConflictState(prev => prev.map(c =>
      c.id === conflictId ? { ...c, resolution, resolvedContent } : c
    ));
    log(`Conflict ${conflictId} resolved with: ${resolution}`);
  };

  const handleMerge = async () => {
    log('Merge completed successfully!');
    await new Promise(r => setTimeout(r, 500));
    setDialogScenario(null);
  };

  const handleAbort = () => {
    log('Merge aborted');
    setDialogScenario(null);
  };

  const getConflictsForScenario = () => {
    if (dialogScenario === 'clean') return [];
    if (dialogScenario === 'resolved') {
      return conflictState.map(c => ({
        ...c,
        resolution: 'ours' as const,
        resolvedContent: c.ourContent
      }));
    }
    return conflictState;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">VH-013: Branch Merging Test Page</h1>
          <p className="text-slate-500 text-sm">Test all merge UI scenarios — click buttons to open dialogs</p>
        </div>

        {/* AC1: Clean Merge */}
        <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            AC1: Clean Merge UI
          </h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setDialogScenario('clean')}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
              data-testid="open-clean-merge"
            >
              Open Clean Merge Dialog
            </button>
            <button
              onClick={() => setDialogScenario('conflicts')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              data-testid="open-conflict-merge"
            >
              Open Merge with Conflicts
            </button>
            <button
              onClick={() => setDialogScenario('resolved')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              data-testid="open-resolved-merge"
            >
              Open Merge (All Resolved)
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Merge dialog: source + target branches, preview, merge/abort buttons
          </p>
        </section>

        {/* AC3: Conflict Resolution View (standalone) */}
        <section className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            AC3: Conflict Resolution View — Side-by-Side
          </h2>
          <div className="space-y-4" data-testid="standalone-conflict-view">
            {mockConflicts.map((conflict, idx) => (
              <div
                key={conflict.id}
                className="rounded-lg border-2 border-amber-200 bg-amber-50/30 overflow-hidden conflict-highlight"
                data-testid={`standalone-conflict-${conflict.id}`}
              >
                <ConflictResolutionView
                  conflict={conflictState.find(c => c.id === conflict.id) || conflict}
                  conflictIndex={idx}
                  totalConflicts={mockConflicts.length}
                  onResolve={handleResolveConflict}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Action Log */}
        <section className="p-4 bg-slate-800 rounded-xl">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Action Log</h3>
          {actionLog.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No actions yet — interact with the components above</p>
          ) : (
            actionLog.map((entry, i) => (
              <div key={i} className="text-xs text-emerald-400 font-mono">{entry}</div>
            ))
          )}
        </section>
      </div>

      {/* Merge Dialog (AC1, AC2, AC3, AC4) */}
      {dialogScenario && (
        <BranchMergeDialog
          isOpen={true}
          sourceBranch={mockSourceBranch}
          targetBranch={mockTargetBranch}
          conflicts={getConflictsForScenario()}
          onMerge={handleMerge}
          onAbort={handleAbort}
          onClose={handleAbort}
          isLoading={false}
        />
      )}
    </div>
  );
}

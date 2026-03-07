/**
 * @spec VH-013: Branch Merging - Frontend UI
 * Unit tests for BranchMergeDialog component
 *
 * RED GATE: All tests written before implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BranchMergeDialog } from '@/components/ui/branch-merge-dialog';

// Mock branch data
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
  versionCount: 5
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

const mockConflicts = [
  {
    id: 'conflict-1',
    sectionId: 'section-title',
    lineStart: 1,
    lineEnd: 3,
    ourContent: 'Main branch title content\nSecond line main\nThird line main',
    theirContent: 'Feature branch title\nSecond line feature\nThird line feature',
    baseContent: 'Original title content',
    resolution: undefined,
    resolvedContent: undefined
  },
  {
    id: 'conflict-2',
    sectionId: 'section-intro',
    lineStart: 10,
    lineEnd: 12,
    ourContent: 'Introduction from main branch',
    theirContent: 'Introduction from feature branch with more details',
    baseContent: 'Original introduction',
    resolution: undefined,
    resolvedContent: undefined
  }
];

describe('BranchMergeDialog', () => {
  const mockOnMerge = jest.fn().mockResolvedValue(undefined);
  const mockOnAbort = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    sourceBranch: mockSourceBranch,
    targetBranch: mockTargetBranch,
    conflicts: [],
    onMerge: mockOnMerge,
    onAbort: mockOnAbort,
    onClose: mockOnClose,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC1: Clean Merge UI', () => {
    it('renders the merge dialog when open', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      expect(screen.getByTestId('branch-merge-dialog')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<BranchMergeDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('branch-merge-dialog')).not.toBeInTheDocument();
    });

    it('shows source and target branch names', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      expect(screen.getByTestId('merge-source-branch')).toHaveTextContent('feature-branch');
      expect(screen.getByTestId('merge-target-branch')).toHaveTextContent('main');
    });

    it('shows merge preview section', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      expect(screen.getByTestId('merge-preview')).toBeInTheDocument();
    });

    it('shows merge button for clean merge (no conflicts)', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={[]} />);

      expect(screen.getByTestId('confirm-merge-button')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-merge-button')).not.toBeDisabled();
    });

    it('calls onMerge when merge button is clicked', async () => {
      const user = userEvent.setup();
      render(<BranchMergeDialog {...defaultProps} conflicts={[]} />);

      const mergeButton = screen.getByTestId('confirm-merge-button');
      await act(async () => {
        await user.click(mergeButton);
      });

      expect(mockOnMerge).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during merge', () => {
      render(<BranchMergeDialog {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('merge-loading-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-merge-button')).toBeDisabled();
    });

    it('shows version counts in preview', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      // Should show version counts for context
      expect(screen.getByTestId('merge-preview')).toHaveTextContent('5');
      expect(screen.getByTestId('merge-preview')).toHaveTextContent('12');
    });
  });

  describe('AC2: Conflict Detection', () => {
    it('shows conflict count when conflicts exist', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      expect(screen.getByTestId('conflict-count')).toBeInTheDocument();
      expect(screen.getByTestId('conflict-count')).toHaveTextContent('2');
    });

    it('disables merge button when unresolved conflicts exist', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      expect(screen.getByTestId('confirm-merge-button')).toBeDisabled();
    });

    it('shows conflict sections in the dialog', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      expect(screen.getByTestId('conflict-list')).toBeInTheDocument();
      expect(screen.getAllByTestId(/^conflict-item-/)).toHaveLength(2);
    });

    it('highlights conflicting sections', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      const conflictItems = screen.getAllByTestId(/^conflict-item-/);
      conflictItems.forEach(item => {
        expect(item).toHaveClass('conflict-highlight');
      });
    });

    it('shows both ours and theirs versions for each conflict', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      expect(screen.getAllByTestId(/^conflict-ours-/)).toHaveLength(2);
      expect(screen.getAllByTestId(/^conflict-theirs-/)).toHaveLength(2);
    });

    it('shows "no conflicts" message for clean merge', () => {
      render(<BranchMergeDialog {...defaultProps} conflicts={[]} />);

      expect(screen.getByTestId('no-conflicts-message')).toBeInTheDocument();
      expect(screen.getByTestId('no-conflicts-message')).toHaveTextContent(/no conflicts/i);
    });
  });

  describe('AC4: Abort Merge', () => {
    it('shows abort button', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      expect(screen.getByTestId('abort-merge-button')).toBeInTheDocument();
    });

    it('calls onAbort when abort button is clicked', async () => {
      const user = userEvent.setup();
      render(<BranchMergeDialog {...defaultProps} />);

      const abortButton = screen.getByTestId('abort-merge-button');
      await act(async () => {
        await user.click(abortButton);
      });

      expect(mockOnAbort).toHaveBeenCalledTimes(1);
    });

    it('shows abort confirmation when in conflict state', async () => {
      const user = userEvent.setup();
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      const abortButton = screen.getByTestId('abort-merge-button');
      await act(async () => {
        await user.click(abortButton);
      });

      // Should confirm before aborting when there are conflicts
      expect(screen.getByTestId('abort-confirmation')).toBeInTheDocument();
    });

    it('cancels abort when user declines confirmation', async () => {
      const user = userEvent.setup();
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      const abortButton = screen.getByTestId('abort-merge-button');
      await act(async () => {
        await user.click(abortButton);
      });

      const cancelAbortButton = screen.getByTestId('cancel-abort-button');
      await act(async () => {
        await user.click(cancelAbortButton);
      });

      expect(mockOnAbort).not.toHaveBeenCalled();
      expect(screen.queryByTestId('abort-confirmation')).not.toBeInTheDocument();
    });

    it('proceeds with abort when user confirms', async () => {
      const user = userEvent.setup();
      render(<BranchMergeDialog {...defaultProps} conflicts={mockConflicts} />);

      const abortButton = screen.getByTestId('abort-merge-button');
      await act(async () => {
        await user.click(abortButton);
      });

      const confirmAbortButton = screen.getByTestId('confirm-abort-button');
      await act(async () => {
        await user.click(confirmAbortButton);
      });

      expect(mockOnAbort).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when dialog X button is clicked', async () => {
      const user = userEvent.setup();
      render(<BranchMergeDialog {...defaultProps} />);

      const closeButton = screen.getByTestId('close-merge-dialog');
      await act(async () => {
        await user.click(closeButton);
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC5: Merge History display', () => {
    it('shows merge direction indicator', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      expect(screen.getByTestId('merge-direction')).toBeInTheDocument();
    });

    it('displays what will happen after merge', () => {
      render(<BranchMergeDialog {...defaultProps} />);

      expect(screen.getByTestId('merge-result-description')).toBeInTheDocument();
      expect(screen.getByTestId('merge-result-description')).toHaveTextContent(/feature-branch.*main/i);
    });
  });
});

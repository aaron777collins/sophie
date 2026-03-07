/**
 * @spec VH-013: Branch Merging - Frontend UI
 * Unit tests for ConflictResolutionView component
 *
 * RED GATE: All tests written before implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ConflictResolutionView } from '@/components/ui/conflict-resolution-view';

const mockConflict = {
  id: 'conflict-1',
  sectionId: 'section-title',
  lineStart: 1,
  lineEnd: 3,
  ourContent: 'Main branch title content\nSecond line main',
  theirContent: 'Feature branch title\nSecond line feature with more info',
  baseContent: 'Original title',
  resolution: undefined as 'ours' | 'theirs' | 'manual' | undefined,
  resolvedContent: undefined as string | undefined
};

const mockConflictResolved = {
  ...mockConflict,
  resolution: 'ours' as const,
  resolvedContent: 'Main branch title content\nSecond line main'
};

describe('ConflictResolutionView', () => {
  const mockOnResolve = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC3: Side-by-side View', () => {
    it('renders the conflict resolution view', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('conflict-resolution-view')).toBeInTheDocument();
    });

    it('shows side-by-side columns for ours and theirs', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('our-version-panel')).toBeInTheDocument();
      expect(screen.getByTestId('their-version-panel')).toBeInTheDocument();
    });

    it('shows conflict number in header', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('conflict-header')).toHaveTextContent('1 of 2');
    });

    it('displays our content in ours panel', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      const ourPanel = screen.getByTestId('our-version-panel');
      expect(ourPanel).toHaveTextContent('Main branch title content');
    });

    it('displays their content in theirs panel', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      const theirPanel = screen.getByTestId('their-version-panel');
      expect(theirPanel).toHaveTextContent('Feature branch title');
    });

    it('shows line numbers for context', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('conflict-line-range')).toHaveTextContent('1');
    });
  });

  describe('AC3: Choose Mine/Theirs', () => {
    it('shows "Choose Mine" button in ours panel', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('choose-ours-button')).toBeInTheDocument();
      expect(screen.getByTestId('choose-ours-button')).toHaveTextContent(/choose mine/i);
    });

    it('shows "Choose Theirs" button in theirs panel', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('choose-theirs-button')).toBeInTheDocument();
      expect(screen.getByTestId('choose-theirs-button')).toHaveTextContent(/choose theirs/i);
    });

    it('calls onResolve with ours when "Choose Mine" is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      await act(async () => {
        await user.click(screen.getByTestId('choose-ours-button'));
      });

      expect(mockOnResolve).toHaveBeenCalledWith('conflict-1', 'ours', 'Main branch title content\nSecond line main');
    });

    it('calls onResolve with theirs when "Choose Theirs" is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      await act(async () => {
        await user.click(screen.getByTestId('choose-theirs-button'));
      });

      expect(mockOnResolve).toHaveBeenCalledWith('conflict-1', 'theirs', 'Feature branch title\nSecond line feature with more info');
    });

    it('shows visual indicator when "ours" is selected', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflictResolved}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('our-version-panel')).toHaveClass('selected');
    });

    it('shows resolved state when conflict has resolution', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflictResolved}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('conflict-resolved-indicator')).toBeInTheDocument();
    });
  });

  describe('AC3: Manual Edit', () => {
    it('shows manual edit button', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('edit-manually-button')).toBeInTheDocument();
    });

    it('opens manual editor when edit manually is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      await act(async () => {
        await user.click(screen.getByTestId('edit-manually-button'));
      });

      expect(screen.getByTestId('manual-editor')).toBeInTheDocument();
    });

    it('pre-fills manual editor with our content by default', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      await act(async () => {
        await user.click(screen.getByTestId('edit-manually-button'));
      });

      const editor = screen.getByTestId('manual-editor');
      expect(editor).toHaveValue('Main branch title content\nSecond line main');
    });

    it('calls onResolve with manual content when saved', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      await act(async () => {
        await user.click(screen.getByTestId('edit-manually-button'));
      });

      const editor = screen.getByTestId('manual-editor');
      await act(async () => {
        await user.clear(editor);
        await user.type(editor, 'Custom resolved content');
      });

      await act(async () => {
        await user.click(screen.getByTestId('save-manual-edit-button'));
      });

      expect(mockOnResolve).toHaveBeenCalledWith('conflict-1', 'manual', 'Custom resolved content');
    });

    it('cancels manual edit without saving', async () => {
      const user = userEvent.setup();
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      await act(async () => {
        await user.click(screen.getByTestId('edit-manually-button'));
      });

      await act(async () => {
        await user.click(screen.getByTestId('cancel-manual-edit-button'));
      });

      expect(screen.queryByTestId('manual-editor')).not.toBeInTheDocument();
      expect(mockOnResolve).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels for resolution buttons', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('choose-ours-button')).toHaveAttribute('aria-label');
      expect(screen.getByTestId('choose-theirs-button')).toHaveAttribute('aria-label');
    });

    it('marks panels with correct roles', () => {
      render(
        <ConflictResolutionView
          conflict={mockConflict}
          conflictIndex={0}
          totalConflicts={2}
          onResolve={mockOnResolve}
        />
      );

      expect(screen.getByTestId('our-version-panel')).toHaveAttribute('role', 'region');
      expect(screen.getByTestId('their-version-panel')).toHaveAttribute('role', 'region');
    });
  });
});

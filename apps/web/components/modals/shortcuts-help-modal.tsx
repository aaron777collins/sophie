'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Modal } from '../ui';
import type { KeyboardShortcut, ShortcutCategory } from '@/hooks/use-keyboard-shortcuts';
import { formatShortcutKeys, DEFAULT_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';
import styles from './shortcuts-help-modal.module.css';

export interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Custom shortcuts to display (uses defaults if not provided) */
  shortcuts?: Omit<KeyboardShortcut, 'handler'>[];
}

// Category display info
const CATEGORY_INFO: Record<ShortcutCategory, { label: string; icon: React.ReactNode }> = {
  navigation: { label: 'Navigation', icon: <NavigationIcon /> },
  modals: { label: 'Modals & Panels', icon: <ModalsIcon /> },
  messaging: { label: 'Messaging', icon: <MessagingIcon /> },
  media: { label: 'Voice & Video', icon: <MediaIcon /> },
  general: { label: 'General', icon: <GeneralIcon /> },
};

// Category order for display
const CATEGORY_ORDER: ShortcutCategory[] = [
  'general',
  'navigation',
  'modals',
  'messaging',
  'media',
];

export function ShortcutsHelpModal({
  isOpen,
  onClose,
  shortcuts = DEFAULT_SHORTCUTS,
}: ShortcutsHelpModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter shortcuts based on search
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery.trim()) return shortcuts;

    const query = searchQuery.toLowerCase();
    return shortcuts.filter(
      (shortcut) =>
        shortcut.name.toLowerCase().includes(query) ||
        shortcut.description.toLowerCase().includes(query) ||
        shortcut.key.toLowerCase().includes(query)
    );
  }, [shortcuts, searchQuery]);

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups = new Map<ShortcutCategory, typeof filteredShortcuts>();

    for (const category of CATEGORY_ORDER) {
      const categoryShortcuts = filteredShortcuts.filter((s) => s.category === category);
      if (categoryShortcuts.length > 0) {
        groups.set(category, categoryShortcuts);
      }
    }

    return groups;
  }, [filteredShortcuts]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Reset search when modal closes
  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Keyboard Shortcuts"
      size="medium"
    >
      <div className={styles.container}>
        <p className={styles.description}>
          Use these keyboard shortcuts to navigate and control the application faster.
        </p>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
        </div>

        {/* Shortcuts list */}
        {groupedShortcuts.size > 0 ? (
          Array.from(groupedShortcuts.entries()).map(([category, categoryShortcuts]) => (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>
                  {CATEGORY_INFO[category].icon}
                </span>
                <h3 className={styles.categoryTitle}>{CATEGORY_INFO[category].label}</h3>
              </div>
              <div className={styles.shortcutsList}>
                {categoryShortcuts.map((shortcut) => (
                  <ShortcutItem key={shortcut.id} shortcut={shortcut} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerHint}>
            Press any shortcut to perform the action
          </span>
          <div className={styles.footerKeys}>
            <span className={styles.footerKey}>
              <KeyBadge keys={['Esc']} /> to close
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Individual shortcut item
interface ShortcutItemProps {
  shortcut: Omit<KeyboardShortcut, 'handler'>;
}

function ShortcutItem({ shortcut }: ShortcutItemProps) {
  // Create a fake handler for formatting
  const fullShortcut = { ...shortcut, handler: () => {} } as KeyboardShortcut;
  const formattedKeys = formatShortcutKeys(fullShortcut);

  return (
    <div className={styles.shortcutItem}>
      <div className={styles.shortcutInfo}>
        <span className={styles.shortcutName}>{shortcut.name}</span>
        <span className={styles.shortcutDescription}>{shortcut.description}</span>
      </div>
      <div className={styles.shortcutKeys}>
        <KeyBadge keys={parseFormattedKeys(formattedKeys, shortcut)} />
      </div>
    </div>
  );
}

// Parse formatted keys into individual badges
function parseFormattedKeys(
  _formatted: string,
  shortcut: Omit<KeyboardShortcut, 'handler'>
): string[] {
  const keys: string[] = [];

  // Check for Mac (simplified check)
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  if (shortcut.ctrl) keys.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.alt) keys.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) keys.push(isMac ? '⇧' : 'Shift');

  // Format the main key
  const keyMap: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Escape: 'Esc',
    Enter: '↵',
    Backspace: '⌫',
    Delete: 'Del',
    Tab: '⇥',
    ' ': 'Space',
  };

  const displayKey = keyMap[shortcut.key] || shortcut.key.toUpperCase();
  keys.push(displayKey);

  return keys;
}

// Key badge component
interface KeyBadgeProps {
  keys: string[];
}

function KeyBadge({ keys }: KeyBadgeProps) {
  return (
    <>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className={styles.keySeparator}>+</span>}
          <span
            className={`${styles.keyBadge} ${
              ['Ctrl', 'Alt', 'Shift', '⌘', '⌥', '⇧'].includes(key) ? styles.modifier : ''
            }`}
          >
            {key}
          </span>
        </React.Fragment>
      ))}
    </>
  );
}

// Empty state when no shortcuts match search
interface EmptyStateProps {
  searchQuery: string;
}

function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIcon}>
        <SearchIcon size={32} />
      </span>
      <h4 className={styles.emptyTitle}>No shortcuts found</h4>
      <p className={styles.emptyDescription}>
        No shortcuts match &quot;{searchQuery}&quot;
      </p>
    </div>
  );
}

// Icons
function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function NavigationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ModalsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}

function MessagingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function GeneralIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default ShortcutsHelpModal;

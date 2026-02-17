'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Display name for the shortcut */
  name: string;
  /** Description of what the shortcut does */
  description: string;
  /** Key to press (e.g., 'k', 'Escape', 'ArrowUp') */
  key: string;
  /** Requires Ctrl/Cmd key */
  ctrl?: boolean;
  /** Requires Shift key */
  shift?: boolean;
  /** Requires Alt/Option key */
  alt?: boolean;
  /** Requires Meta/Command key (Mac) */
  meta?: boolean;
  /** Category for grouping in help modal */
  category: ShortcutCategory;
  /** Whether the shortcut is currently enabled */
  enabled?: boolean;
  /** Handler function */
  handler: () => void;
}

export type ShortcutCategory = 
  | 'navigation'
  | 'modals'
  | 'messaging'
  | 'media'
  | 'general';

export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are globally enabled */
  enabled?: boolean;
  /** Shortcuts to register */
  shortcuts?: KeyboardShortcut[];
  /** Callback when shortcut is triggered */
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;
}

export interface UseKeyboardShortcutsReturn {
  /** Register a new shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Unregister a shortcut by id */
  unregisterShortcut: (id: string) => void;
  /** Get all registered shortcuts */
  getShortcuts: () => KeyboardShortcut[];
  /** Get shortcuts by category */
  getShortcutsByCategory: (category: ShortcutCategory) => KeyboardShortcut[];
  /** Check if a shortcut is registered */
  isRegistered: (id: string) => boolean;
  /** Format shortcut for display (e.g., "Ctrl+K") */
  formatShortcut: (shortcut: KeyboardShortcut) => string;
  /** Enable/disable all shortcuts */
  setEnabled: (enabled: boolean) => void;
}

/**
 * Detect if running on Mac
 */
const isMac = typeof window !== 'undefined' && 
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/**
 * Format a shortcut for display
 */
export function formatShortcutKeys(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.meta && !shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Win');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  
  // Format special keys
  const keyDisplay = formatKeyName(shortcut.key);
  parts.push(keyDisplay);
  
  return parts.join(isMac ? '' : '+');
}

/**
 * Format a key name for display
 */
function formatKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    'Enter': '↵',
    'Backspace': '⌫',
    'Delete': 'Del',
    'Tab': '⇥',
    ' ': 'Space',
    '/': '/',
  };
  
  return keyMap[key] || key.toUpperCase();
}

/**
 * Check if event matches shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // On Mac, Ctrl+Key should match when Cmd is pressed
  const wantsCtrl = shortcut.ctrl === true;
  const wantsMeta = shortcut.meta === true;
  const wantsAlt = shortcut.alt === true;
  const wantsShift = shortcut.shift === true;
  
  const ctrlOrMeta = wantsCtrl 
    ? (isMac ? event.metaKey : event.ctrlKey)
    : false;
  
  const metaMatch: boolean = wantsMeta ? event.metaKey : (!event.metaKey || (wantsCtrl && isMac));
  const ctrlMatch: boolean = wantsCtrl ? ctrlOrMeta : (!event.ctrlKey || (isMac && event.metaKey));
  const altMatch: boolean = wantsAlt ? event.altKey : !event.altKey;
  const shiftMatch: boolean = wantsShift ? event.shiftKey : !event.shiftKey;
  
  // Key matching (case-insensitive for letters)
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
    event.code === `Key${shortcut.key.toUpperCase()}` ||
    event.key === shortcut.key;
  
  return keyMatches && ctrlMatch && altMatch && shiftMatch && (wantsMeta ? metaMatch : true);
}

/**
 * Check if event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  
  const tagName = target.tagName.toLowerCase();
  const isEditable = target.isContentEditable;
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  
  return isInput || isEditable;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {}
): UseKeyboardShortcutsReturn {
  const { 
    enabled = true, 
    shortcuts: initialShortcuts = [],
    onShortcutTriggered 
  } = options;
  
  const enabledRef = useRef(enabled);
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());
  
  // Initialize with provided shortcuts
  useEffect(() => {
    initialShortcuts.forEach(shortcut => {
      shortcutsRef.current.set(shortcut.id, shortcut);
    });
  }, [initialShortcuts]);
  
  // Update enabled ref
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  
  // Handle keydown events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) return;
      
      // Skip if typing in an input (except for Escape)
      if (isInputElement(event.target) && event.key !== 'Escape') {
        return;
      }
      
      // Check all registered shortcuts
      for (const shortcut of shortcutsRef.current.values()) {
        if (shortcut.enabled === false) continue;
        
        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.handler();
          onShortcutTriggered?.(shortcut);
          return;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onShortcutTriggered]);
  
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current.set(shortcut.id, shortcut);
  }, []);
  
  const unregisterShortcut = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
  }, []);
  
  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    return Array.from(shortcutsRef.current.values());
  }, []);
  
  const getShortcutsByCategory = useCallback((category: ShortcutCategory): KeyboardShortcut[] => {
    return Array.from(shortcutsRef.current.values()).filter(s => s.category === category);
  }, []);
  
  const isRegistered = useCallback((id: string): boolean => {
    return shortcutsRef.current.has(id);
  }, []);
  
  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    return formatShortcutKeys(shortcut);
  }, []);
  
  const setEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
  }, []);
  
  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    getShortcutsByCategory,
    isRegistered,
    formatShortcut,
    setEnabled,
  };
}

/**
 * Default application shortcuts
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'handler'>[] = [
  // Navigation
  {
    id: 'nav-up',
    name: 'Navigate Up',
    description: 'Move selection up in lists',
    key: 'ArrowUp',
    category: 'navigation',
  },
  {
    id: 'nav-down',
    name: 'Navigate Down',
    description: 'Move selection down in lists',
    key: 'ArrowDown',
    category: 'navigation',
  },
  {
    id: 'nav-left',
    name: 'Navigate Left',
    description: 'Move to previous item or collapse',
    key: 'ArrowLeft',
    category: 'navigation',
  },
  {
    id: 'nav-right',
    name: 'Navigate Right',
    description: 'Move to next item or expand',
    key: 'ArrowRight',
    category: 'navigation',
  },
  {
    id: 'select-item',
    name: 'Select Item',
    description: 'Select the focused item',
    key: 'Enter',
    category: 'navigation',
  },
  
  // Modals
  {
    id: 'quick-switcher',
    name: 'Quick Switcher',
    description: 'Open quick channel/server switcher',
    key: 'k',
    ctrl: true,
    category: 'modals',
  },
  {
    id: 'shortcuts-help',
    name: 'Keyboard Shortcuts',
    description: 'Show this shortcuts help',
    key: '/',
    ctrl: true,
    category: 'modals',
  },
  {
    id: 'close-modal',
    name: 'Close Modal',
    description: 'Close the current modal or panel',
    key: 'Escape',
    category: 'modals',
  },
  
  // Messaging
  {
    id: 'focus-message-input',
    name: 'Focus Message Input',
    description: 'Focus the message input field',
    key: 'e',
    category: 'messaging',
  },
  {
    id: 'edit-last-message',
    name: 'Edit Last Message',
    description: 'Edit your last sent message',
    key: 'ArrowUp',
    category: 'messaging',
  },
  {
    id: 'send-message',
    name: 'Send Message',
    description: 'Send the current message',
    key: 'Enter',
    category: 'messaging',
  },
  {
    id: 'new-line',
    name: 'New Line',
    description: 'Add a new line in message',
    key: 'Enter',
    shift: true,
    category: 'messaging',
  },
  
  // Media
  {
    id: 'mute-toggle',
    name: 'Toggle Mute',
    description: 'Mute/unmute your microphone',
    key: 'm',
    ctrl: true,
    shift: true,
    category: 'media',
  },
  {
    id: 'deafen-toggle',
    name: 'Toggle Deafen',
    description: 'Deafen/undeafen audio',
    key: 'd',
    ctrl: true,
    shift: true,
    category: 'media',
  },
  
  // General
  {
    id: 'search',
    name: 'Search',
    description: 'Open search',
    key: 'f',
    ctrl: true,
    category: 'general',
  },
  {
    id: 'settings',
    name: 'User Settings',
    description: 'Open user settings',
    key: ',',
    ctrl: true,
    category: 'general',
  },
];

export default useKeyboardShortcuts;

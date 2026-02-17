'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ShortcutsHelpModal } from '../modals/shortcuts-help-modal';
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/hooks/use-keyboard-shortcuts';

/**
 * Modal types supported by the provider
 */
export type ModalType = 
  | 'shortcuts-help'
  | 'quick-switcher'
  | 'settings'
  | 'server-settings'
  | 'create-server'
  | 'create-channel'
  | 'user-profile'
  | 'image-preview'
  | 'confirm';

/**
 * Modal data passed when opening a modal
 */
export interface ModalData {
  // Quick Switcher
  servers?: Array<{ id: string; name: string; icon?: string }>;
  channels?: Array<{ id: string; name: string; serverId: string }>;
  onSelect?: (type: 'server' | 'channel', id: string) => void;
  
  // Confirm dialog
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning' | 'info';
  
  // Image preview
  imageUrl?: string;
  imageAlt?: string;
  
  // User profile
  userId?: string;
  
  // Server settings
  serverId?: string;
  
  // Generic data
  [key: string]: unknown;
}

/**
 * Modal context value
 */
export interface ModalContextValue {
  /** Currently open modal type (null if none) */
  activeModal: ModalType | null;
  /** Data for the active modal */
  modalData: ModalData | null;
  /** Open a modal */
  openModal: (type: ModalType, data?: ModalData) => void;
  /** Close the current modal */
  closeModal: () => void;
  /** Check if a specific modal is open */
  isModalOpen: (type: ModalType) => boolean;
  /** Register keyboard shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Unregister keyboard shortcut */
  unregisterShortcut: (id: string) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Hook to access modal context
 */
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

export interface ModalProviderProps {
  children: ReactNode;
  /** Whether keyboard shortcuts are enabled */
  shortcutsEnabled?: boolean;
}

/**
 * Provider for managing modals and keyboard shortcuts
 */
export function ModalProvider({ 
  children, 
  shortcutsEnabled = true 
}: ModalProviderProps) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  
  const openModal = useCallback((type: ModalType, data?: ModalData) => {
    setActiveModal(type);
    setModalData(data || null);
  }, []);
  
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);
  
  const isModalOpen = useCallback((type: ModalType) => {
    return activeModal === type;
  }, [activeModal]);
  
  // Set up keyboard shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      id: 'shortcuts-help',
      name: 'Keyboard Shortcuts',
      description: 'Show keyboard shortcuts help',
      key: '/',
      ctrl: true,
      category: 'modals',
      handler: () => openModal('shortcuts-help'),
    },
    {
      id: 'quick-switcher',
      name: 'Quick Switcher',
      description: 'Open quick channel/server switcher',
      key: 'k',
      ctrl: true,
      category: 'modals',
      handler: () => {
        if (activeModal === 'quick-switcher') {
          closeModal();
        } else {
          openModal('quick-switcher');
        }
      },
    },
    {
      id: 'close-modal',
      name: 'Close Modal',
      description: 'Close the current modal',
      key: 'Escape',
      category: 'modals',
      handler: () => {
        if (activeModal) {
          closeModal();
        }
      },
    },
  ];
  
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts({
    enabled: shortcutsEnabled,
    shortcuts: defaultShortcuts,
  });
  
  // Update quick-switcher shortcut handler when activeModal changes
  useEffect(() => {
    registerShortcut({
      id: 'quick-switcher',
      name: 'Quick Switcher',
      description: 'Open quick channel/server switcher',
      key: 'k',
      ctrl: true,
      category: 'modals',
      handler: () => {
        if (activeModal === 'quick-switcher') {
          closeModal();
        } else {
          openModal('quick-switcher');
        }
      },
    });
    
    registerShortcut({
      id: 'close-modal',
      name: 'Close Modal',
      description: 'Close the current modal',
      key: 'Escape',
      category: 'modals',
      handler: () => {
        if (activeModal) {
          closeModal();
        }
      },
    });
  }, [activeModal, closeModal, openModal, registerShortcut]);
  
  const contextValue: ModalContextValue = {
    activeModal,
    modalData,
    openModal,
    closeModal,
    isModalOpen,
    registerShortcut,
    unregisterShortcut,
  };
  
  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      
      {/* Global Modals */}
      <ShortcutsHelpModal
        isOpen={activeModal === 'shortcuts-help'}
        onClose={closeModal}
      />
      
      {/* Quick Switcher placeholder - to be implemented */}
      {activeModal === 'quick-switcher' && (
        <QuickSwitcherPlaceholder onClose={closeModal} data={modalData} />
      )}
    </ModalContext.Provider>
  );
}

/**
 * Placeholder for Quick Switcher modal
 * TODO: Implement full quick switcher
 */
function QuickSwitcherPlaceholder({ 
  onClose, 
  data 
}: { 
  onClose: () => void; 
  data: ModalData | null;
}) {
  const [query, setQuery] = useState('');
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // TODO: Navigate down in results
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // TODO: Navigate up in results
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // TODO: Select current item
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '600px',
          maxWidth: '90vw',
          backgroundColor: '#313338',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px' }}>
          <input
            type="text"
            placeholder="Where would you like to go?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#1e1f22',
              border: 'none',
              borderRadius: '4px',
              color: '#f2f3f5',
              fontSize: '16px',
              outline: 'none',
            }}
          />
        </div>
        <div
          style={{
            padding: '8px 16px 16px',
            color: '#949ba4',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <p>Quick Switcher - Type to search channels and servers</p>
          <p style={{ marginTop: '8px', opacity: 0.7 }}>
            Use <kbd style={{ 
              backgroundColor: '#1e1f22', 
              padding: '2px 6px', 
              borderRadius: '4px',
              border: '1px solid #3f4147',
            }}>↑</kbd>{' '}
            <kbd style={{ 
              backgroundColor: '#1e1f22', 
              padding: '2px 6px', 
              borderRadius: '4px',
              border: '1px solid #3f4147',
            }}>↓</kbd> to navigate,{' '}
            <kbd style={{ 
              backgroundColor: '#1e1f22', 
              padding: '2px 6px', 
              borderRadius: '4px',
              border: '1px solid #3f4147',
            }}>Enter</kbd> to select
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModalProvider;

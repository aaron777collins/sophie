import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  FlagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MobileContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  actions: Array<{
    icon: React.ComponentType<any>;
    label: string;
    onClick: () => void;
    destructive?: boolean;
    'data-cy'?: string;
  }>;
}

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

interface MobileToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

// Mobile Context Menu Component
export const MobileContextMenu: React.FC<MobileContextMenuProps> = ({
  isOpen,
  onClose,
  position,
  actions
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Context Menu */}
          <motion.div
            ref={menuRef}
            className="
              fixed z-50 bg-white dark:bg-gray-800 
              rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
              min-w-[200px] max-w-[280px]
              overflow-hidden
            "
            style={{
              left: Math.max(16, Math.min(position.x, window.innerWidth - 216)),
              top: Math.max(16, Math.min(position.y, window.innerHeight - 200))
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            data-cy="mobile-context-menu"
          >
            <div className="py-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-left
                    transition-colors duration-150 min-h-[44px]
                    ${action.destructive 
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                  data-cy={action['data-cy']}
                >
                  <action.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile Modal Component
export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-cy="modal-backdrop"
          />
          
          {/* Modal */}
          <motion.div
            className={`
              fixed inset-x-4 top-16 bottom-16 z-50
              bg-white dark:bg-gray-800 rounded-xl shadow-2xl
              flex flex-col overflow-hidden
              ${className}
            `}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            data-cy="mobile-modal"
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
              data-cy="mobile-modal-header"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                data-cy="mobile-modal-close"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile Toast Notification Component
export const MobileToast: React.FC<MobileToastProps> = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            fixed bottom-20 left-4 right-4 z-50
            px-4 py-3 rounded-lg shadow-lg
            flex items-center justify-between
            ${getToastStyles()}
          `}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          data-cy="mobile-toast"
        >
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-3 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss notification"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Message Context Menu Helper
export const useMessageContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    messageId?: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });

  const openContextMenu = (event: React.TouchEvent | React.MouseEvent, messageId: string) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      position: { x: rect.right, y: rect.top },
      messageId
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  const getMessageActions = (
    messageId: string,
    isOwnMessage: boolean,
    onEdit: (id: string) => void,
    onDelete: (id: string) => void,
    onReply: (id: string) => void,
    onCopy: (id: string) => void,
    onReport?: (id: string) => void
  ) => [
    {
      icon: ArrowUturnLeftIcon,
      label: 'Reply',
      onClick: () => onReply(messageId),
      'data-cy': 'context-reply'
    },
    {
      icon: DocumentDuplicateIcon,
      label: 'Copy Text',
      onClick: () => onCopy(messageId),
      'data-cy': 'context-copy'
    },
    ...(isOwnMessage ? [
      {
        icon: PencilIcon,
        label: 'Edit',
        onClick: () => onEdit(messageId),
        'data-cy': 'context-edit'
      },
      {
        icon: TrashIcon,
        label: 'Delete',
        onClick: () => onDelete(messageId),
        destructive: true,
        'data-cy': 'context-delete'
      }
    ] : []),
    ...(onReport && !isOwnMessage ? [{
      icon: FlagIcon,
      label: 'Report',
      onClick: () => onReport(messageId),
      destructive: true,
      'data-cy': 'context-report'
    }] : [])
  ];

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
    getMessageActions
  };
};

// Mobile-optimized Button Component
export const MobileButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  'data-cy'?: string;
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  'data-cy': dataCy
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm min-h-[40px]';
      case 'lg':
        return 'px-6 py-4 text-lg min-h-[52px]';
      default:
        return 'px-4 py-3 text-base min-h-[44px]';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-cy={dataCy}
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        font-medium rounded-lg transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};
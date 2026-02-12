'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  KeyboardEvent,
  useRef,
} from 'react';
import styles from './tabs.module.css';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

// ============================================================================
// Tabs Root
// ============================================================================

export interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Tabs({
  children,
  defaultValue,
  value,
  onChange,
  orientation = 'horizontal',
  className = '',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const activeTab = value !== undefined ? value : internalValue;
  
  const setActiveTab = useCallback(
    (id: string) => {
      if (value === undefined) {
        setInternalValue(id);
      }
      onChange?.(id);
    },
    [value, onChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, orientation }}>
      <div
        className={`${styles.tabs} ${styles[orientation]} ${className}`}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// Tab List
// ============================================================================

export interface TabListProps {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function TabList({
  children,
  className = '',
  'aria-label': ariaLabel,
}: TabListProps) {
  const { orientation } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const list = listRef.current;
      if (!list) return;

      const tabs = Array.from(
        list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      );
      const currentIndex = tabs.findIndex(
        (tab) => tab === document.activeElement
      );

      let nextIndex = currentIndex;

      const isHorizontal = orientation === 'horizontal';
      const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

      switch (event.key) {
        case prevKey:
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          event.preventDefault();
          break;
        case nextKey:
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          event.preventDefault();
          break;
        case 'Home':
          nextIndex = 0;
          event.preventDefault();
          break;
        case 'End':
          nextIndex = tabs.length - 1;
          event.preventDefault();
          break;
      }

      if (nextIndex !== currentIndex && tabs[nextIndex]) {
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      }
    },
    [orientation]
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={`${styles.tabList} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tab Trigger
// ============================================================================

export interface TabTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  badge?: string | number;
}

export function TabTrigger({
  value,
  children,
  disabled = false,
  className = '',
  icon,
  badge,
}: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={`${styles.tabTrigger} ${isActive ? styles.active : ''} ${
        disabled ? styles.disabled : ''
      } ${className}`}
      onClick={() => !disabled && setActiveTab(value)}
    >
      {icon && <span className={styles.tabIcon}>{icon}</span>}
      <span className={styles.tabLabel}>{children}</span>
      {badge !== undefined && (
        <span className={styles.tabBadge}>{badge}</span>
      )}
    </button>
  );
}

// ============================================================================
// Tab Content
// ============================================================================

export interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function TabContent({
  value,
  children,
  className = '',
  forceMount = false,
}: TabContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={`${styles.tabContent} ${isActive ? styles.active : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tab Group (for sidebar-style navigation with categories)
// ============================================================================

export interface TabGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function TabGroup({
  label,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}: TabGroupProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`${styles.tabGroup} ${className}`}>
      <div
        className={`${styles.tabGroupHeader} ${collapsible ? styles.collapsible : ''}`}
        onClick={() => collapsible && setCollapsed(!collapsed)}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setCollapsed(!collapsed);
          }
        }}
      >
        <span className={styles.tabGroupLabel}>{label}</span>
        {collapsible && (
          <ChevronIcon className={`${styles.chevron} ${collapsed ? styles.collapsed : ''}`} />
        )}
      </div>
      {!collapsed && (
        <div className={styles.tabGroupContent}>
          {children}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Export all components
export default Tabs;

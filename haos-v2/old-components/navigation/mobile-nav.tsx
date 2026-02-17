import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  Bars3Icon,
  ChevronRightIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  UserIcon as UserSolid,
  ServerIcon as ServerSolid
} from '@heroicons/react/24/solid';

interface MobileNavProps {
  currentView: 'servers' | 'dms' | 'chat' | 'profile';
  onViewChange: (view: 'servers' | 'dms' | 'chat' | 'profile') => void;
  onServerDrawerToggle?: () => void;
  onMemberSidebarToggle?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  isServerDrawerOpen?: boolean;
  isMemberSidebarOpen?: boolean;
  className?: string;
  isLandscape?: boolean;
}

interface SwipeHandlers {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
}

// Custom hook for swipe gestures
const useSwipeGestures = ({ onSwipeRight, onSwipeLeft }: SwipeHandlers) => {
  const handlePan = (event: PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 300;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return { handlePan };
};

// Bottom Tab Bar Component
const MobileTabBar: React.FC<{
  currentView: string;
  onViewChange: (view: 'servers' | 'dms' | 'profile') => void;
  isLandscape?: boolean;
}> = ({ currentView, onViewChange, isLandscape }) => {
  const tabs = [
    {
      id: 'servers',
      label: 'Servers',
      icon: ServerIcon,
      activeIcon: ServerSolid,
      'data-cy': 'tab-servers'
    },
    {
      id: 'dms',
      label: 'Messages',
      icon: ChatBubbleLeftRightIcon,
      activeIcon: ChatSolid,
      'data-cy': 'tab-dms'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      activeIcon: UserSolid,
      'data-cy': 'tab-profile'
    }
  ];

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700
        ${isLandscape ? 'landscape-nav h-12' : 'portrait-nav h-16'}
        safe-area-pb
      `}
      data-cy="mobile-tab-bar"
    >
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const isActive = currentView === tab.id;
          const Icon = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id as any)}
              className={`
                flex flex-col items-center justify-center px-3 py-1
                min-h-[44px] min-w-[44px] rounded-lg
                transition-colors duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
              data-cy={tab['data-cy']}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`${isLandscape ? 'w-5 h-5' : 'w-6 h-6'} mb-1`} />
              <span className={`text-xs ${isLandscape ? 'hidden' : 'block'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                  layoutId="activeTab"
                  initial={false}
                  style={{ x: '-50%' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Mobile Menu Drawer Component
const MobileMenuDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}> = ({ isOpen, onClose, onNavigate }) => {
  const menuItems = [
    { 
      icon: Cog6ToothIcon, 
      label: 'Settings', 
      path: '/settings',
      'data-cy': 'menu-settings'
    },
    { 
      icon: QuestionMarkCircleIcon, 
      label: 'Help & Support', 
      path: '/help',
      'data-cy': 'menu-help'
    },
    { 
      icon: ArrowRightOnRectangleIcon, 
      label: 'Sign Out', 
      path: '/logout',
      'data-cy': 'menu-logout'
    }
  ];

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

  const handleItemClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        data-cy="modal-backdrop"
        style={{ display: isOpen ? 'block' : 'none' }}
      />
      
      {/* Drawer */}
      <motion.div
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw]
          bg-white dark:bg-gray-800 shadow-2xl z-50
          flex flex-col
          ${isOpen ? 'open' : ''}
        `}
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        data-cy="mobile-menu-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close menu"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleItemClick(item.path)}
              className="
                w-full flex items-center px-6 py-4 text-left
                text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors duration-200
                min-h-[44px]
              "
              data-cy={item['data-cy']}
            >
              <item.icon className="w-6 h-6 mr-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
};

// Main Mobile Navigation Component
export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onViewChange,
  onServerDrawerToggle,
  onMemberSidebarToggle,
  onBack,
  showBackButton = false,
  isServerDrawerOpen = false,
  isMemberSidebarOpen = false,
  className = '',
  isLandscape = false
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight < window.innerWidth ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
    };

    handleOrientationChange(); // Initial check
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const isCurrentLandscape = isLandscape || orientation === 'landscape';

  // Swipe gesture handlers
  const { handlePan } = useSwipeGestures({
    onSwipeRight: onServerDrawerToggle,
    onSwipeLeft: onMemberSidebarToggle
  });

  const handleNavigation = (path: string) => {
    // Handle navigation logic here
    // This would typically use a router
    console.log('Navigate to:', path);
  };

  return (
    <div
      ref={containerRef}
      className={`
        mobile-navigation 
        ${isCurrentLandscape ? 'landscape' : 'portrait'}
        ${className}
      `}
      data-cy="mobile-navigation"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Top Header Bar */}
      <div className="
        fixed top-0 left-0 right-0 z-30
        h-14 bg-white dark:bg-gray-800
        border-b border-gray-200 dark:border-gray-700
        flex items-center justify-between px-4
        safe-area-pt
      ">
        {/* Left Side */}
        <div className="flex items-center space-x-2">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px]"
              data-cy="mobile-back-button"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          ) : (
            <button
              onClick={onServerDrawerToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px]"
              data-cy="mobile-drawer-toggle"
              aria-label="Open server drawer"
              aria-expanded={isServerDrawerOpen}
            >
              <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Center Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {currentView === 'servers' ? 'Servers' :
             currentView === 'dms' ? 'Messages' :
             currentView === 'chat' ? 'Chat' :
             currentView === 'profile' ? 'Profile' : 'HAOS'}
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px]"
            data-cy="hamburger-menu-button"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Swipeable Main Content Area */}
      <motion.div
        className="
          fixed top-14 left-0 right-0 bottom-16
          overflow-hidden
        "
        onPan={handlePan}
        data-cy="main-content"
        aria-label="Main content area - swipe right for servers, swipe left for members"
      >
        <div 
          className={`
            h-full mobile-layout
            ${isCurrentLandscape ? 'landscape' : 'portrait'}
          `}
          data-cy="mobile-layout"
        >
          {/* Content will be rendered by parent components */}
          {currentView === 'servers' && (
            <div data-cy="server-list-view" className="h-full">
              {/* Server list content */}
            </div>
          )}
          {currentView === 'dms' && (
            <div data-cy="dm-list-view" className="h-full">
              {/* DM list content */}
            </div>
          )}
          {currentView === 'profile' && (
            <div data-cy="profile-view" className="h-full">
              {/* Profile content */}
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Tab Bar */}
      <MobileTabBar
        currentView={currentView}
        onViewChange={onViewChange}
        isLandscape={isCurrentLandscape}
      />

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleNavigation}
      />

      {/* CSS for safe area handling */}
      <style jsx>{`
        .safe-area-pt {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default MobileNav;
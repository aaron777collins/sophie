import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MobileNav } from './mobile-nav';
import { MobileServerDrawer, MobileMemberSidebar } from './mobile-drawers';
import { useSwipeGestures, usePullToRefresh, addMobileGestureSupport } from '../../hooks/use-mobile-gestures';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentView: 'servers' | 'dms' | 'chat' | 'profile';
  onViewChange: (view: 'servers' | 'dms' | 'chat' | 'profile') => void;
  servers?: Server[];
  members?: Member[];
  currentServerId?: string;
  channelName?: string;
  onServerSelect?: (serverId: string) => void;
  onMemberClick?: (memberId: string) => void;
  onCreateServer?: () => void;
  onRefresh?: () => Promise<void>;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

interface Server {
  id: string;
  name: string;
  icon?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface Member {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  isBot?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  currentView,
  onViewChange,
  servers = [],
  members = [],
  currentServerId,
  channelName,
  onServerSelect = () => {},
  onMemberClick = () => {},
  onCreateServer = () => {},
  onRefresh,
  showBackButton = false,
  onBack,
  className = ''
}) => {
  // State management
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);
  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize mobile gesture support for Cypress testing
  useEffect(() => {
    addMobileGestureSupport();
  }, []);

  // Detect mobile viewport and orientation
  useEffect(() => {
    const checkMobileView = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Consider mobile if width <= 768px or height <= 768px (to account for landscape)
      const mobile = width <= 768 || (height <= 768 && width <= 1024);
      const landscape = width > height;
      
      setIsMobileView(mobile);
      setIsLandscape(landscape);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    window.addEventListener('orientationchange', () => {
      // Small delay to allow orientation change to complete
      setTimeout(checkMobileView, 100);
    });

    return () => {
      window.removeEventListener('resize', checkMobileView);
      window.removeEventListener('orientationchange', checkMobileView);
    };
  }, []);

  // Swipe gestures
  const swipeHandlers = useSwipeGestures({
    onSwipeRight: () => {
      if (currentView === 'chat' && !isServerDrawerOpen) {
        setIsServerDrawerOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (currentView === 'chat' && !isMemberSidebarOpen) {
        setIsMemberSidebarOpen(true);
      }
    },
    threshold: 50,
    velocityThreshold: 0.3
  });

  // Pull to refresh
  const { 
    pullToRefreshHandlers, 
    pullRefreshIndicator, 
    isPulling, 
    pullDistance 
  } = usePullToRefresh({
    onRefresh: onRefresh || (() => Promise.resolve()),
    enabled: !!onRefresh && currentView === 'chat'
  });

  // Close drawers when view changes
  useEffect(() => {
    setIsServerDrawerOpen(false);
    setIsMemberSidebarOpen(false);
  }, [currentView]);

  // Handle drawer toggles
  const handleServerDrawerToggle = () => {
    setIsServerDrawerOpen(!isServerDrawerOpen);
    setIsMemberSidebarOpen(false); // Close member sidebar when opening server drawer
  };

  const handleMemberSidebarToggle = () => {
    setIsMemberSidebarOpen(!isMemberSidebarOpen);
    setIsServerDrawerOpen(false); // Close server drawer when opening member sidebar
  };

  // Close drawers on backdrop click or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsServerDrawerOpen(false);
        setIsMemberSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Don't render mobile layout on desktop
  if (!isMobileView) {
    return (
      <div className={`desktop-layout ${className}`} data-cy="desktop-layout">
        {children}
        <div className="desktop-sidebar" data-cy="desktop-sidebar">
          {/* Desktop sidebar would be rendered here */}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        mobile-layout min-h-screen bg-gray-50 dark:bg-gray-900
        ${isLandscape ? 'landscape' : 'portrait'}
        ${className}
      `}
      data-cy="mobile-layout"
      {...swipeHandlers}
    >
      {/* Mobile Navigation */}
      <MobileNav
        currentView={currentView}
        onViewChange={onViewChange}
        onServerDrawerToggle={handleServerDrawerToggle}
        onMemberSidebarToggle={handleMemberSidebarToggle}
        onBack={onBack}
        showBackButton={showBackButton}
        isServerDrawerOpen={isServerDrawerOpen}
        isMemberSidebarOpen={isMemberSidebarOpen}
        isLandscape={isLandscape}
      />

      {/* Main Content Area */}
      <div
        className="
          pt-14 pb-16
          h-screen overflow-hidden
        "
        data-cy="main-content"
        data-pull-refresh={onRefresh ? 'true' : 'false'}
        {...pullToRefreshHandlers}
      >
        {/* Pull to Refresh Indicator */}
        <AnimatePresence>
          {pullRefreshIndicator && (
            <div 
              className="
                absolute top-14 left-0 right-0 z-30
                flex items-center justify-center
                bg-blue-50 dark:bg-blue-900/20
                text-blue-600 dark:text-blue-400
                text-sm font-medium py-2
                transform
              "
              style={{
                transform: `translateY(${Math.min(pullDistance - 80, 0)}px)`
              }}
              data-cy="pull-refresh-indicator"
            >
              {isPulling ? '↓ Pull to refresh' : '🔄 Refreshing...'}
            </div>
          )}
        </AnimatePresence>

        {/* Content Container */}
        <div className="h-full overflow-y-auto" data-cy="chat-container">
          {children}
        </div>
      </div>

      {/* Server Drawer */}
      <MobileServerDrawer
        isOpen={isServerDrawerOpen}
        onClose={() => setIsServerDrawerOpen(false)}
        servers={servers}
        currentServerId={currentServerId}
        onServerSelect={onServerSelect}
        onCreateServer={onCreateServer}
      />

      {/* Member Sidebar */}
      <MobileMemberSidebar
        isOpen={isMemberSidebarOpen}
        onClose={() => setIsMemberSidebarOpen(false)}
        members={members}
        onMemberClick={onMemberClick}
        channelName={channelName}
      />

      {/* Tablet-specific layout elements */}
      {isLandscape && window.innerWidth >= 768 && (
        <>
          <div className="tablet-sidebar" data-cy="tablet-sidebar">
            {/* Tablet sidebar content */}
          </div>
          <div className="tablet-split-view" data-cy="tablet-split-view">
            {/* Tablet split view content */}
          </div>
        </>
      )}

      {/* Styles for mobile-specific elements */}
      <style jsx>{`
        .mobile-layout {
          /* Ensure mobile viewport handling */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }
        
        .mobile-layout.landscape {
          /* Landscape-specific adjustments */
        }
        
        .mobile-layout.portrait {
          /* Portrait-specific adjustments */
        }

        /* Safe area support for notched devices */
        @supports (padding-top: env(safe-area-inset-top)) {
          .mobile-layout {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        }

        /* Prevent zooming on input focus (iOS Safari) */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          select:focus,
          textarea:focus,
          input:focus {
            font-size: 16px;
          }
        }

        /* Hide desktop elements on mobile */
        .desktop-sidebar {
          display: none !important;
        }

        /* Touch-friendly scrolling */
        .h-full {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default MobileLayout;
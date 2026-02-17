import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

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

interface MobileServerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  servers: Server[];
  currentServerId?: string;
  onServerSelect: (serverId: string) => void;
  onCreateServer: () => void;
}

interface MobileMemberSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onMemberClick: (memberId: string) => void;
  channelName?: string;
}

// Server Drawer Component
export const MobileServerDrawer: React.FC<MobileServerDrawerProps> = ({
  isOpen,
  onClose,
  servers,
  currentServerId,
  onServerSelect,
  onCreateServer
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

  const handleServerClick = (serverId: string) => {
    onServerSelect(serverId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-cy="server-drawer-backdrop"
          />
          
          {/* Drawer */}
          <motion.div
            className={`
              fixed top-0 left-0 h-full w-80 max-w-[85vw]
              bg-white dark:bg-gray-800 shadow-2xl z-50
              flex flex-col
              ${isOpen ? 'open' : ''}
            `}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            data-cy="server-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Servers
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onCreateServer}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Create server"
                  data-cy="add-server-button"
                >
                  <PlusIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close server drawer"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Server List */}
            <div className="flex-1 overflow-y-auto py-2">
              {servers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <PlusIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No servers yet</p>
                  <button
                    onClick={onCreateServer}
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                  >
                    Create your first server
                  </button>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {servers.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => handleServerClick(server.id)}
                      className={`
                        w-full flex items-center p-3 rounded-lg text-left
                        transition-colors duration-200 min-h-[48px]
                        ${currentServerId === server.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                      data-cy={`server-${server.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {/* Server Icon */}
                      <div className="flex-shrink-0 mr-3">
                        {server.icon ? (
                          <img
                            src={server.icon}
                            alt={`${server.name} icon`}
                            className="w-8 h-8 rounded-lg"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {server.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {server.isOnline && (
                          <div className="absolute -mt-1 -mr-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                        )}
                      </div>

                      {/* Server Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {server.name}
                          </span>
                          {server.unreadCount && server.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full min-w-[20px] text-center">
                              {server.unreadCount > 99 ? '99+' : server.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onCreateServer}
                className="
                  w-full flex items-center justify-center p-3 
                  bg-blue-600 hover:bg-blue-700 
                  text-white rounded-lg font-medium
                  transition-colors duration-200
                  min-h-[44px]
                "
                data-cy="create-server-button"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Server
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Member Sidebar Component
export const MobileMemberSidebar: React.FC<MobileMemberSidebarProps> = ({
  isOpen,
  onClose,
  members,
  onMemberClick,
  channelName
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    };

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleMemberClick = (memberId: string) => {
    onMemberClick(memberId);
    onClose();
  };

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Member['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': default: return 'Offline';
    }
  };

  // Group members by status
  const groupedMembers = members.reduce((acc, member) => {
    if (!acc[member.status]) {
      acc[member.status] = [];
    }
    acc[member.status].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const statusOrder: Member['status'][] = ['online', 'away', 'busy', 'offline'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            data-cy="member-sidebar-backdrop"
          />
          
          {/* Sidebar */}
          <motion.div
            className={`
              fixed top-0 right-0 h-full w-80 max-w-[85vw]
              bg-white dark:bg-gray-800 shadow-2xl z-50
              flex flex-col
              ${isOpen ? 'open' : ''}
            `}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            data-cy="member-sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Members
                </h2>
                {channelName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {channelName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close member sidebar"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto">
              {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No members found</p>
                </div>
              ) : (
                <div className="py-2">
                  {statusOrder.map((status) => {
                    const statusMembers = groupedMembers[status];
                    if (!statusMembers || statusMembers.length === 0) return null;

                    return (
                      <div key={status} className="mb-4">
                        {/* Status Header */}
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {getStatusText(status)} — {statusMembers.length}
                        </div>

                        {/* Members */}
                        <div className="space-y-1 px-2">
                          {statusMembers.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleMemberClick(member.id)}
                              className="
                                w-full flex items-center p-2 rounded-lg text-left
                                hover:bg-gray-50 dark:hover:bg-gray-700 
                                text-gray-700 dark:text-gray-300
                                transition-colors duration-200
                                min-h-[44px]
                              "
                              data-cy={`member-${member.username}`}
                            >
                              {/* Avatar */}
                              <div className="flex-shrink-0 mr-3 relative">
                                {member.avatarUrl ? (
                                  <img
                                    src={member.avatarUrl}
                                    alt={`${member.displayName} avatar`}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {member.displayName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {/* Status indicator */}
                                <div 
                                  className={`
                                    absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800
                                    ${getStatusColor(member.status)}
                                  `}
                                />
                              </div>

                              {/* Member Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {member.displayName}
                                  {member.isBot && (
                                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded">
                                      BOT
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  @{member.username}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  Server,
  Role,
  AuditLogEntry,
  ServerBan,
  ServerInvite,
} from '@/lib/types/server';

interface UseServerSettingsOptions {
  server: Server;
  // API functions for server operations
  updateServer?: (serverId: string, updates: Partial<Server>) => Promise<Server>;
  createRole?: (serverId: string) => Promise<Role>;
  updateRole?: (serverId: string, roleId: string, updates: Partial<Role>) => Promise<Role>;
  deleteRole?: (serverId: string, roleId: string) => Promise<void>;
  reorderRoles?: (serverId: string, roleIds: string[]) => Promise<void>;
  fetchAuditLog?: (serverId: string, before?: string) => Promise<{ entries: AuditLogEntry[]; hasMore: boolean }>;
  unbanUser?: (serverId: string, userId: string) => Promise<void>;
  banUser?: (serverId: string, userId: string, reason?: string, deleteDays?: number) => Promise<void>;
  deleteInvite?: (serverId: string, code: string) => Promise<void>;
  pauseInvites?: (serverId: string, paused: boolean) => Promise<void>;
}

export function useServerSettings({
  server: initialServer,
  updateServer: apiUpdateServer,
  createRole: apiCreateRole,
  updateRole: apiUpdateRole,
  deleteRole: apiDeleteRole,
  reorderRoles: apiReorderRoles,
  fetchAuditLog: apiFetchAuditLog,
  unbanUser: apiUnbanUser,
  banUser: apiBanUser,
  deleteInvite: apiDeleteInvite,
  pauseInvites: apiPauseInvites,
}: UseServerSettingsOptions) {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  
  // Server state
  const [server, setServer] = useState<Server>(initialServer);
  
  // Audit log state
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [hasMoreAuditLog, setHasMoreAuditLog] = useState(true);
  const [isLoadingAuditLog, setIsLoadingAuditLog] = useState(false);
  
  // Bans state
  const [bans, setBans] = useState<ServerBan[]>([]);
  
  // Invites state
  const [invites, setInvites] = useState<ServerInvite[]>([]);
  const [isInvitesPaused, setIsInvitesPaused] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open/close modal
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Update server settings
  const handleUpdateServer = useCallback(
    async (updates: Partial<Server>) => {
      if (!apiUpdateServer) {
        console.warn('updateServer API function not provided');
        setServer((prev) => ({ ...prev, ...updates }));
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const updated = await apiUpdateServer(server.id, updates);
        setServer(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update server');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, apiUpdateServer]
  );

  // Role management
  const handleCreateRole = useCallback(async () => {
    if (!apiCreateRole) {
      console.warn('createRole API function not provided');
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: 'new role',
        color: '#99aab5',
        permissions: BigInt(0),
        position: server.roles.length,
        mentionable: false,
        hoist: false,
        managed: false,
      };
      setServer((prev) => ({
        ...prev,
        roles: [...prev.roles, newRole],
      }));
      return newRole;
    }

    setIsLoading(true);
    try {
      const role = await apiCreateRole(server.id);
      setServer((prev) => ({
        ...prev,
        roles: [...prev.roles, role],
      }));
      return role;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [server.id, server.roles.length, apiCreateRole]);

  const handleUpdateRole = useCallback(
    async (roleId: string, updates: Partial<Role>) => {
      if (!apiUpdateRole) {
        console.warn('updateRole API function not provided');
        setServer((prev) => ({
          ...prev,
          roles: prev.roles.map((r) =>
            r.id === roleId ? { ...r, ...updates } : r
          ),
        }));
        return;
      }

      setIsLoading(true);
      try {
        const updated = await apiUpdateRole(server.id, roleId, updates);
        setServer((prev) => ({
          ...prev,
          roles: prev.roles.map((r) => (r.id === roleId ? updated : r)),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, apiUpdateRole]
  );

  const handleDeleteRole = useCallback(
    async (roleId: string) => {
      if (!apiDeleteRole) {
        console.warn('deleteRole API function not provided');
        setServer((prev) => ({
          ...prev,
          roles: prev.roles.filter((r) => r.id !== roleId),
        }));
        return;
      }

      setIsLoading(true);
      try {
        await apiDeleteRole(server.id, roleId);
        setServer((prev) => ({
          ...prev,
          roles: prev.roles.filter((r) => r.id !== roleId),
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete role');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, apiDeleteRole]
  );

  const handleReorderRoles = useCallback(
    async (roleIds: string[]) => {
      if (!apiReorderRoles) {
        console.warn('reorderRoles API function not provided');
        return;
      }

      setIsLoading(true);
      try {
        await apiReorderRoles(server.id, roleIds);
        // Update local state with new order
        const roleMap = new Map(server.roles.map((r) => [r.id, r]));
        const reordered = roleIds
          .map((id, index) => {
            const role = roleMap.get(id);
            return role ? { ...role, position: roleIds.length - index - 1 } : null;
          })
          .filter((r): r is Role => r !== null);
        setServer((prev) => ({ ...prev, roles: reordered }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reorder roles');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, server.roles, apiReorderRoles]
  );

  // Audit log
  const handleLoadMoreAuditLog = useCallback(async () => {
    if (!apiFetchAuditLog || isLoadingAuditLog || !hasMoreAuditLog) return;

    setIsLoadingAuditLog(true);
    try {
      const lastEntry = auditLog[auditLog.length - 1];
      const result = await apiFetchAuditLog(server.id, lastEntry?.id);
      setAuditLog((prev) => [...prev, ...result.entries]);
      setHasMoreAuditLog(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit log');
    } finally {
      setIsLoadingAuditLog(false);
    }
  }, [server.id, auditLog, isLoadingAuditLog, hasMoreAuditLog, apiFetchAuditLog]);

  // Ban management
  const handleUnbanUser = useCallback(
    async (userId: string) => {
      if (!apiUnbanUser) {
        console.warn('unbanUser API function not provided');
        setBans((prev) => prev.filter((b) => b.userId !== userId));
        return;
      }

      setIsLoading(true);
      try {
        await apiUnbanUser(server.id, userId);
        setBans((prev) => prev.filter((b) => b.userId !== userId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unban user');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, apiUnbanUser]
  );

  const handleBanUser = useCallback(
    async (userId: string, reason?: string, deleteDays?: number) => {
      if (!apiBanUser) {
        console.warn('banUser API function not provided');
        return;
      }

      setIsLoading(true);
      try {
        await apiBanUser(server.id, userId, reason, deleteDays);
        // The ban will be added through a websocket event or refetch
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to ban user');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, apiBanUser]
  );

  // Invite management
  const handleDeleteInvite = useCallback(
    async (code: string) => {
      if (!apiDeleteInvite) {
        console.warn('deleteInvite API function not provided');
        setInvites((prev) => prev.filter((i) => i.code !== code));
        return;
      }

      setIsLoading(true);
      try {
        await apiDeleteInvite(server.id, code);
        setInvites((prev) => prev.filter((i) => i.code !== code));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invite');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [server.id, apiDeleteInvite]
  );

  const handlePauseInvites = useCallback(async () => {
    if (!apiPauseInvites) {
      console.warn('pauseInvites API function not provided');
      setIsInvitesPaused((prev) => !prev);
      return;
    }

    setIsLoading(true);
    try {
      await apiPauseInvites(server.id, !isInvitesPaused);
      setIsInvitesPaused((prev) => !prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause invites');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [server.id, isInvitesPaused, apiPauseInvites]);

  return {
    // Modal state
    isOpen,
    open,
    close,
    
    // Server data
    server,
    setServer,
    
    // Audit log
    auditLog,
    setAuditLog,
    hasMoreAuditLog,
    isLoadingAuditLog,
    
    // Bans
    bans,
    setBans,
    
    // Invites
    invites,
    setInvites,
    isInvitesPaused,
    setIsInvitesPaused,
    
    // Loading/error state
    isLoading,
    error,
    
    // Actions
    handleUpdateServer,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    handleReorderRoles,
    handleLoadMoreAuditLog,
    handleUnbanUser,
    handleBanUser,
    handleDeleteInvite,
    handlePauseInvites,
  };
}

export type UseServerSettingsReturn = ReturnType<typeof useServerSettings>;

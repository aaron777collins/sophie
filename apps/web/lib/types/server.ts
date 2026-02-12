/**
 * Server/Space types for HAOS Discord clone with Matrix backend
 */

// Role permissions bit flags (Discord-style)
export const RolePermissions = {
  VIEW_CHANNELS: 1n << 0n,
  MANAGE_CHANNELS: 1n << 1n,
  MANAGE_ROLES: 1n << 2n,
  MANAGE_EMOJIS: 1n << 3n,
  VIEW_AUDIT_LOG: 1n << 4n,
  MANAGE_WEBHOOKS: 1n << 5n,
  MANAGE_SERVER: 1n << 6n,
  CREATE_INVITES: 1n << 7n,
  CHANGE_NICKNAME: 1n << 8n,
  MANAGE_NICKNAMES: 1n << 9n,
  KICK_MEMBERS: 1n << 10n,
  BAN_MEMBERS: 1n << 11n,
  TIMEOUT_MEMBERS: 1n << 12n,
  SEND_MESSAGES: 1n << 13n,
  SEND_MESSAGES_IN_THREADS: 1n << 14n,
  CREATE_THREADS: 1n << 15n,
  EMBED_LINKS: 1n << 16n,
  ATTACH_FILES: 1n << 17n,
  ADD_REACTIONS: 1n << 18n,
  USE_EXTERNAL_EMOJIS: 1n << 19n,
  USE_EXTERNAL_STICKERS: 1n << 20n,
  MENTION_EVERYONE: 1n << 21n,
  MANAGE_MESSAGES: 1n << 22n,
  MANAGE_THREADS: 1n << 23n,
  READ_MESSAGE_HISTORY: 1n << 24n,
  SEND_TTS_MESSAGES: 1n << 25n,
  USE_VOICE_ACTIVITY: 1n << 26n,
  CONNECT: 1n << 27n,
  SPEAK: 1n << 28n,
  STREAM: 1n << 29n,
  USE_SOUNDBOARD: 1n << 30n,
  MUTE_MEMBERS: 1n << 31n,
  DEAFEN_MEMBERS: 1n << 32n,
  MOVE_MEMBERS: 1n << 33n,
  PRIORITY_SPEAKER: 1n << 34n,
  ADMINISTRATOR: 1n << 35n,
} as const;

export type RolePermissionKey = keyof typeof RolePermissions;

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: bigint;
  position: number;
  mentionable: boolean;
  hoist: boolean; // Display separately in member list
  managed: boolean; // Managed by integration
  icon?: string;
  unicodeEmoji?: string;
  memberCount?: number;
}

export interface ServerMember {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[]; // Role IDs
  joinedAt: Date;
  nickname?: string;
  isPending?: boolean;
  communicationDisabledUntil?: Date;
}

export type VerificationLevel = 'none' | 'low' | 'medium' | 'high' | 'very_high';
export type ExplicitContentFilter = 'disabled' | 'members_without_roles' | 'all_members';
export type DefaultNotificationLevel = 'all_messages' | 'only_mentions';
export type MfaLevel = 'none' | 'elevated';

export interface ServerEmoji {
  id: string;
  name: string;
  imageUrl: string;
  animated: boolean;
  available: boolean;
  managed: boolean;
  requireColons: boolean;
  roles?: string[]; // Role IDs that can use this emoji
}

export interface AuditLogEntry {
  id: string;
  actionType: string;
  userId: string;
  targetId?: string;
  targetType?: 'user' | 'role' | 'channel' | 'message' | 'invite' | 'webhook';
  changes: AuditLogChange[];
  reason?: string;
  createdAt: Date;
}

export interface AuditLogChange {
  key: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface ServerInvite {
  code: string;
  channelId: string;
  inviterId: string;
  uses: number;
  maxUses: number;
  maxAge: number; // In seconds, 0 for never
  temporary: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface ServerBan {
  userId: string;
  reason?: string;
  bannedBy: string;
  bannedAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  avatarUrl?: string;
  channelId: string;
  token: string;
  url: string;
  createdAt: Date;
}

export interface ServerIntegration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  syncing: boolean;
  roleId?: string;
  expireBehavior: number;
  expireGracePeriod: number;
  account: {
    id: string;
    name: string;
  };
  syncedAt?: Date;
}

export interface Server {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  splashUrl?: string;
  ownerId: string;
  
  // Settings
  verificationLevel: VerificationLevel;
  explicitContentFilter: ExplicitContentFilter;
  defaultNotificationLevel: DefaultNotificationLevel;
  mfaLevel: MfaLevel;
  
  // Features
  features: ServerFeature[];
  
  // Channels
  afkChannelId?: string;
  afkTimeout: number; // In seconds
  systemChannelId?: string;
  systemChannelFlags: number;
  rulesChannelId?: string;
  publicUpdatesChannelId?: string;
  
  // Limits
  maxMembers: number;
  maxVideoChannelUsers?: number;
  premiumTier: number;
  premiumSubscriptionCount: number;
  
  // Locale
  preferredLocale: string;
  
  // Related data
  roles: Role[];
  emojis: ServerEmoji[];
  memberCount: number;
  
  // Matrix-specific
  matrixRoomId?: string;
  matrixSpaceId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type ServerFeature = 
  | 'ANIMATED_BANNER'
  | 'ANIMATED_ICON'
  | 'BANNER'
  | 'COMMUNITY'
  | 'DISCOVERABLE'
  | 'INVITE_SPLASH'
  | 'MEMBER_VERIFICATION_GATE_ENABLED'
  | 'MONETIZATION_ENABLED'
  | 'MORE_EMOJI'
  | 'MORE_STICKERS'
  | 'NEWS'
  | 'PARTNERED'
  | 'PREVIEW_ENABLED'
  | 'PRIVATE_THREADS'
  | 'ROLE_ICONS'
  | 'TICKETED_EVENTS_ENABLED'
  | 'VANITY_URL'
  | 'VERIFIED'
  | 'VIP_REGIONS'
  | 'WELCOME_SCREEN_ENABLED';

// Settings tab types
export type ServerSettingsTab = 
  | 'overview'
  | 'roles'
  | 'emoji'
  | 'stickers'
  | 'moderation'
  | 'audit-log'
  | 'integrations'
  | 'widgets'
  | 'server-template'
  | 'invites'
  | 'bans'
  | 'safety-setup'
  | 'community';

export interface ServerSettingsState {
  activeTab: ServerSettingsTab;
  unsavedChanges: boolean;
  isLoading: boolean;
  error?: string;
}

// Form types for editing
export interface ServerOverviewForm {
  name: string;
  description: string;
  icon?: File | null;
  banner?: File | null;
  splash?: File | null;
  afkChannelId: string;
  afkTimeout: number;
  systemChannelId: string;
  systemChannelFlags: number;
  defaultNotificationLevel: DefaultNotificationLevel;
}

export interface RoleForm {
  name: string;
  color: string;
  permissions: bigint;
  hoist: boolean;
  mentionable: boolean;
  icon?: File | null;
  unicodeEmoji?: string;
}

export interface ModerationSettingsForm {
  verificationLevel: VerificationLevel;
  explicitContentFilter: ExplicitContentFilter;
  mfaLevel: MfaLevel;
}

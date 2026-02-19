// Matrix-equivalent types for HAOS (replaces Prisma types from discord-clone)

// Channel types in Matrix (equivalent to Prisma ChannelType)
export enum ChannelType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO"
}

// Member roles (equivalent to Prisma MemberRole)
export enum MemberRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  GUEST = "GUEST"
}

// Profile type (Matrix user profile)
export interface Profile {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Channel type (Matrix room/channel)
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  profileId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Member type (Matrix room member)
export interface Member {
  id: string;
  role: MemberRole;
  profileId: string;
  serverId: string;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
}

// Server type (Matrix space)
export interface Server {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
  channels?: Channel[];
  members?: Member[];
}

// Server with members and profiles
export type ServerWithMembersWithProfiles = Server & {
  members: (Member & { profile: Profile })[];
  channels: Channel[];
};

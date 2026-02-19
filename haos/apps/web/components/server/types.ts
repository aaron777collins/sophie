// Server Sidebar Types - Matrix equivalents to Prisma types

export enum ChannelType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO"
}

export enum MemberRole {
  GUEST = "GUEST",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN"
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  profileId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  role: MemberRole;
  profileId: string;
  serverId: string;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
}

export interface Server {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ServerWithMembersWithProfiles = Server & {
  members: Member[];
  channels: Channel[];
};

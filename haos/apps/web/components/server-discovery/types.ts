// Matrix room directory types based on the Matrix specification
export interface PublicRoom {
  room_id: string
  name?: string
  topic?: string
  canonical_alias?: string
  avatar_url?: string
  num_joined_members: number
  world_readable: boolean
  guest_can_join: boolean
  join_rule?: 'public' | 'knock' | 'invite' | 'private'
  room_type?: string
}

export interface PublicRoomsResponse {
  chunk: PublicRoom[]
  next_token?: string
  prev_token?: string
  total_room_count_estimate?: number
}

export interface RoomDirectoryFilter {
  generic_search_term?: string
  room_types?: string[]
}

export interface ServerCategory {
  id: string
  name: string
  description: string
  keywords: string[]
  icon?: string
}

export interface JoinRoomOptions {
  via?: string[]
  reason?: string
  third_party_signed?: any
}
'use client'

import { useState } from 'react'
import { UsersIcon, HashIcon, LockIcon, GlobeIcon } from 'lucide-react'
import type { PublicRoom } from './types'

interface ServerListProps {
  rooms: PublicRoom[]
  loading: boolean
  selectedServer: PublicRoom | null
  onServerSelect: (server: PublicRoom) => void
}

export function ServerList({ rooms, loading, selectedServer, onServerSelect }: ServerListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading servers...</p>
        </div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <GlobeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No servers found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 space-y-1">
        {rooms.map((room) => (
          <ServerListItem
            key={room.room_id}
            room={room}
            isSelected={selectedServer?.room_id === room.room_id}
            onSelect={() => onServerSelect(room)}
          />
        ))}
      </div>
    </div>
  )
}

interface ServerListItemProps {
  room: PublicRoom
  isSelected: boolean
  onSelect: () => void
}

function ServerListItem({ room, isSelected, onSelect }: ServerListItemProps) {
  const formatMemberCount = (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${Math.floor(count / 100) / 10}k`
    return `${Math.floor(count / 100000) / 10}M`
  }

  const getDisplayName = (): string => {
    return room.name || room.canonical_alias || room.room_id
  }

  const getJoinIcon = () => {
    if (room.join_rule === 'invite') {
      return <LockIcon className="w-3 h-3 text-discord-red" title="Invite only" />
    }
    if (room.world_readable) {
      return <GlobeIcon className="w-3 h-3 text-discord-green" title="World readable" />
    }
    return <HashIcon className="w-3 h-3 text-gray-400" />
  }

  return (
    <div
      onClick={onSelect}
      className={`
        p-3 rounded-lg cursor-pointer transition-colors border
        ${isSelected 
          ? 'bg-primary-500/20 border-primary-500/30' 
          : 'hover:bg-discord-light border-transparent'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Server Avatar */}
        <div className="w-12 h-12 bg-discord-light rounded-lg flex items-center justify-center flex-shrink-0">
          {room.avatar_url ? (
            <img
              src={room.avatar_url}
              alt={getDisplayName()}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <HashIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Server Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-white truncate">
              {getDisplayName()}
            </h3>
            {getJoinIcon()}
          </div>
          
          {room.canonical_alias && room.canonical_alias !== room.name && (
            <p className="text-xs text-gray-400 truncate mb-1">
              {room.canonical_alias}
            </p>
          )}
          
          {room.topic && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">
              {room.topic}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <UsersIcon className="w-3 h-3" />
              <span>{formatMemberCount(room.num_joined_members)} members</span>
            </div>
            
            {room.guest_can_join && (
              <span className="text-discord-green">Guest friendly</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add line-clamp utility class to globals.css if not already present
export {}
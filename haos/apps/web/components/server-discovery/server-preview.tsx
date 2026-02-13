'use client'

import { useState } from 'react'
import { 
  UsersIcon, 
  HashIcon, 
  LockIcon, 
  GlobeIcon, 
  ShieldIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon 
} from 'lucide-react'
import type { PublicRoom } from './types'

interface ServerPreviewProps {
  server: PublicRoom | null
  onJoin: (server: PublicRoom) => void
}

export function ServerPreview({ server, onJoin }: ServerPreviewProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!server) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <HashIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Select a server</h3>
          <p className="text-gray-400">Choose a server to see more details and join</p>
        </div>
      </div>
    )
  }

  const formatMemberCount = (count: number): string => {
    return count.toLocaleString()
  }

  const getDisplayName = (): string => {
    return server.name || server.canonical_alias || server.room_id
  }

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await onJoin(server)
    } catch (error) {
      console.error('Failed to join server:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(server.room_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy room ID:', error)
    }
  }

  const getJoinButtonText = () => {
    if (isJoining) return 'Joining...'
    if (server.join_rule === 'invite') return 'Request Invite'
    return 'Join Server'
  }

  const canJoin = server.join_rule !== 'private'

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Server Header */}
      <div className="mb-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-discord-light rounded-xl flex items-center justify-center flex-shrink-0">
            {server.avatar_url ? (
              <img
                src={server.avatar_url}
                alt={getDisplayName()}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <HashIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {getDisplayName()}
            </h2>
            
            {server.canonical_alias && server.canonical_alias !== server.name && (
              <p className="text-sm text-gray-400 mb-2">
                {server.canonical_alias}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <UsersIcon className="w-4 h-4" />
                <span>{formatMemberCount(server.num_joined_members)} members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Server Description */}
        {server.topic && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">About</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {server.topic}
            </p>
          </div>
        )}
      </div>

      {/* Server Details */}
      <div className="space-y-4 mb-6 flex-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Server Details</h3>
          
          <div className="space-y-3">
            {/* Join Rules */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {server.join_rule === 'invite' ? (
                  <LockIcon className="w-4 h-4 text-discord-red" />
                ) : (
                  <HashIcon className="w-4 h-4 text-discord-green" />
                )}
                <span className="text-sm text-gray-300">Access</span>
              </div>
              <span className="text-sm text-gray-400 capitalize">
                {server.join_rule === 'invite' ? 'Invite Only' : 'Open'}
              </span>
            </div>

            {/* World Readable */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GlobeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Visibility</span>
              </div>
              <span className="text-sm text-gray-400">
                {server.world_readable ? 'Public' : 'Members Only'}
              </span>
            </div>

            {/* Guest Access */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Guest Access</span>
              </div>
              <span className="text-sm text-gray-400">
                {server.guest_can_join ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>

            {/* Room ID */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Room ID</span>
              <div className="flex items-center space-x-1">
                <code className="text-xs text-gray-400 bg-discord-darker px-2 py-1 rounded">
                  {server.room_id}
                </code>
                <button
                  onClick={copyRoomId}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy Room ID"
                >
                  {copied ? (
                    <CheckIcon className="w-3 h-3 text-discord-green" />
                  ) : (
                    <CopyIcon className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix.to Link */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-2">External Links</h3>
          <a
            href={`https://matrix.to/#/${server.canonical_alias || server.room_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <ExternalLinkIcon className="w-4 h-4" />
            <span>Open in Matrix.to</span>
          </a>
        </div>
      </div>

      {/* Join Button */}
      <div className="pt-4 border-t border-gray-700">
        {canJoin ? (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full discord-button flex items-center justify-center space-x-2"
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Joining...</span>
              </>
            ) : (
              <>
                <HashIcon className="w-4 h-4" />
                <span>{getJoinButtonText()}</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-center p-3 bg-discord-darker rounded-lg border border-gray-600">
            <p className="text-sm text-gray-400">This server is private and cannot be joined directly</p>
          </div>
        )}
        
        <p className="text-xs text-gray-500 text-center mt-2">
          By joining, you agree to this server's rules and Matrix's Terms of Service
        </p>
      </div>
    </div>
  )
}
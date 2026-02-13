'use client'

import { useState, useEffect } from 'react'
import { ServerIcon, HashIcon, UsersIcon, ExternalLinkIcon } from 'lucide-react'

interface JoinChannelStepProps {
  onValidChange: (isValid: boolean) => void
}

const FEATURED_SERVERS = [
  {
    id: 'matrix-hq',
    name: 'Matrix HQ',
    alias: '#matrix:matrix.org',
    description: 'The official Matrix community space',
    members: 15000,
    avatar: null,
    category: 'Official'
  },
  {
    id: 'element-community',
    name: 'Element Community',
    alias: '#element-community:matrix.org',
    description: 'Community discussions about Element',
    members: 8500,
    avatar: null,
    category: 'Community'
  },
  {
    id: 'matrix-dev',
    name: 'Matrix Developers',
    alias: '#matrix-dev:matrix.org',
    description: 'Technical discussions about Matrix development',
    members: 3200,
    avatar: null,
    category: 'Development'
  },
  {
    id: 'synapse',
    name: 'Synapse',
    alias: '#synapse:matrix.org',
    description: 'Support and discussion for Synapse homeserver',
    members: 2100,
    avatar: null,
    category: 'Support'
  }
]

export function JoinChannelStep({ onValidChange }: JoinChannelStepProps) {
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  const [customServer, setCustomServer] = useState('')

  useEffect(() => {
    // This step is optional, so it's always valid
    onValidChange(true)
  }, [onValidChange])

  const toggleServer = (serverId: string) => {
    setSelectedServers(prev =>
      prev.includes(serverId)
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    )
  }

  const formatMemberCount = (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${Math.floor(count / 100) / 10}k`
    return `${Math.floor(count / 100000) / 10}M`
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Join Communities</h2>
        <p className="text-gray-400">
          Discover and join Matrix communities to get started. You can always find more later!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Servers */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Featured Communities</h3>
          <div className="space-y-3">
            {FEATURED_SERVERS.map((server) => (
              <div
                key={server.id}
                onClick={() => toggleServer(server.id)}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-colors
                  ${selectedServers.includes(server.id)
                    ? 'bg-primary-500/20 border-primary-500/30'
                    : 'bg-discord-darker border-gray-600 hover:border-gray-500'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-discord-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <HashIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-white">{server.name}</h4>
                      <span className="text-xs bg-discord-light text-gray-300 px-2 py-0.5 rounded">
                        {server.category}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2">{server.alias}</p>
                    
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {server.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>{formatMemberCount(server.members)} members</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedServers.includes(server.id) && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Server and Actions */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Join Custom Server</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={customServer}
                onChange={(e) => setCustomServer(e.target.value)}
                placeholder="#community:example.org"
                className="discord-input w-full"
              />
              <button
                disabled={!customServer.trim()}
                className="discord-button-secondary w-full"
              >
                Join Custom Server
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter a Matrix room alias or ID to join any public space
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Server Discovery</h3>
            <div className="bg-discord-darker border border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <ServerIcon className="w-8 h-8 text-primary-400" />
                <div>
                  <h4 className="font-medium text-white">Browse More Communities</h4>
                  <p className="text-sm text-gray-400">Discover thousands of public Matrix spaces</p>
                </div>
              </div>
              
              <button className="discord-button w-full flex items-center justify-center space-x-2">
                <ExternalLinkIcon className="w-4 h-4" />
                <span>Open Server Discovery</span>
              </button>
            </div>
          </div>

          {selectedServers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Selected Communities</h3>
              <div className="bg-discord-darker border border-gray-700 rounded-lg p-4">
                <div className="space-y-2">
                  {selectedServers.map(serverId => {
                    const server = FEATURED_SERVERS.find(s => s.id === serverId)
                    return server ? (
                      <div key={serverId} className="flex items-center space-x-2 text-sm">
                        <HashIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-white">{server.name}</span>
                      </div>
                    ) : null
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  These communities will be added to your sidebar when you complete setup
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
        <p className="text-primary-300 text-sm">
          <strong>Pro tip:</strong> You can always discover more communities later using the server 
          discovery feature. Start with a few that interest you and explore more as you get familiar with Matrix!
        </p>
      </div>
    </div>
  )
}
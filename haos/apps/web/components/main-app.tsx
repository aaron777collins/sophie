'use client'

import { useState } from 'react'
import { ServerDiscoveryModal } from './server-discovery/server-discovery-modal'

export function MainApp() {
  const [showServerDiscovery, setShowServerDiscovery] = useState(false)

  return (
    <div className="min-h-screen bg-discord-dark flex">
      {/* Temporary placeholder main app */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">HAOS v2</h1>
          <p className="text-gray-400 mb-6">Discord-style Matrix client</p>
          <button
            onClick={() => setShowServerDiscovery(true)}
            className="discord-button"
          >
            Discover Servers
          </button>
        </div>
      </div>

      <ServerDiscoveryModal
        open={showServerDiscovery}
        onOpenChange={setShowServerDiscovery}
      />
    </div>
  )
}
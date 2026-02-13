'use client'

import { useState, useEffect } from 'react'
import { useFirstRun } from '../first-run-provider'

interface CreateAccountStepProps {
  onValidChange: (isValid: boolean) => void
}

export function CreateAccountStep({ onValidChange }: CreateAccountStepProps) {
  const { setUserData } = useFirstRun()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [homeserver, setHomeserver] = useState('matrix.org')

  useEffect(() => {
    const isValid = username.length >= 3 && displayName.length >= 1 && homeserver.length >= 3
    onValidChange(isValid)
    
    if (isValid) {
      setUserData({
        username,
        displayName,
      })
    }
  }, [username, displayName, homeserver, onValidChange, setUserData])

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-gray-400">
          Set up your Matrix account to start using HAOS. You can use an existing homeserver or choose matrix.org.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Homeserver
          </label>
          <input
            type="text"
            value={homeserver}
            onChange={(e) => setHomeserver(e.target.value)}
            placeholder="matrix.org"
            className="discord-input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your homeserver (e.g., matrix.org, your-server.com)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="discord-input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Matrix username (minimum 3 characters)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="discord-input w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            How others will see your name in conversations
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
        <p className="text-primary-300 text-sm">
          <strong>Note:</strong> This is a demo step. In the full implementation, you would either 
          login with existing credentials or register a new account with your chosen homeserver.
        </p>
      </div>
    </div>
  )
}
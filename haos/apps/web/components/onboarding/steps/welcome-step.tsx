'use client'

import { useEffect } from 'react'

interface WelcomeStepProps {
  onValidChange: (isValid: boolean) => void
}

export function WelcomeStep({ onValidChange }: WelcomeStepProps) {
  useEffect(() => {
    // Welcome step is always valid (no input required)
    onValidChange(true)
  }, [onValidChange])

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Welcome to HAOS v2
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          HAOS is a Discord-style Matrix client that brings the familiar Discord experience 
          to the decentralized Matrix protocol. Get started by setting up your account and 
          discovering Matrix servers and spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-discord-darker p-6 rounded-lg border border-gray-700">
          <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Decentralized</h3>
          <p className="text-gray-400">
            Your data stays with you. Choose your homeserver or run your own.
          </p>
        </div>

        <div className="bg-discord-darker p-6 rounded-lg border border-gray-700">
          <div className="w-12 h-12 bg-discord-green rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🌍</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Open Source</h3>
          <p className="text-gray-400">
            Built on open protocols and standards. No vendor lock-in.
          </p>
        </div>

        <div className="bg-discord-darker p-6 rounded-lg border border-gray-700">
          <div className="w-12 h-12 bg-discord-accent rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Familiar Experience</h3>
          <p className="text-gray-400">
            Discord-like UI and features you already know and love.
          </p>
        </div>

        <div className="bg-discord-darker p-6 rounded-lg border border-gray-700">
          <div className="w-12 h-12 bg-discord-yellow rounded-lg flex items-center justify-center mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Modern Features</h3>
          <p className="text-gray-400">
            End-to-end encryption, file sharing, voice chat, and more.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
        <p className="text-primary-300 text-sm">
          <strong>Getting Started:</strong> In the next steps, we'll help you create an account, 
          set up your server, and join your first channels. This should only take a few minutes!
        </p>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useFirstRun } from '../first-run-provider'
import { ServerIcon, UsersIcon, HashIcon } from 'lucide-react'

interface CreateServerStepProps {
  onValidChange: (isValid: boolean) => void
}

const SERVER_TEMPLATES = [
  {
    id: 'gaming',
    name: 'Gaming Community',
    description: 'Perfect for gaming groups and clans',
    channels: [
      { name: 'general', type: 'text' as const },
      { name: 'gaming-chat', type: 'text' as const },
      { name: 'voice-chat', type: 'voice' as const },
      { name: 'announcements', type: 'text' as const },
    ]
  },
  {
    id: 'study',
    name: 'Study Group',
    description: 'Organized spaces for learning and collaboration',
    channels: [
      { name: 'general', type: 'text' as const },
      { name: 'homework-help', type: 'text' as const },
      { name: 'study-sessions', type: 'voice' as const },
      { name: 'resources', type: 'text' as const },
    ]
  },
  {
    id: 'creative',
    name: 'Creative Project',
    description: 'For artists, writers, and creators',
    channels: [
      { name: 'general', type: 'text' as const },
      { name: 'showcase', type: 'text' as const },
      { name: 'feedback', type: 'text' as const },
      { name: 'creative-voice', type: 'voice' as const },
    ]
  },
  {
    id: 'custom',
    name: 'Custom Server',
    description: 'Start with basic channels and customize later',
    channels: [
      { name: 'general', type: 'text' as const },
      { name: 'random', type: 'text' as const },
      { name: 'voice-chat', type: 'voice' as const },
    ]
  }
]

export function CreateServerStep({ onValidChange }: CreateServerStepProps) {
  const { setServerData } = useFirstRun()
  const [serverName, setServerName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  useEffect(() => {
    const isValid = serverName.length >= 2 && selectedTemplate.length > 0
    onValidChange(isValid)
    
    if (isValid) {
      const template = SERVER_TEMPLATES.find(t => t.id === selectedTemplate)
      setServerData({
        name: serverName,
        template: selectedTemplate,
        channels: template?.channels || []
      })
    }
  }, [serverName, selectedTemplate, onValidChange, setServerData])

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Server</h2>
        <p className="text-gray-400">
          Set up your Matrix space with channels organized for your community's needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Server Details */}
        <div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server Name
            </label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="My Awesome Server"
              className="discord-input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a name for your Matrix space
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Server Template
            </label>
            <div className="space-y-3">
              {SERVER_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-colors
                    ${selectedTemplate === template.id
                      ? 'bg-primary-500/20 border-primary-500/30'
                      : 'bg-discord-darker border-gray-600 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-discord-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ServerIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.channels.map((channel, index) => (
                          <span
                            key={index}
                            className="text-xs bg-discord-light px-2 py-1 rounded flex items-center space-x-1"
                          >
                            {channel.type === 'text' ? (
                              <HashIcon className="w-3 h-3" />
                            ) : (
                              <UsersIcon className="w-3 h-3" />
                            )}
                            <span className="text-gray-300">{channel.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Server Preview</h3>
          <div className="bg-discord-darker border border-gray-700 rounded-lg p-6">
            {serverName && selectedTemplate ? (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <ServerIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{serverName}</h4>
                    <p className="text-sm text-gray-400">
                      {SERVER_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-3">Channels</h5>
                  <div className="space-y-2">
                    {SERVER_TEMPLATES.find(t => t.id === selectedTemplate)?.channels.map((channel, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {channel.type === 'text' ? (
                          <HashIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <UsersIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-gray-300">{channel.name}</span>
                        <span className="text-xs text-gray-500 capitalize">({channel.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <ServerIcon className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p>Enter a server name and select a template to see a preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
        <p className="text-primary-300 text-sm">
          <strong>Note:</strong> This step creates a Matrix space and rooms. You can always add, remove, 
          or reorganize channels later through the server settings.
        </p>
      </div>
    </div>
  )
}
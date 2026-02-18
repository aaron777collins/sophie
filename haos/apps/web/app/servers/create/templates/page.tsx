'use client'

import { useState } from 'react'
import { ArrowLeftIcon, ServerIcon, UsersIcon, GlobeIcon, LockIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const serverTemplates = [
  {
    id: 'gaming',
    name: 'Gaming Community',
    description: 'Perfect for gaming groups with voice channels and game-specific text channels',
    icon: '🎮',
    channels: [
      { name: 'announcements', type: 'text' },
      { name: 'general', type: 'text' },
      { name: 'looking-for-group', type: 'text' },
      { name: 'General Voice', type: 'voice' },
      { name: 'Game Room 1', type: 'voice' },
      { name: 'Game Room 2', type: 'voice' },
    ]
  },
  {
    id: 'study',
    name: 'Study Group',
    description: 'Organized spaces for collaborative learning and study sessions',
    icon: '📚',
    channels: [
      { name: 'announcements', type: 'text' },
      { name: 'general', type: 'text' },
      { name: 'homework-help', type: 'text' },
      { name: 'resources', type: 'text' },
      { name: 'Study Hall', type: 'voice' },
      { name: 'Group Study', type: 'voice' },
    ]
  },
  {
    id: 'creative',
    name: 'Creative Community',
    description: 'For artists, writers, and creators to share work and collaborate',
    icon: '🎨',
    channels: [
      { name: 'announcements', type: 'text' },
      { name: 'general', type: 'text' },
      { name: 'showcase', type: 'text' },
      { name: 'feedback', type: 'text' },
      { name: 'Creative Lounge', type: 'voice' },
      { name: 'Collaboration', type: 'voice' },
    ]
  },
  {
    id: 'blank',
    name: 'Blank Server',
    description: 'Start from scratch with just the basics',
    icon: '📝',
    channels: [
      { name: 'general', type: 'text' },
      { name: 'General', type: 'voice' },
    ]
  }
]

export default function ServerTemplatesPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleCreateServer = (templateId: string) => {
    console.log('Creating server with template:', templateId)
    // This would integrate with the actual server creation logic
    // For now, redirect back to main app
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <ServerIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Choose a Template</h1>
              <p className="text-gray-400">
                Start your server with pre-configured channels
              </p>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serverTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-discord-light border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-primary-500 ${
                selectedTemplate === template.id 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-gray-600'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Template Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-2xl">
                  {template.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </div>
              </div>

              {/* Channel Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                  Includes:
                </h4>
                <div className="space-y-1">
                  {template.channels.map((channel, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                      {channel.type === 'text' ? (
                        <span className="text-gray-500">#</span>
                      ) : (
                        <span className="text-gray-500">🔊</span>
                      )}
                      <span>{channel.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCreateServer(template.id)
                }}
                className="w-full mt-6 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
              >
                Use This Template
              </button>
            </div>
          ))}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="mt-8 bg-discord-light border border-gray-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Ready to create your {serverTemplates.find(t => t.id === selectedTemplate)?.name}?
              </h3>
              <button
                onClick={() => handleCreateServer(selectedTemplate)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors"
              >
                Create Server
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
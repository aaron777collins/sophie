'use client'

import { useState } from 'react'
import { useFirstRun } from './first-run-provider'

export interface ServerTemplate {
  id: string
  name: string
  description: string
  icon: string
  channels: Array<{ name: string; type: 'text' | 'voice' }>
  color: string
}

const SERVER_TEMPLATES: ServerTemplate[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Perfect for gaming communities with voice channels',
    icon: '🎮',
    color: 'from-purple-500 to-pink-500',
    channels: [
      { name: 'general', type: 'text' },
      { name: 'announcements', type: 'text' },
      { name: 'memes', type: 'text' },
      { name: 'General Voice', type: 'voice' },
      { name: 'Gaming', type: 'voice' },
      { name: 'AFK', type: 'voice' },
    ]
  },
  {
    id: 'study',
    name: 'Study Group',
    description: 'Organized channels for studying and collaboration',
    icon: '📚',
    color: 'from-blue-500 to-cyan-500',
    channels: [
      { name: 'general', type: 'text' },
      { name: 'homework-help', type: 'text' },
      { name: 'resources', type: 'text' },
      { name: 'announcements', type: 'text' },
      { name: 'Study Session', type: 'voice' },
      { name: 'Study Hall', type: 'voice' },
    ]
  },
  {
    id: 'friends',
    name: 'Friends',
    description: 'Casual hangout space for friends',
    icon: '👥',
    color: 'from-green-500 to-teal-500',
    channels: [
      { name: 'general', type: 'text' },
      { name: 'random', type: 'text' },
      { name: 'photos', type: 'text' },
      { name: 'Hangout', type: 'voice' },
      { name: 'Music', type: 'voice' },
    ]
  },
  {
    id: 'work',
    name: 'Work',
    description: 'Professional workspace for teams',
    icon: '💼',
    color: 'from-orange-500 to-red-500',
    channels: [
      { name: 'general', type: 'text' },
      { name: 'announcements', type: 'text' },
      { name: 'project-updates', type: 'text' },
      { name: 'resources', type: 'text' },
      { name: 'Meeting Room', type: 'voice' },
      { name: 'Daily Standup', type: 'voice' },
    ]
  },
]

interface ServerTemplatesProps {
  onTemplateSelect: (template: ServerTemplate) => void
  selectedTemplate?: string
}

export function ServerTemplates({ onTemplateSelect, selectedTemplate }: ServerTemplatesProps) {
  const { setServerData } = useFirstRun()

  const handleTemplateSelect = (template: ServerTemplate) => {
    setServerData({
      template: template.id,
      channels: template.channels
    })
    onTemplateSelect(template)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Choose a template</h3>
        <p className="text-gray-400">We'll set up your server with the right channels for your community</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVER_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 text-left
              ${selectedTemplate === template.id 
                ? 'border-primary-500 bg-primary-500/10' 
                : 'border-gray-600 hover:border-gray-500 bg-discord-darker hover:bg-discord-light'
              }
            `}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
              <span className="text-2xl">{template.icon}</span>
            </div>
            
            <h4 className="text-xl font-semibold text-white mb-2">{template.name}</h4>
            <p className="text-gray-400 mb-4">{template.description}</p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">Includes:</p>
              <div className="flex flex-wrap gap-2">
                {template.channels.slice(0, 4).map((channel, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300"
                  >
                    {channel.type === 'voice' ? '🔊' : '#'} {channel.name}
                  </span>
                ))}
                {template.channels.length > 4 && (
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                    +{template.channels.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-discord-darker rounded-lg border border-gray-600">
        <p className="text-sm text-gray-400">
          💡 Don't worry - you can always customize these channels later or create additional ones!
        </p>
      </div>
    </div>
  )
}

export { SERVER_TEMPLATES }
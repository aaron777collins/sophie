'use client'

import { useState } from 'react'
import { ArrowLeftIcon, BookIcon, SearchIcon, ExternalLinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using HAOS',
    items: [
      { title: 'Welcome to HAOS', path: '#welcome' },
      { title: 'Creating Your First Server', path: '#create-server' },
      { title: 'Joining Existing Servers', path: '#join-server' },
      { title: 'Understanding Matrix', path: '#matrix-intro' },
    ]
  },
  {
    id: 'messaging',
    title: 'Messaging & Chat',
    description: 'How to communicate effectively',
    items: [
      { title: 'Sending Messages', path: '#send-messages' },
      { title: 'Formatting Text', path: '#text-formatting' },
      { title: 'File Attachments', path: '#attachments' },
      { title: 'Emoji & Reactions', path: '#emoji' },
      { title: 'Thread Conversations', path: '#threads' },
    ]
  },
  {
    id: 'voice-video',
    title: 'Voice & Video',
    description: 'Audio and video communication',
    items: [
      { title: 'Joining Voice Channels', path: '#voice-channels' },
      { title: 'Video Calls', path: '#video-calls' },
      { title: 'Screen Sharing', path: '#screen-share' },
      { title: 'Voice Settings', path: '#voice-settings' },
    ]
  },
  {
    id: 'server-management',
    title: 'Server Management',
    description: 'Managing your servers and communities',
    items: [
      { title: 'Server Settings', path: '#server-settings' },
      { title: 'Channel Management', path: '#channel-management' },
      { title: 'User Roles & Permissions', path: '#roles' },
      { title: 'Moderation Tools', path: '#moderation' },
      { title: 'Server Templates', path: '#templates' },
    ]
  },
  {
    id: 'privacy-security',
    title: 'Privacy & Security',
    description: 'Keep your account and data safe',
    items: [
      { title: 'Account Security', path: '#account-security' },
      { title: 'Two-Factor Authentication', path: '#2fa' },
      { title: 'Privacy Settings', path: '#privacy' },
      { title: 'Encryption & E2E', path: '#encryption' },
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced Features',
    description: 'Power user features and customization',
    items: [
      { title: 'Keyboard Shortcuts', path: '#shortcuts' },
      { title: 'API Integration', path: '#api' },
      { title: 'Custom Themes', path: '#themes' },
      { title: 'Matrix Bridges', path: '#bridges' },
    ]
  },
]

export default function DocsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.items.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="max-w-7xl mx-auto p-6">
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
              <BookIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Documentation</h1>
              <p className="text-gray-400">
                Learn how to use HAOS features and get the most out of your experience
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full bg-discord-light border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-discord-light rounded-lg p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contents</h3>
              <div className="space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedSection === section.id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-discord-light rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                      <p className="text-gray-400">{section.description}</p>
                    </div>
                  </div>

                  {/* Section Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-discord-darker p-4 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{item.title}</h4>
                          <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          Learn about {item.title.toLowerCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* API Documentation Link */}
            <div className="mt-8 bg-discord-light border-l-4 border-primary-500 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <BookIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">API Documentation</h3>
                  <p className="text-gray-400 mb-4">
                    Looking for technical documentation? Check out our comprehensive API documentation 
                    for developers and advanced users.
                  </p>
                  <a
                    href="/api/docs"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
                  >
                    View API Docs
                    <ExternalLinkIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
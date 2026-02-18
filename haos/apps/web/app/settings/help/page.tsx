'use client'

import { useState } from 'react'
import { ArrowLeftIcon, HelpCircleIcon, SearchIcon, ExternalLinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const faqItems = [
  {
    id: 1,
    question: 'How do I join a voice channel?',
    answer: 'Click on any voice channel in the sidebar to join. You can see who\'s currently in each channel and their participant count.',
  },
  {
    id: 2,
    question: 'What is Matrix and how does it work with HAOS?',
    answer: 'Matrix is an open protocol for decentralized communication. HAOS uses Matrix as its backend, allowing you to communicate with users across different Matrix servers.',
  },
  {
    id: 3,
    question: 'Can I use my existing Matrix account?',
    answer: 'Yes! HAOS is compatible with any Matrix account. Simply log in with your existing Matrix credentials.',
  },
  {
    id: 4,
    question: 'How do I enable two-factor authentication?',
    answer: 'Go to Settings > Account > Security and click "Enable 2FA". Follow the setup wizard to secure your account.',
  },
  {
    id: 5,
    question: 'Why can\'t I see some messages in encrypted rooms?',
    answer: 'End-to-end encrypted messages may not be visible if your device hasn\'t been verified or if encryption keys are missing. Try verifying your session in Settings.',
  },
]

export default function HelpSettingsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <HelpCircleIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Help & Support</h1>
              <p className="text-gray-400">Get help with HAOS features and troubleshooting</p>
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
              placeholder="Search help topics..."
              className="w-full bg-discord-light border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* FAQ Section */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {filteredFaq.map((item) => (
                <div key={item.id} className="border border-gray-600 rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                    className="w-full text-left p-4 hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="text-white font-medium">{item.question}</h4>
                  </button>
                  {expandedFaq === item.id && (
                    <div className="px-4 pb-4 border-t border-gray-600">
                      <p className="text-gray-300 mt-2">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-discord-light rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Getting Started</h3>
              <div className="space-y-3">
                <a href="/docs" className="block text-primary-400 hover:text-primary-300 text-sm">
                  → Complete Documentation
                </a>
                <a href="/servers/discover" className="block text-primary-400 hover:text-primary-300 text-sm">
                  → Discover Public Servers
                </a>
                <a href="/settings/profile" className="block text-primary-400 hover:text-primary-300 text-sm">
                  → Set Up Your Profile
                </a>
                <a href="/settings/voice" className="block text-primary-400 hover:text-primary-300 text-sm">
                  → Configure Voice Settings
                </a>
              </div>
            </div>

            <div className="bg-discord-light rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Troubleshooting</h3>
              <div className="space-y-3">
                <button className="block text-left text-primary-400 hover:text-primary-300 text-sm">
                  → Audio/Video Issues
                </button>
                <button className="block text-left text-primary-400 hover:text-primary-300 text-sm">
                  → Connection Problems
                </button>
                <button className="block text-left text-primary-400 hover:text-primary-300 text-sm">
                  → Encryption Issues
                </button>
                <button className="block text-left text-primary-400 hover:text-primary-300 text-sm">
                  → Performance Tips
                </button>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Support</h3>
            <p className="text-gray-400 mb-6">
              Can't find what you're looking for? Get in touch with our support team.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors">
                Send Message
              </button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors flex items-center gap-2">
                Community Forum
                <ExternalLinkIcon className="w-4 h-4" />
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors">
                Report Bug
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  <span className="text-white">HAOS Version:</span> 2.0.0-beta
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white">Matrix Client:</span> matrix-js-sdk v25.0.0
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white">Browser:</span> Chrome 120.0.0
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">
                  <span className="text-white">Platform:</span> Web (Ubuntu Linux)
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white">Server:</span> matrix.org
                </p>
                <p className="text-gray-400 text-sm">
                  <span className="text-white">Last Updated:</span> Today
                </p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors">
              Copy Debug Info
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
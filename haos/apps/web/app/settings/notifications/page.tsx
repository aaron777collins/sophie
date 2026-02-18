'use client'

import { useState } from 'react'
import { ArrowLeftIcon, BellIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotificationSettingsPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    mentions: true,
    directMessages: true,
    newMessages: false,
    friendRequests: true,
    serverInvites: true,
    voiceChannelActivity: false,
    pushNotifications: true,
    soundEnabled: true,
    desktopNotifications: true,
  })

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    console.log('Saving notification settings:', settings)
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
              <BellIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Notification Settings</h1>
              <p className="text-gray-400">
                Control when and how you receive notifications
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-discord-light rounded-lg p-6">
          <div className="space-y-8">
            {/* Message Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Message Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Mentions</h4>
                    <p className="text-gray-400 text-sm">When someone mentions you</p>
                  </div>
                  <button
                    onClick={() => handleToggle('mentions')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.mentions ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.mentions ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Direct Messages</h4>
                    <p className="text-gray-400 text-sm">Personal messages from other users</p>
                  </div>
                  <button
                    onClick={() => handleToggle('directMessages')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.directMessages ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.directMessages ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">New Messages</h4>
                    <p className="text-gray-400 text-sm">All new messages in channels</p>
                  </div>
                  <button
                    onClick={() => handleToggle('newMessages')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.newMessages ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.newMessages ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Social Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Social Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Friend Requests</h4>
                    <p className="text-gray-400 text-sm">When someone sends you a friend request</p>
                  </div>
                  <button
                    onClick={() => handleToggle('friendRequests')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.friendRequests ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.friendRequests ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Server Invites</h4>
                    <p className="text-gray-400 text-sm">When you receive invitations to join servers</p>
                  </div>
                  <button
                    onClick={() => handleToggle('serverInvites')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.serverInvites ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.serverInvites ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Delivery Options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Push Notifications</h4>
                    <p className="text-gray-400 text-sm">Send notifications to your device</p>
                  </div>
                  <button
                    onClick={() => handleToggle('pushNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.pushNotifications ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Sound Notifications</h4>
                    <p className="text-gray-400 text-sm">Play sound when receiving notifications</p>
                  </div>
                  <button
                    onClick={() => handleToggle('soundEnabled')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Desktop Notifications</h4>
                    <p className="text-gray-400 text-sm">Show notifications on your desktop</p>
                  </div>
                  <button
                    onClick={() => handleToggle('desktopNotifications')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.desktopNotifications ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.desktopNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-600">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
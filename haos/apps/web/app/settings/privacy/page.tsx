'use client'

import { useState } from 'react'
import { ArrowLeftIcon, ShieldIcon, EyeOffIcon, LockIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacySettingsPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    allowDirectMessages: 'friends',
    showOnlineStatus: true,
    showLastSeen: false,
    allowFriendRequests: true,
    shareReadReceipts: true,
    shareTypingStatus: true,
    allowDataCollection: false,
    allowPersonalization: true,
  })

  const handleSave = () => {
    console.log('Saving privacy settings:', settings)
  }

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
              <ShieldIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Settings</h1>
              <p className="text-gray-400">Control who can see your information and contact you</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Contact Preferences */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Contact & Communication</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Who can send you direct messages?
                </label>
                <select
                  value={settings.allowDirectMessages}
                  onChange={(e) => setSettings({...settings, allowDirectMessages: e.target.value})}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="everyone">Everyone</option>
                  <option value="friends">Friends only</option>
                  <option value="none">No one</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Allow friend requests</h4>
                  <p className="text-gray-400 text-sm">Let people send you friend requests</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allowFriendRequests: !settings.allowFriendRequests})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowFriendRequests ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowFriendRequests ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <EyeOffIcon className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Visibility</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Show online status</h4>
                  <p className="text-gray-400 text-sm">Let others see when you're online</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, showOnlineStatus: !settings.showOnlineStatus})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showOnlineStatus ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Show last seen</h4>
                  <p className="text-gray-400 text-sm">Display when you were last active</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, showLastSeen: !settings.showLastSeen})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showLastSeen ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showLastSeen ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Message Privacy */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Message Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Send read receipts</h4>
                  <p className="text-gray-400 text-sm">Let others know when you've read their messages</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, shareReadReceipts: !settings.shareReadReceipts})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.shareReadReceipts ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.shareReadReceipts ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Show typing indicator</h4>
                  <p className="text-gray-400 text-sm">Let others see when you're typing</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, shareTypingStatus: !settings.shareTypingStatus})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.shareTypingStatus ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.shareTypingStatus ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data & Analytics */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <LockIcon className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Data & Analytics</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Allow data collection</h4>
                  <p className="text-gray-400 text-sm">Help improve HAOS by sharing usage analytics</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allowDataCollection: !settings.allowDataCollection})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowDataCollection ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowDataCollection ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Personalization</h4>
                  <p className="text-gray-400 text-sm">Use your data to personalize your experience</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, allowPersonalization: !settings.allowPersonalization})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowPersonalization ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowPersonalization ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-discord-light border-l-4 border-yellow-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
            <p className="text-gray-400 mb-4">
              Manage your personal data and account information.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors">
                Download My Data
              </button>
              <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded transition-colors">
                Request Data Deletion
              </button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors">
                View Privacy Policy
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
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
  )
}
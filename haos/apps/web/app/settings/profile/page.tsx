'use client'

import { useState } from 'react'
import { ArrowLeftIcon, UserIcon, CameraIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMatrixUserStore } from '../../../lib/matrix-user-context'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { userId, displayName, avatarUrl, setUser } = useMatrixUserStore()
  
  const [formData, setFormData] = useState({
    displayName: displayName || '',
    email: '',
    bio: '',
  })

  const handleSave = () => {
    console.log('Saving profile:', formData)
    setUser({
      userId: userId || '',
      displayName: formData.displayName,
      avatarUrl: avatarUrl
    })
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
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
              <p className="text-gray-400">
                Manage your public profile and account information
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-discord-light rounded-lg p-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-semibold">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <CameraIcon className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                <p className="text-gray-400 text-sm">Upload a new avatar for your profile</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Matrix ID
                </label>
                <input
                  type="text"
                  value={userId || ''}
                  disabled
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Your Matrix ID cannot be changed</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Tell others about yourself"
                  rows={4}
                />
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
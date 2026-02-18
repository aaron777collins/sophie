'use client'

import { useState } from 'react'
import { ArrowLeftIcon, UserIcon, KeyIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMatrixUserStore } from '../../../lib/matrix-user-context'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { userId, displayName } = useMatrixUserStore()
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleChangePassword = () => {
    console.log('Opening password change modal')
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      console.log('Deleting account')
      // This would handle account deletion
    }
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
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Account Settings</h1>
              <p className="text-gray-400">Manage your account security and information</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Account Info */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Matrix ID</h4>
                  <p className="text-gray-400 text-sm">{userId || 'Not logged in'}</p>
                </div>
                <span className="px-3 py-1 bg-gray-600 text-gray-300 text-sm rounded-full">
                  Cannot be changed
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Display Name</h4>
                  <p className="text-gray-400 text-sm">{displayName || 'No display name set'}</p>
                </div>
                <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded transition-colors">
                  Edit
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Account Created</h4>
                  <p className="text-gray-400 text-sm">January 15, 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <KeyIcon className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Password</h4>
                  <p className="text-gray-400 text-sm">Last changed 30 days ago</p>
                </div>
                <button 
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Active Sessions</h4>
                  <p className="text-gray-400 text-sm">Manage your logged-in devices</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                  Manage Sessions
                </button>
              </div>
            </div>
          </div>

          {/* Device Management */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Connected Devices</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Web Browser (Current)</h4>
                    <p className="text-gray-400 text-sm">Chrome on Ubuntu • Active now</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                  Current Session
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-discord-darker rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Mobile App</h4>
                    <p className="text-gray-400 text-sm">iPhone • Last active 2 hours ago</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="bg-discord-light border-l-4 border-blue-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Data Export</h3>
            <p className="text-gray-400 mb-4">
              Download a copy of your data including messages, settings, and account information.
            </p>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors">
              Request Data Export
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangleIcon className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Delete Account</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-red-300 text-sm mb-2">
                        Type "DELETE" to confirm account deletion:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full max-w-xs bg-discord-darker border border-red-500 rounded px-3 py-2 text-white focus:border-red-400 focus:outline-none"
                        placeholder="DELETE"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE'}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
                      >
                        Confirm Deletion
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
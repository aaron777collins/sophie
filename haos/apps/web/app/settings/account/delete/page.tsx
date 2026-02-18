'use client'

import { useState } from 'react'
import { ArrowLeftIcon, AlertTriangleIcon, TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmationText, setConfirmationText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleDeleteAccount = async () => {
    if (confirmationText.toLowerCase() !== 'delete my account') {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Simulate account deletion process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would make an API call to delete the account
      console.log('Account deletion initiated');
      
      // Redirect to goodbye page or login
      router.push('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="max-w-3xl mx-auto p-6">
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
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <TrashIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Delete Account</h1>
              <p className="text-gray-400">
                Permanently delete your HAOS account
              </p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangleIcon className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-2">Warning: This action is irreversible</h2>
              <p className="text-gray-300 mb-4">
                Deleting your account will permanently remove all your data, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 mb-4">
                <li>All your messages and chat history</li>
                <li>Server memberships and roles</li>
                <li>Friend connections</li>
                <li>Voice chat history</li>
                <li>Account settings and preferences</li>
                <li>Profile information and avatar</li>
              </ul>
              <p className="text-red-400 font-medium">
                This action cannot be undone. Your data will be permanently lost.
              </p>
            </div>
          </div>
        </div>

        {/* Data Export Reminder */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Before you delete your account</h3>
          <p className="text-gray-300 mb-4">
            Consider downloading a copy of your data first. You can export your data from the Data Export settings.
          </p>
          <button
            onClick={() => router.push('/settings/data-export')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
          >
            Export My Data
          </button>
        </div>

        {/* Deletion Form */}
        <div className="bg-discord-light rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Confirm Account Deletion</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Type "DELETE MY ACCOUNT" to confirm (case insensitive)
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full bg-discord-darker border border-gray-600 text-white rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none"
                disabled={isDeleting}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={confirmationText.toLowerCase() !== 'delete my account' || isDeleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
              >
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Final Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-discord-light rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-red-400" />
                <h3 className="text-xl font-semibold text-white">Final Confirmation</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Forever'}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
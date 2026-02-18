'use client'

import { useState } from 'react'
import { ArrowLeftIcon, EyeIcon, VolumeXIcon, MousePointerIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AccessibilitySettings() {
  const router = useRouter()
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [keyboardNavigation, setKeyboardNavigation] = useState(true)

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
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <EyeIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Accessibility</h1>
              <p className="text-gray-400">
                Make HAOS work better for your needs
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Visual Accessibility */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Visual Accessibility</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">High Contrast Mode</label>
                  <p className="text-gray-400 text-sm">Increases contrast for better visibility</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Reduce Motion</label>
                  <p className="text-gray-400 text-sm">Minimizes animations and transitions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="bg-discord-darker border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio Accessibility */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Audio Accessibility</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Sound Effects</label>
                  <p className="text-gray-400 text-sm">Enable audio feedback for actions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Input Accessibility */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Input Accessibility</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enhanced Keyboard Navigation</label>
                  <p className="text-gray-400 text-sm">Improved focus indicators and tab navigation</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keyboardNavigation}
                    onChange={(e) => setKeyboardNavigation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Changes */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Save accessibility preferences
                console.log('Saving accessibility settings');
                router.back();
              }}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
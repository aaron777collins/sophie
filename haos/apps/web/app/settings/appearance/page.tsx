'use client'

import { useState } from 'react'
import { ArrowLeftIcon, PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AppearanceSettingsPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    theme: 'dark',
    accentColor: 'blue',
    fontSize: 'medium',
    compactMode: false,
    showAvatars: true,
    animationsEnabled: true,
  })

  const themes = [
    { id: 'light', name: 'Light', icon: SunIcon },
    { id: 'dark', name: 'Dark', icon: MoonIcon },
    { id: 'system', name: 'System', icon: MonitorIcon },
  ]

  const accentColors = [
    { id: 'blue', name: 'Blue', color: '#5865f2' },
    { id: 'green', name: 'Green', color: '#57f287' },
    { id: 'red', name: 'Red', color: '#ed4245' },
    { id: 'purple', name: 'Purple', color: '#9c59b6' },
    { id: 'orange', name: 'Orange', color: '#f39c12' },
    { id: 'pink', name: 'Pink', color: '#e91e63' },
  ]

  const fontSizes = [
    { id: 'small', name: 'Small', example: '14px' },
    { id: 'medium', name: 'Medium', example: '16px' },
    { id: 'large', name: 'Large', example: '18px' },
    { id: 'xlarge', name: 'Extra Large', example: '20px' },
  ]

  const handleSave = () => {
    console.log('Saving appearance settings:', settings)
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
              <PaletteIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Appearance</h1>
              <p className="text-gray-400">Customize the look and feel of HAOS</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSettings({...settings, theme: theme.id})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === theme.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <theme.icon className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
            <div className="grid grid-cols-6 gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSettings({...settings, accentColor: color.id})}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    settings.accentColor === color.id
                      ? 'border-white scale-110'
                      : 'border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Font Size</h3>
            <div className="space-y-3">
              {fontSizes.map((size) => (
                <label key={size.id} className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="radio"
                    name="fontSize"
                    value={size.id}
                    checked={settings.fontSize === size.id}
                    onChange={(e) => setSettings({...settings, fontSize: e.target.value})}
                    className="w-4 h-4 text-primary-500 bg-discord-darker border-gray-600"
                  />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-white">{size.name}</span>
                    <span className="text-gray-400" style={{ fontSize: size.example }}>
                      Sample text
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Display Options</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Compact Mode</h4>
                  <p className="text-gray-400 text-sm">Reduce spacing between messages</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, compactMode: !settings.compactMode})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.compactMode ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Show User Avatars</h4>
                  <p className="text-gray-400 text-sm">Display profile pictures in messages</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, showAvatars: !settings.showAvatars})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.showAvatars ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showAvatars ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Animations</h4>
                  <p className="text-gray-400 text-sm">Enable smooth transitions and effects</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, animationsEnabled: !settings.animationsEnabled})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.animationsEnabled ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="bg-discord-darker rounded-lg p-4">
              <div className="flex items-start gap-3">
                {settings.showAvatars && (
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex-shrink-0"></div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">Sample User</span>
                    <span className="text-gray-400 text-xs">Today at 12:34</span>
                  </div>
                  <p className={`text-gray-300 ${settings.compactMode ? 'text-sm' : ''}`}>
                    This is how your messages will appear with the current settings.
                  </p>
                </div>
              </div>
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
'use client'

import { useState } from 'react'
import { ArrowLeftIcon, BellIcon, VolumeXIcon, SmartphoneIcon, MonitorIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdvancedNotificationSettings() {
  const router = useRouter()
  
  // Desktop notification settings
  const [desktopEnabled, setDesktopEnabled] = useState(true)
  const [desktopSound, setDesktopSound] = useState(true)
  const [desktopPreview, setDesktopPreview] = useState(true)
  const [desktopTaskbar, setDesktopTaskbar] = useState(true)
  
  // Mobile notification settings
  const [mobileEnabled, setMobileEnabled] = useState(true)
  const [mobileBadge, setMobileBadge] = useState(true)
  const [mobileVibrate, setMobileVibrate] = useState(true)
  const [mobileLockScreen, setMobileLockScreen] = useState(true)
  
  // Advanced filtering
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')
  const [keywordFilters, setKeywordFilters] = useState(['@everyone', '@here', 'urgent'])
  const [newKeyword, setNewKeyword] = useState('')
  
  // Notification grouping
  const [groupByServer, setGroupByServer] = useState(true)
  const [groupByChannel, setGroupByChannel] = useState(false)
  const [maxNotifications, setMaxNotifications] = useState(10)

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywordFilters.includes(newKeyword.trim())) {
      setKeywordFilters([...keywordFilters, newKeyword.trim()])
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setKeywordFilters(keywordFilters.filter(k => k !== keyword))
  }

  const handleSave = () => {
    console.log('Saving advanced notification settings')
    router.back()
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
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <BellIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Advanced Notifications</h1>
              <p className="text-gray-400">
                Fine-tune your notification preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Desktop Notifications */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MonitorIcon className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Desktop Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enable desktop notifications</label>
                  <p className="text-gray-400 text-sm">Show system notifications on desktop</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={desktopEnabled}
                    onChange={(e) => setDesktopEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {desktopEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Notification sounds</label>
                      <p className="text-gray-400 text-sm">Play sound with desktop notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={desktopSound}
                        onChange={(e) => setDesktopSound(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Message preview</label>
                      <p className="text-gray-400 text-sm">Show message content in notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={desktopPreview}
                        onChange={(e) => setDesktopPreview(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Taskbar flashing</label>
                      <p className="text-gray-400 text-sm">Flash taskbar icon when notifications arrive</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={desktopTaskbar}
                        onChange={(e) => setDesktopTaskbar(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Notifications */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <SmartphoneIcon className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Mobile Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enable mobile notifications</label>
                  <p className="text-gray-400 text-sm">Show push notifications on mobile devices</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mobileEnabled}
                    onChange={(e) => setMobileEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {mobileEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">App badge count</label>
                      <p className="text-gray-400 text-sm">Show unread count on app icon</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mobileBadge}
                        onChange={(e) => setMobileBadge(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Vibration</label>
                      <p className="text-gray-400 text-sm">Vibrate device for notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mobileVibrate}
                        onChange={(e) => setMobileVibrate(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Lock screen notifications</label>
                      <p className="text-gray-400 text-sm">Show notifications on lock screen</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mobileLockScreen}
                        onChange={(e) => setMobileLockScreen(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <VolumeXIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Quiet Hours</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enable quiet hours</label>
                  <p className="text-gray-400 text-sm">Suppress notifications during specified hours</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Start time</label>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="w-full bg-discord-darker border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">End time</label>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="w-full bg-discord-darker border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Keyword Filtering */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Priority Keywords</h2>
            <p className="text-gray-400 text-sm mb-4">
              Get notifications even when quiet hours are active or server notifications are disabled
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="Add keyword or phrase..."
                  className="flex-1 bg-discord-darker border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                />
                <button
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywordFilters.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500 text-white rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-gray-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Grouping */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notification Grouping</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Group by server</label>
                  <p className="text-gray-400 text-sm">Combine multiple notifications from the same server</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupByServer}
                    onChange={(e) => setGroupByServer(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Group by channel</label>
                  <p className="text-gray-400 text-sm">Combine multiple notifications from the same channel</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupByChannel}
                    onChange={(e) => setGroupByChannel(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Maximum notifications</label>
                <select
                  value={maxNotifications}
                  onChange={(e) => setMaxNotifications(Number(e.target.value))}
                  className="bg-discord-darker border border-gray-600 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                >
                  <option value={5}>5 notifications</option>
                  <option value={10}>10 notifications</option>
                  <option value={20}>20 notifications</option>
                  <option value={50}>50 notifications</option>
                  <option value={-1}>No limit</option>
                </select>
                <p className="text-gray-400 text-sm mt-1">
                  Maximum number of notifications to show at once
                </p>
              </div>
            </div>
          </div>

          {/* Save Changes */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
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
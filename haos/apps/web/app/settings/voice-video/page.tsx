'use client'

import { useState } from 'react'
import { ArrowLeftIcon, MicIcon, VolumeXIcon, TestTubeIcon, VideoIcon, CameraIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function VoiceVideoSettingsPage() {
  const router = useRouter()
  
  const [voiceSettings, setVoiceSettings] = useState({
    inputDevice: 'default',
    outputDevice: 'default',
    inputVolume: 80,
    outputVolume: 100,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    pushToTalk: false,
    pushToTalkKey: 'grave',
  })

  const [videoSettings, setVideoSettings] = useState({
    camera: 'default',
    resolution: '720p',
    frameRate: 30,
    backgroundBlur: false,
    alwaysPreview: true,
    hardwareAcceleration: true,
  })

  const handleSave = () => {
    console.log('Saving voice settings:', voiceSettings)
    console.log('Saving video settings:', videoSettings)
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
              <MicIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Voice & Video</h1>
              <p className="text-gray-400">Configure your microphone, audio, and camera</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Device Selection */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Audio Devices</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Input Device (Microphone)
                </label>
                <select
                  value={voiceSettings.inputDevice}
                  onChange={(e) => setVoiceSettings({...voiceSettings, inputDevice: e.target.value})}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="default">Default - Built-in Microphone</option>
                  <option value="usb-headset">USB Headset Microphone</option>
                  <option value="bluetooth">Bluetooth Headphones</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Output Device (Speakers/Headphones)
                </label>
                <select
                  value={voiceSettings.outputDevice}
                  onChange={(e) => setVoiceSettings({...voiceSettings, outputDevice: e.target.value})}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="default">Default - Built-in Speakers</option>
                  <option value="usb-headset">USB Headset</option>
                  <option value="bluetooth">Bluetooth Headphones</option>
                </select>
              </div>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Volume</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Input Volume (Microphone)
                  </label>
                  <span className="text-white">{voiceSettings.inputVolume}%</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={voiceSettings.inputVolume}
                    onChange={(e) => setVoiceSettings({...voiceSettings, inputVolume: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
                <button className="mt-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                  Test Microphone
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Output Volume
                  </label>
                  <span className="text-white">{voiceSettings.outputVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={voiceSettings.outputVolume}
                  onChange={(e) => setVoiceSettings({...voiceSettings, outputVolume: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                  <span>200%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Processing */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Audio Processing</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Echo Cancellation</h4>
                  <p className="text-gray-400 text-sm">Remove echo from your microphone</p>
                </div>
                <button
                  onClick={() => setVoiceSettings({...voiceSettings, echoCancellation: !voiceSettings.echoCancellation})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    voiceSettings.echoCancellation ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    voiceSettings.echoCancellation ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Noise Suppression</h4>
                  <p className="text-gray-400 text-sm">Reduce background noise</p>
                </div>
                <button
                  onClick={() => setVoiceSettings({...voiceSettings, noiseSuppression: !voiceSettings.noiseSuppression})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    voiceSettings.noiseSuppression ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    voiceSettings.noiseSuppression ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Auto Gain Control</h4>
                  <p className="text-gray-400 text-sm">Automatically adjust microphone volume</p>
                </div>
                <button
                  onClick={() => setVoiceSettings({...voiceSettings, autoGainControl: !voiceSettings.autoGainControl})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    voiceSettings.autoGainControl ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    voiceSettings.autoGainControl ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Push to Talk */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Push to Talk</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Enable Push to Talk</h4>
                  <p className="text-gray-400 text-sm">Only transmit audio when key is pressed</p>
                </div>
                <button
                  onClick={() => setVoiceSettings({...voiceSettings, pushToTalk: !voiceSettings.pushToTalk})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    voiceSettings.pushToTalk ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    voiceSettings.pushToTalk ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {voiceSettings.pushToTalk && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Push to Talk Key
                  </label>
                  <button className="px-4 py-2 bg-discord-darker border border-gray-600 rounded-lg text-white hover:border-gray-500 transition-colors">
                    ` (Grave/Backtick)
                  </button>
                  <p className="text-gray-400 text-xs mt-1">
                    Click to change key binding
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Section */}
          <div className="bg-discord-light border-l-4 border-blue-500 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TestTubeIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Test Your Setup</h3>
                <p className="text-gray-400 mb-4">
                  Make sure your audio is working correctly before joining voice channels.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors">
                    Mic Test
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors">
                    Speaker Test
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Settings */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <VideoIcon className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Video Settings</h3>
            </div>
            
            <div className="space-y-6">
              {/* Camera Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Camera
                </label>
                <select
                  value={videoSettings.camera}
                  onChange={(e) => setVideoSettings({...videoSettings, camera: e.target.value})}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="default">Default - Built-in Camera</option>
                  <option value="usb-webcam">USB Webcam</option>
                  <option value="external">External Camera</option>
                </select>
              </div>

              {/* Video Quality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resolution
                  </label>
                  <select
                    value={videoSettings.resolution}
                    onChange={(e) => setVideoSettings({...videoSettings, resolution: e.target.value})}
                    className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="480p">480p (854×480)</option>
                    <option value="720p">720p (1280×720)</option>
                    <option value="1080p">1080p (1920×1080)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frame Rate
                  </label>
                  <select
                    value={videoSettings.frameRate}
                    onChange={(e) => setVideoSettings({...videoSettings, frameRate: parseInt(e.target.value)})}
                    className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value={15}>15 FPS</option>
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>
              </div>

              {/* Video Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Background Blur</h4>
                    <p className="text-gray-400 text-sm">Blur your background during video calls</p>
                  </div>
                  <button
                    onClick={() => setVideoSettings({...videoSettings, backgroundBlur: !videoSettings.backgroundBlur})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      videoSettings.backgroundBlur ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      videoSettings.backgroundBlur ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Always Show Preview</h4>
                    <p className="text-gray-400 text-sm">Show your video preview when not in a call</p>
                  </div>
                  <button
                    onClick={() => setVideoSettings({...videoSettings, alwaysPreview: !videoSettings.alwaysPreview})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      videoSettings.alwaysPreview ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      videoSettings.alwaysPreview ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Hardware Acceleration</h4>
                    <p className="text-gray-400 text-sm">Use GPU for video encoding/decoding</p>
                  </div>
                  <button
                    onClick={() => setVideoSettings({...videoSettings, hardwareAcceleration: !videoSettings.hardwareAcceleration})}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      videoSettings.hardwareAcceleration ? 'bg-primary-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      videoSettings.hardwareAcceleration ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Camera Test */}
              <div className="bg-discord-darker rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Camera Preview</h4>
                <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center mb-3">
                  <div className="text-center text-gray-400">
                    <CameraIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Camera preview will appear here</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                  Test Camera
                </button>
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
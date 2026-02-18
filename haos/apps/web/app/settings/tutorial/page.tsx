'use client'

import { useState } from 'react'
import { ArrowLeftIcon, PlayIcon, CheckIcon, BookIcon, VideoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const tutorials = [
  {
    id: 'getting-started',
    title: 'Getting Started with HAOS',
    description: 'Learn the basics of using HAOS and setting up your account',
    duration: '3 min',
    completed: true,
    steps: [
      'Create your account',
      'Set up your profile',
      'Join your first server',
      'Send your first message'
    ]
  },
  {
    id: 'voice-chat',
    title: 'Voice & Video Chat',
    description: 'Master voice channels, video calls, and screen sharing',
    duration: '5 min',
    completed: false,
    steps: [
      'Join a voice channel',
      'Configure your microphone',
      'Start a video call',
      'Share your screen'
    ]
  },
  {
    id: 'server-management',
    title: 'Managing Your Server',
    description: 'Learn how to create and manage your own servers',
    duration: '7 min',
    completed: false,
    steps: [
      'Create a new server',
      'Set up channels',
      'Manage user roles',
      'Configure server settings'
    ]
  },
  {
    id: 'privacy-security',
    title: 'Privacy & Security',
    description: 'Keep your account secure and protect your privacy',
    duration: '4 min',
    completed: false,
    steps: [
      'Enable two-factor authentication',
      'Configure privacy settings',
      'Understand encryption',
      'Report and block users'
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Discover power user features and customizations',
    duration: '6 min',
    completed: false,
    steps: [
      'Keyboard shortcuts',
      'Custom themes',
      'Bot integration',
      'Matrix bridges'
    ]
  }
]

export default function TutorialSettings() {
  const router = useRouter()
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(true)

  const completedTutorials = tutorials.filter(t => t.completed).length
  const totalTutorials = tutorials.length
  const progressPercentage = Math.round((completedTutorials / totalTutorials) * 100)

  const handleStartTutorial = (tutorialId: string) => {
    console.log('Starting tutorial:', tutorialId)
    // In a real app, this would launch the interactive tutorial
  }

  const handleResetProgress = () => {
    console.log('Resetting tutorial progress')
    // In a real app, this would reset all tutorial completion states
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
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <BookIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Tutorial & Help</h1>
              <p className="text-gray-400">
                Learn how to use HAOS features effectively
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Progress</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">Tutorials Completed</span>
                  <span className="text-white font-medium">{completedTutorials}/{totalTutorials}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-400">{progressPercentage}%</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleResetProgress}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors text-sm"
              >
                Reset Progress
              </button>
              <button
                onClick={() => setShowOnboarding(!showOnboarding)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors text-sm"
              >
                {showOnboarding ? 'Hide' : 'Show'} Onboarding Tips
              </button>
            </div>
          </div>

          {/* Tutorial List */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Available Tutorials</h2>
            
            <div className="space-y-4">
              {tutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="bg-discord-darker rounded-lg p-4 transition-all hover:bg-gray-700"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tutorial.completed ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {tutorial.completed ? (
                        <CheckIcon className="w-6 h-6 text-white" />
                      ) : (
                        <PlayIcon className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{tutorial.title}</h3>
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <VideoIcon className="w-4 h-4" />
                          {tutorial.duration}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{tutorial.description}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">What you'll learn:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {tutorial.steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartTutorial(tutorial.id)}
                          className={`px-4 py-2 font-medium rounded transition-colors ${
                            tutorial.completed
                              ? 'bg-gray-600 hover:bg-gray-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {tutorial.completed ? 'Review' : 'Start Tutorial'}
                        </button>
                        {tutorial.completed && (
                          <span className="px-3 py-2 bg-green-100 text-green-800 text-sm font-medium rounded">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Resources */}
          <div className="bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Help</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-discord-darker p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Documentation</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Comprehensive guides and API documentation
                </p>
                <button
                  onClick={() => router.push('/docs')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors text-sm"
                >
                  View Docs
                </button>
              </div>

              <div className="bg-discord-darker p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Community Support</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Get help from the HAOS community
                </p>
                <button
                  onClick={() => window.open('https://matrix.to/#/#haos:matrix.org', '_blank')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors text-sm"
                >
                  Join Support Chat
                </button>
              </div>

              <div className="bg-discord-darker p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Keyboard Shortcuts</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Learn shortcuts to use HAOS faster
                </p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition-colors text-sm">
                  Show Shortcuts
                </button>
              </div>

              <div className="bg-discord-darker p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Report Issues</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Found a bug or have feedback?
                </p>
                <button
                  onClick={() => window.open('https://github.com/haos/haos/issues', '_blank')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors text-sm"
                >
                  Report Bug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
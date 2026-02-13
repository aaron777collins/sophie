'use client'

import { useEffect, useState } from 'react'
import { WelcomeWizard } from '../components/onboarding/welcome-wizard'
import { MainApp } from '../components/main-app'

export default function HomePage() {
  const [showFirstRun, setShowFirstRun] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed first-run experience
    const hasCompletedFirstRun = localStorage.getItem('haos-first-run-completed')
    const hasExistingAuth = localStorage.getItem('haos-matrix-session')
    
    // Show first-run if not completed and no existing session
    setShowFirstRun(!hasCompletedFirstRun && !hasExistingAuth)
    setIsLoading(false)
  }, [])

  const handleFirstRunComplete = () => {
    localStorage.setItem('haos-first-run-completed', 'true')
    setShowFirstRun(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-discord-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading HAOS...</p>
        </div>
      </div>
    )
  }

  if (showFirstRun) {
    return <WelcomeWizard onComplete={handleFirstRunComplete} />
  }

  return <MainApp />
}
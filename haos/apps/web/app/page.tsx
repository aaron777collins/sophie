'use client'

import { useEffect } from 'react'
import { WelcomeWizard } from '../components/onboarding/welcome-wizard'
import { MainApp } from '../components/main-app'
import { useMatrixUserStore } from '../lib/matrix-user-context'

export default function HomePage() {
  const { setUser, isAuthenticated } = useMatrixUserStore()

  useEffect(() => {
    // Attempt to retrieve existing Matrix session
    const matrixSession = localStorage.getItem('haos-matrix-session')
    const hasCompletedFirstRun = localStorage.getItem('haos-first-run-completed')

    if (matrixSession) {
      try {
        const sessionData = JSON.parse(matrixSession)
        setUser({
          userId: sessionData.userId,
          displayName: sessionData.displayName,
          avatarUrl: sessionData.avatarUrl
        })
      } catch (error) {
        console.error('Failed to parse Matrix session:', error)
      }
    }
  }, [setUser])

  // Show first-run wizard if no existing authentication
  if (!isAuthenticated) {
    return <WelcomeWizard onComplete={() => {
      localStorage.setItem('haos-first-run-completed', 'true')
      // The authentication should be handled by the wizard itself
    }} />
  }

  return <MainApp />
}
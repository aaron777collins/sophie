'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FirstRunState {
  currentStep: number
  totalSteps: number
  userData: {
    username?: string
    displayName?: string
    avatar?: string
  }
  serverData: {
    name?: string
    template?: string
    channels?: Array<{ name: string; type: 'text' | 'voice' }>
  }
}

interface FirstRunContextType {
  state: FirstRunState
  nextStep: () => void
  prevStep: () => void
  setUserData: (data: Partial<FirstRunState['userData']>) => void
  setServerData: (data: Partial<FirstRunState['serverData']>) => void
  resetFlow: () => void
}

const initialState: FirstRunState = {
  currentStep: 0,
  totalSteps: 4,
  userData: {},
  serverData: {},
}

const FirstRunContext = createContext<FirstRunContextType | null>(null)

export function FirstRunExperienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FirstRunState>(initialState)

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1)
    }))
  }

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }))
  }

  const setUserData = (data: Partial<FirstRunState['userData']>) => {
    setState(prev => ({
      ...prev,
      userData: { ...prev.userData, ...data }
    }))
  }

  const setServerData = (data: Partial<FirstRunState['serverData']>) => {
    setState(prev => ({
      ...prev,
      serverData: { ...prev.serverData, ...data }
    }))
  }

  const resetFlow = () => {
    setState(initialState)
  }

  return (
    <FirstRunContext.Provider value={{
      state,
      nextStep,
      prevStep,
      setUserData,
      setServerData,
      resetFlow,
    }}>
      {children}
    </FirstRunContext.Provider>
  )
}

export function useFirstRun() {
  const context = useContext(FirstRunContext)
  if (!context) {
    throw new Error('useFirstRun must be used within FirstRunExperienceProvider')
  }
  return context
}
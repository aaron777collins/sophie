'use client'

import { useState } from 'react'
import { useFirstRun } from './first-run-provider'
import { WelcomeStep } from './steps/welcome-step'
import { CreateAccountStep } from './steps/create-account-step'
import { CreateServerStep } from './steps/create-server-step'
import { JoinChannelStep } from './steps/join-channel-step'

interface WelcomeWizardProps {
  onComplete: () => void
}

const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'account', title: 'Create Account', component: CreateAccountStep },
  { id: 'server', title: 'Create Server', component: CreateServerStep },
  { id: 'join', title: 'Join Channel', component: JoinChannelStep },
]

export function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const { state, nextStep, prevStep, resetFlow } = useFirstRun()
  const [canProceed, setCanProceed] = useState(false)
  
  const currentStepData = STEPS[state.currentStep]
  const CurrentStepComponent = currentStepData?.component
  
  if (!currentStepData || !CurrentStepComponent) {
    return <div>Invalid step</div>
  }

  const handleNext = () => {
    if (state.currentStep === state.totalSteps - 1) {
      // Complete the flow
      onComplete()
    } else {
      nextStep()
      setCanProceed(false) // Reset for next step
    }
  }

  const handleSkip = () => {
    // Skip the entire flow and go to main app
    localStorage.setItem('haos-first-run-skipped', 'true')
    onComplete()
  }

  return (
    <div className="min-h-screen bg-discord-dark flex">
      {/* Side navigation */}
      <div className="w-80 bg-discord-darker border-r border-gray-700 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to HAOS</h1>
          <p className="text-gray-400 text-sm">Get started in just a few steps</p>
        </div>

        {/* Progress steps */}
        <div className="space-y-4 flex-1">
          {STEPS.map((step, index) => {
            const isComplete = index < state.currentStep
            const isCurrent = index === state.currentStep
            const isUpcoming = index > state.currentStep

            return (
              <div key={step.id} className="flex items-center space-x-3">
                {/* Step indicator */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${isComplete 
                    ? 'bg-primary-500 text-white' 
                    : isCurrent 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-600 text-gray-400'
                  }
                `}>
                  {isComplete ? '✓' : index + 1}
                </div>
                
                {/* Step title */}
                <span className={`
                  font-medium
                  ${isCurrent ? 'text-white' : isComplete ? 'text-gray-300' : 'text-gray-500'}
                `}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Skip option */}
        <div className="pt-6 border-t border-gray-700">
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
          >
            Skip setup - I'll configure later
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-discord-dark border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{currentStepData?.title}</h2>
            <p className="text-gray-400 text-sm">
              Step {state.currentStep + 1} of {state.totalSteps}
            </p>
          </div>
          
          <div className="flex space-x-3">
            {state.currentStep > 0 && (
              <button
                onClick={prevStep}
                className="discord-button-secondary"
              >
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="discord-button"
            >
              {state.currentStep === state.totalSteps - 1 ? 'Get Started!' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 p-8 overflow-auto">
          <CurrentStepComponent onValidChange={setCanProceed} />
        </div>
      </div>
    </div>
  )
}
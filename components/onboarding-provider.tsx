"use client"

import { OnboardingSurvey } from "@/components/onboarding-survey"
import { useOnboarding } from "@/hooks/use-onboarding"

export function OnboardingProvider() {
  const { showSurvey, completeSurvey, skipSurvey } = useOnboarding()

  return (
    <OnboardingSurvey
      isOpen={showSurvey}
      onComplete={completeSurvey}
      onSkip={skipSurvey}
    />
  )
}

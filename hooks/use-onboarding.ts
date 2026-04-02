"use client"

import { useState, useEffect } from "react"

interface SurveyData {
  interests: string[]
  budget: string
  experience: string
  frequency: string
  goals: string[]
  email: string
}

export function useOnboarding() {
  const [showSurvey, setShowSurvey] = useState(false)
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false)
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null)

  useEffect(() => {
    // Verificar si el usuario ya completó la encuesta
    const completed = localStorage.getItem('novo-heritage-survey-completed')
    const userData = localStorage.getItem('novo-heritage-user-data')
    
    if (completed === 'true' && userData) {
      setHasCompletedSurvey(true)
      setSurveyData(JSON.parse(userData))
    } else {
      // Mostrar encuesta después de 2 segundos si no la ha completado
      const timer = setTimeout(() => {
        setShowSurvey(true)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const completeSurvey = (data: SurveyData) => {
    setSurveyData(data)
    setHasCompletedSurvey(true)
    setShowSurvey(false)
    
    // Guardar en localStorage
    localStorage.setItem('novo-heritage-survey-completed', 'true')
    localStorage.setItem('novo-heritage-user-data', JSON.stringify(data))
    
    // Aquí podrías enviar los datos a tu API
    console.log('Survey completed:', data)
  }

  const skipSurvey = () => {
    setShowSurvey(false)
    localStorage.setItem('novo-heritage-survey-skipped', 'true')
  }

  const resetSurvey = () => {
    localStorage.removeItem('novo-heritage-survey-completed')
    localStorage.removeItem('novo-heritage-user-data')
    localStorage.removeItem('novo-heritage-survey-skipped')
    setHasCompletedSurvey(false)
    setSurveyData(null)
    setShowSurvey(true)
  }

  return {
    showSurvey,
    hasCompletedSurvey,
    surveyData,
    completeSurvey,
    skipSurvey,
    resetSurvey
  }
}

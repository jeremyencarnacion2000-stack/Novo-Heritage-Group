"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
// @ts-ignore - lucide-react types not resolving correctly
import { X, ArrowRight, Sparkles, Target, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface SurveyData {
  interests: string[]
  budget: string
  experience: string
  frequency: string
  goals: string[]
  email: string
}

interface OnboardingSurveyProps {
  isOpen: boolean
  onComplete: (data: SurveyData) => void
  onSkip: () => void
}

export function OnboardingSurvey({ isOpen, onComplete, onSkip }: OnboardingSurveyProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<SurveyData>({
    interests: [],
    budget: "",
    experience: "",
    frequency: "",
    goals: [],
    email: ""
  })

  const steps = [
    {
      title: "¡Bienvenido a Novo Heritage!",
      subtitle: "Cuéntanos sobre tus intereses para personalizar tu experiencia",
      icon: <Sparkles className="w-8 h-8 text-spotify-green" />,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium mb-4 block text-foreground">¿Qué servicios te interesan más?</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "seguros", label: "Seguros de Auto", icon: "🚗" },
                { id: "vida", label: "Seguros de Vida", icon: "🛡️" },
                { id: "hogar", label: "Seguros de Hogar", icon: "🏠" },
                { id: "empresas", label: "Seguros Empresariales", icon: "🏢" },
                { id: "propiedades", label: "Bienes Raíces", icon: "🏘️" },
                { id: "turismo", label: "Paquetes de Turismo", icon: "✈️" }
              ].map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105",
                    data.interests.includes(item.id)
                      ? "border-spotify-green bg-spotify-green/10 shadow-lg"
                      : "border-border bg-card hover:border-spotify-green/50"
                  )}
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      interests: prev.interests.includes(item.id)
                        ? prev.interests.filter(i => i !== item.id)
                        : [...prev.interests, item.id]
                    }))
                  }}
                >
                  <span className="text-4xl mb-2">{item.icon}</span>
                  <span className="font-semibold text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Presupuesto y Experiencia",
      subtitle: "Ayúdanos a recomendarte las mejores opciones",
      icon: <Target className="w-8 h-8 text-spotify-green" />,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium mb-4 block text-foreground">¿Cuál es tu rango de presupuesto mensual?</Label>
            <RadioGroup
              value={data.budget}
              onValueChange={(value) => setData(prev => ({ ...prev, budget: value }))}
              className="space-y-3"
            >
              {[
                { value: "bajo", label: "Menos de $50,000 DOP" },
                { value: "medio", label: "$50,000 - $150,000 DOP" },
                { value: "alto", label: "$150,000 - $300,000 DOP" },
                { value: "premium", label: "Más de $300,000 DOP" }
              ].map((option) => (
                <Label
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105",
                    data.budget === option.value
                      ? "border-spotify-green bg-spotify-green/10"
                      : "border-border bg-card hover:border-spotify-green/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="border-border data-[state=checked]:border-spotify-green" />
                  <span className="font-medium text-foreground">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Objetivos y Frecuencia",
      subtitle: "Entendemos mejor tus necesidades",
      icon: <TrendingUp className="w-8 h-8 text-spotify-green" />,
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-medium mb-4 block text-foreground">¿Cuáles son tus objetivos principales?</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "proteccion", label: "Proteger mi patrimonio", icon: "🛡️" },
                { id: "ahorro", label: "Ahorrar para el futuro", icon: "💰" },
                { id: "inversion", label: "Invertir en propiedades", icon: "🏘️" },
                { id: "viajes", label: "Viajar y conocer el mundo", icon: "🌍" },
              ].map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-none border-2 cursor-pointer transition-all duration-300 hover:scale-105",
                    data.goals.includes(item.id)
                      ? "border-spotify-green bg-spotify-green/10 shadow-lg"
                      : "border-border bg-card hover:border-spotify-green/50"
                  )}
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      goals: prev.goals.includes(item.id)
                        ? prev.goals.filter(g => g !== item.id)
                        : [...prev.goals, item.id]
                    }))
                  }}
                >
                  <span className="text-4xl mb-2">{item.icon}</span>
                  <span className="font-semibold text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Información de Contacto",
      subtitle: "Recibe ofertas personalizadas y actualizaciones",
      icon: <Users className="w-8 h-8 text-spotify-green" />,
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-lg font-medium mb-4 block text-foreground">
              ¿Cuál es tu correo electrónico?
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={data.email}
              onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full py-3 px-4 text-lg rounded-none border-2 bg-foreground/5 border-border text-foreground focus:border-spotify-green focus:ring-2 focus:ring-spotify-green/20 transition-all duration-300"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Te enviaremos ofertas exclusivas y actualizaciones sobre nuestros servicios.
            </p>
          </div>
        </div>
      )
    }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.interests.length > 0
      case 1: return !!data.budget
      case 2: return data.goals.length > 0
      case 3: return !!data.email
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(data)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-none shadow-2xl border border-border animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            {steps[currentStep].icon}
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 flex-1 rounded-none transition-all duration-500",
                  index <= currentStep
                    ? "bg-spotify-green"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Paso {currentStep + 1} de {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Saltar encuesta
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="bg-foreground/5 border-border text-foreground hover:bg-foreground/10"
              >
                Anterior
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-spotify-green text-black font-bold hover:bg-spotify-green/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-none"
            >
              {currentStep === steps.length - 1 ? "Completar" : "Siguiente"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

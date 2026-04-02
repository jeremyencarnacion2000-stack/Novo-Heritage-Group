"use client"

import { useState, useEffect } from "react"
// @ts-ignore - lucide-react types not resolving correctly
import { Clock, AlertCircle, Users, Zap } from "lucide-react"

interface UrgencyBannerProps {
  type?: "limited-time" | "limited-stock" | "high-demand" | "flash-sale"
  expiresAt?: Date
  itemsLeft?: number
  viewersCount?: number
}

export function UrgencyBanner({
  type = "limited-time",
  expiresAt,
  itemsLeft = 3,
  viewersCount = 5,
}: UrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!expiresAt) return

    const updateTimer = () => {
      const now = new Date()
      const diff = expiresAt.getTime() - now.getTime()

      if (diff <= 0) {
        setIsVisible(false)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!isVisible) return null

  const bannerConfig = {
    "limited-time": {
      icon: <Clock className="w-5 h-5" />,
      title: "Oferta por Tiempo Limitado",
      message: `Válida hasta hoy a las 11:59 PM`,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    "limited-stock": {
      icon: <AlertCircle className="w-5 h-5" />,
      title: "Stock Limitado",
      message: `Solo ${itemsLeft} disponibles`,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    "high-demand": {
      icon: <Users className="w-5 h-5" />,
      title: "Alta Demanda",
      message: `${viewersCount} personas viendo esto ahora`,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    "flash-sale": {
      icon: <Zap className="w-5 h-5" />,
      title: "Flash Sale",
      message: "Descuento especial por tiempo limitado",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
  }

  const config = bannerConfig[type]

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-none p-4 mb-6 animate-pulse-glow transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-none bg-gradient-to-br ${config.color} text-white animate-bounce-in`}>{config.icon}</div>

        <div className="flex-1">
          <p className="font-semibold text-foreground animate-fade-in-left">{config.title}</p>
          <p className="text-sm text-muted-foreground animate-fade-in-left" style={{ animationDelay: "0.1s" }}>{config.message}</p>
        </div>

        {timeLeft && (
          <div className="text-right animate-slide-in-right">
            <p className="text-xs text-muted-foreground">Tiempo restante:</p>
            <p className="font-mono font-bold text-primary animate-pulse">{timeLeft}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para mostrar múltiples indicadores de urgencia
export function UrgencyIndicators() {
  return (
    <div className="space-y-3">
      <UrgencyBanner type="limited-time" expiresAt={new Date(Date.now() + 8 * 60 * 60 * 1000)} />
      <UrgencyBanner type="limited-stock" itemsLeft={3} />
      <UrgencyBanner type="high-demand" viewersCount={5} />
    </div>
  )
}

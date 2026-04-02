"use client"

import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  end: number
  duration?: number
  start?: number
  decimals?: number
}

export function useCountUp({
  end,
  duration = 2000,
  start = 0,
  decimals = 0
}: UseCountUpOptions) {
  const [count, setCount] = useState(start)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const startValue = start
    const endValue = end

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (endValue - startValue) * easeOutQuart

      setCount(decimals === 0 ? Math.floor(currentValue) : Number(currentValue.toFixed(decimals)))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, start, decimals, isVisible])

  const startAnimation = () => setIsVisible(true)

  return { count, startAnimation }
}
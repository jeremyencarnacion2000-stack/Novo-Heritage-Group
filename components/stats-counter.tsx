"use client"

import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '@/hooks/use-count-up'

interface StatsCounterProps {
  value: number
  suffix?: string
  label: string
  decimals?: number
}

export function StatsCounter({ value, suffix = '', label, decimals = 0 }: StatsCounterProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { count, startAnimation } = useCountUp({
    end: value,
    duration: 2500,
    decimals
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          startAnimation()
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible, startAnimation])

  return (
    <div
      ref={ref}
      className="glass-premium p-12 flex flex-col items-center justify-center text-center transition-all duration-1000 hover:scale-[1.02] group relative overflow-hidden"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-1000 pointer-events-none" />
      
      <div className="text-7xl md:text-8xl font-serif font-extralight tracking-tighter text-foreground flex items-baseline gap-2 group-hover:text-primary transition-colors duration-700 relative z-10">
        <span className="leading-none">{isVisible ? count : 0}</span>
        <span className="text-4xl text-primary/60 group-hover:text-primary transition-colors">{suffix}</span>
      </div>
      
      <div className="w-16 h-[0.5px] bg-primary/40 my-8 group-hover:w-24 group-hover:bg-primary transition-all duration-1000 relative z-10" />
      
      <div className="premium-label text-foreground/40 group-hover:text-foreground/80 transition-colors duration-700 relative z-10">
        {label}
      </div>
    </div>
  )
}
"use client"

import { useEffect, useState, useCallback } from "react"

interface ScrollPosition {
  x: number
  y: number
  direction: 'up' | 'down' | null
  isScrolling: boolean
}

export function useOptimizedScroll() {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    isScrolling: false
  })

  const [lastScrollY, setLastScrollY] = useState(0)
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const currentScrollX = window.scrollX
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }

    // Set scrolling state
    setScrollPosition(prev => ({
      ...prev,
      x: currentScrollX,
      y: currentScrollY,
      direction: currentScrollY > lastScrollY ? 'down' : 'up',
      isScrolling: true
    }))

    // Set timeout to clear scrolling state
    const timeout = setTimeout(() => {
      setScrollPosition(prev => ({
        ...prev,
        isScrolling: false
      }))
    }, 150)

    setScrollTimeout(timeout)
    setLastScrollY(currentScrollY)
  }, [lastScrollY, scrollTimeout])

  useEffect(() => {
    // Throttle scroll events for better performance
    let ticking = false

    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [handleScroll, scrollTimeout])

  return scrollPosition
}

import Lenis from 'lenis'

export class SmoothScroll {
  private lenis: Lenis | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private init() {
    if (this.isInitialized) return

    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false,
    })

    // Start the animation loop
    const raf = (time: number) => {
      this.lenis?.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    this.isInitialized = true
  }

  // Public method to initialize (for external calls)
  public initialize() {
    this.init()
  }

  // Scroll to a specific element or position
  scrollTo(target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) {
    if (!this.lenis) return

    this.lenis.scrollTo(target, {
      offset: options?.offset || 0,
      duration: options?.duration || 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  }

  // Stop the smooth scroll
  stop() {
    this.lenis?.stop()
  }

  // Start the smooth scroll
  start() {
    this.lenis?.start()
  }

  // Destroy the instance
  destroy() {
    this.lenis?.destroy()
    this.lenis = null
    this.isInitialized = false
  }

  // Get current scroll progress (0-1)
  getScrollProgress(): number {
    return this.lenis?.progress || 0
  }

  // Get current scroll velocity
  getVelocity(): number {
    return this.lenis?.velocity || 0
  }
}

// Global instance
export const smoothScroll = new SmoothScroll()

// Auto-initialize on client side
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      smoothScroll.initialize()
    })
  } else {
    smoothScroll.initialize()
  }
}
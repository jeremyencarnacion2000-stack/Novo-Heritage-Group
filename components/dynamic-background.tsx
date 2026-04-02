"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface DynamicBackgroundProps {
  type: 'waves' | 'particles' | 'surfaces'
  className?: string
}

export default function DynamicBackground({ type, className = '' }: DynamicBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = containerRef.current!.offsetWidth
      canvas.height = containerRef.current!.offsetHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    if (type === 'waves') {
      // Wave animation
      let animationId: number
      let time = 0

      const animate = () => {
        time += 0.02
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
        gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.05)')
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw waves
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
        ctx.lineWidth = 2

        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          for (let x = 0; x < canvas.width; x += 2) {
            const y = canvas.height / 2 +
              Math.sin((x * 0.01) + time + (i * 2)) * 30 +
              Math.sin((x * 0.005) + time * 0.5 + (i * 1.5)) * 20
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', resizeCanvas)
      }
    } else if (type === 'particles') {
      // Particle system
      const particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        size: number
        opacity: number
      }> = []

      // Create particles
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2
        })
      }

      let animationId: number

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Update and draw particles
        particles.forEach(particle => {
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0

          // Draw particle
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`
          ctx.fill()

          // Draw connections
          particles.forEach(otherParticle => {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          })
        })

        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', resizeCanvas)
      }
    } else if (type === 'surfaces') {
      // 3D surface effect
      let animationId: number
      let time = 0

      const animate = () => {
        time += 0.01
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Create 3D surface effect
        const imageData = ctx.createImageData(canvas.width, canvas.height)
        const data = imageData.data

        for (let x = 0; x < canvas.width; x++) {
          for (let y = 0; y < canvas.height; y++) {
            const index = (y * canvas.width + x) * 4

            // Create wave-like surface
            const wave1 = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time)
            const wave2 = Math.sin(x * 0.005 + time * 0.7) * Math.cos(y * 0.005 + time * 0.7)
            const surface = (wave1 + wave2) * 0.5

            // Convert to color
            const intensity = (surface + 1) * 0.5
            const r = Math.floor(59 + intensity * 40)
            const g = Math.floor(130 + intensity * 30)
            const b = Math.floor(246 + intensity * 10)

            data[index] = r     // Red
            data[index + 1] = g // Green
            data[index + 2] = b // Blue
            data[index + 3] = Math.floor(intensity * 30) // Alpha
          }
        }

        ctx.putImageData(imageData, 0, 0)

        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', resizeCanvas)
      }
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [type])

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'multiply' }}
      />
    </div>
  )
}
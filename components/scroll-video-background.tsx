"use client"

import { useEffect, useRef, useCallback, useState } from "react"

interface ScrollVideoBackgroundProps {
  src: string
  fallbackImage?: string
  className?: string
  /** Extraction density in frames per second (default: 24) */
  fps?: number
  /** Max frames to extract (default: 180) */
  maxFrames?: number
  /** Scroll interpolation speed 0-1 (default: 0.12) */
  smoothing?: number
  /** How many viewport-heights of scroll to spread the video across (default: 5) */
  scrollMultiplier?: number
}

export function ScrollVideoBackground({
  src,
  fallbackImage,
  className = "",
  fps = 24,
  maxFrames = 360,
  smoothing = 0.12,
  scrollMultiplier = 5,
}: ScrollVideoBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const framesRef = useRef<(ImageBitmap | null)[]>([])
  const lastFrameRef = useRef(-1)
  const scrollProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const totalFrameCountRef = useRef(0)
  const [loading, setLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [useFallback, setUseFallback] = useState(false)

  // Resize canvas to match viewport
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
  }, [])

  // Draw frame with cover-fit
  const drawFrameCover = useCallback((source: ImageBitmap) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const sw = source.width
    const sh = source.height
    const scale = Math.max(cw / sw, ch / sh)
    const dw = sw * scale
    const dh = sh * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2
    ctx.drawImage(source, dx, dy, dw, dh)
  }, [])

  // Extract all frames from video
  const extractFrames = useCallback(async (video: HTMLVideoElement) => {
    const duration = video.duration
    const targetCount = Math.min(Math.max(Math.ceil(duration * fps), 60), maxFrames)
    const interval = duration / targetCount
    const extractedFrames: (ImageBitmap | null)[] = new Array(targetCount)

    // Extract first frame immediately for instant visual
    video.currentTime = 0
    await new Promise<void>((resolve) => {
      video.addEventListener("seeked", () => resolve(), { once: true })
    })
    try {
      const firstFrame = await createImageBitmap(video)
      extractedFrames[0] = firstFrame
      drawFrameCover(firstFrame)
      lastFrameRef.current = 0
    } catch (err) {
      console.warn("Could not extract initial frame", err)
    }

    for (let i = 1; i < targetCount; i++) {
      video.currentTime = i * interval

      await new Promise<void>((resolve) => {
        video.addEventListener("seeked", () => resolve(), { once: true })
      })

      try {
        extractedFrames[i] = await createImageBitmap(video)
      } catch {
        extractedFrames[i] = null
      }

      setLoadProgress(Math.round(((i + 1) / targetCount) * 100))
    }

    framesRef.current = extractedFrames
    setLoading(false)
  }, [fps, maxFrames, drawFrameCover])

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Calculate progress based on the hero section scroll range
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollRange = window.innerHeight * scrollMultiplier
      targetProgressRef.current = Math.min(Math.max(scrollTop / scrollRange, 0), 1)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollMultiplier])

  // Animation loop
  useEffect(() => {
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)

      // Smooth interpolation
      scrollProgressRef.current += (targetProgressRef.current - scrollProgressRef.current) * smoothing
      const t = scrollProgressRef.current
      const totalFrames = totalFrameCountRef.current
      const frames = framesRef.current

      if (totalFrames > 0 && frames.length > 0) {
        const frameIndex = Math.min(Math.floor(t * (totalFrames - 1)), totalFrames - 1)
        if (frameIndex !== lastFrameRef.current && frames[frameIndex]) {
          drawFrameCover(frames[frameIndex]!)
          lastFrameRef.current = frameIndex
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [smoothing, drawFrameCover])

  // Init video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    sizeCanvas()

    const handleMeta = () => {
      video.pause()
      extractFrames(video)
    }

    const handleError = () => {
      setUseFallback(true)
      setLoading(false)
    }

    video.addEventListener("loadedmetadata", handleMeta)
    video.addEventListener("error", handleError)
    video.load()

    const handleResize = () => {
      sizeCanvas()
      const lastFrame = lastFrameRef.current
      if (lastFrame >= 0 && framesRef.current[lastFrame]) {
        drawFrameCover(framesRef.current[lastFrame]!)
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      video.removeEventListener("loadedmetadata", handleMeta)
      video.removeEventListener("error", handleError)
      window.removeEventListener("resize", handleResize)
    }
  }, [sizeCanvas, extractFrames, drawFrameCover])

  return (
    <>
      {/* Hidden video for frame extraction */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", zIndex: -1 }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Display canvas */}
      {!useFallback && (
        <canvas
          ref={canvasRef}
          className={className}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      )}

      {/* Fallback image */}
      {useFallback && fallbackImage && (
        <div
          className={className}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${fallbackImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
      )}

      {/* Loading indicator */}
      {loading && !useFallback && (
        <div 
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 48, height: 48, margin: "0 auto 16px" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "2px solid rgba(255,255,255,0.05)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "2px solid transparent",
                  borderTopColor: "var(--accent-color, #f59e0b)",
                  borderRadius: "50%",
                  animation: "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
                }}
              />
            </div>
            <p style={{ 
              fontSize: "0.65rem", 
              color: "rgba(255,255,255,0.4)", 
              letterSpacing: "0.2em", 
              textTransform: "uppercase",
              fontWeight: 500
            }}>
              Loading {loadProgress}%
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

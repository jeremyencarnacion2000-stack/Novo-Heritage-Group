"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
// @ts-ignore - lucide-react types not resolving correctly
import { ArrowUpRight, Sparkles } from "lucide-react"
import { Magnetic } from "./magnetic"
import Image from "next/image"
import HeroLoadingAnimation from "./hero-loading-animation"

interface HeroProps {
  introFinished: boolean
  onIntroComplete: () => void
}

export function Hero({ introFinished, onIntroComplete }: HeroProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoEnd = () => {
    onIntroComplete()
  }

  // Safety timer to unlock scroll if video fails (12 seconds)
  useEffect(() => {
    if (!introFinished) {
      const timer = setTimeout(() => {
        console.warn("Safety timer triggered: Unlocking scroll manually.")
        onIntroComplete()
      }, 12000)
      return () => clearTimeout(timer)
    }
  }, [introFinished, onIntroComplete])

  // Force video play and high-quality rendering
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Video play failed:", e))
    }
  }, [videoLoaded])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* 4K Cinematic Transition Video */}
      <div className="absolute inset-0 z-0 h-full w-full bg-black">
        {/* Ambient blurred background to match video color effortlessly on mobile letterbars */}
        <video
          src="/Sin título (Video) (1).mp4"
          autoPlay
          muted
          playsInline
          loop
          className={`absolute inset-0 h-full w-full object-cover scale-150 blur-3xl md:hidden transition-opacity duration-1500 ease-out ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        />
        {/* Subtle vignette to preserve white text readability against bright video background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 md:hidden z-[1]" />

        {/* Main sharp video */}
        <video
          ref={videoRef}
          src="/Sin título (Video) (1).mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          onEnded={handleVideoEnd}
          style={{ 
             backfaceVisibility: "hidden", 
             transform: "translateZ(0)",
             WebkitFontSmoothing: "antialiased"
          }}
          className={`relative z-[2] h-full w-full object-contain md:object-cover object-center transition-opacity duration-1500 ease-out ${videoLoaded ? "opacity-100" : "opacity-0"}`}
        />
        
        {/* Subtle Overlay to match UI colors */}
        <div className="absolute inset-0 bg-black/5 mix-blend-multiply pointer-events-none" />
      </div>
      {/* UI Elements - Revealed after Intro */}
      <AnimatePresence>
        {introFinished && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="container h-full relative layout-guide-visual">
              
              {/* Top Left Label - Architectural Typography */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className="absolute top-32 md:top-40 left-6 md:left-8 pointer-events-auto"
              >
                <p className="premium-label mb-3 text-[10px] md:text-xs">
                  Arquitectura & Estilo
                </p>
                <div className="w-16 h-[0.5px] bg-primary/60" />
              </motion.div>
  
              {/* Bottom Left: Get Started - Refined Luxury Styling */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                className="absolute bottom-48 md:bottom-40 left-6 md:left-8 pointer-events-auto w-[calc(100%-3rem)] md:w-auto"
              >
                <Magnetic strength={0.15}>
                   <button className="group relative flex items-center justify-between gap-10 md:gap-16 px-10 md:px-12 py-5 md:py-6 bg-primary text-black transition-all duration-700 hover:scale-[1.02] rounded-none shadow-premium overflow-hidden border border-primary/20 w-full md:w-auto">
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] font-sans z-10">Explorar Destinos</span>
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform z-10" />
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   </button>
                </Magnetic>
              </motion.div>
  
              {/* Right Side: Feature Chips - Glassmorphism v3 */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 1, ease: "easeOut" }}
                className="absolute bottom-24 md:bottom-40 right-6 md:right-8 flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-5 pointer-events-auto"
              >
                {[
                  { label: "LUXURY", delay: 0 },
                  { label: "MODERN", delay: 0.15 },
                  { label: "ECO", delay: 0.3 },
                ].map((chip, i) => (
                  <motion.span 
                    key={chip.label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + chip.delay, duration: 0.8 }}
                    className="px-6 md:px-10 py-2.5 md:py-3 glass-architectural text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-foreground/90 border-b-primary/60 font-sans hover:bg-primary/5 transition-colors cursor-default whitespace-nowrap"
                  >
                    {chip.label}
                  </motion.span>
                ))}
              </motion.div>
  
              {/* Scroll Indicator - Minimalist Premium */}
              <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 2.2, duration: 1.5 }}
                 className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 group cursor-pointer pointer-events-auto"
                 onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              >
                <span className="text-[10px] uppercase tracking-[0.5em] font-semibold text-foreground/60 group-hover:text-primary transition-colors font-sans">Scroll</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-primary/40 to-transparent group-hover:from-primary transition-all duration-700" />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>


      {/* Loading State - Premium Background */}
      {!videoLoaded && (
         <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background">
            <HeroLoadingAnimation />
         </div>
      )}
    </section>
  )
}
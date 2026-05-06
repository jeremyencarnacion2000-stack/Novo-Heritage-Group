"use client"

import { useEffect, ReactNode } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface SmoothScrollProps {
    children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
            syncTouch: true,
            lerp: 0.1,
        })

        // Sync Lenis with GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update)

        const raf = (time: number) => {
            lenis.raf(time * 1000)
        }

        gsap.ticker.add(raf)
        gsap.ticker.lagSmoothing(0)

        // Lock/Unlock listeners
        const handleLock = () => lenis.stop()
        const handleUnlock = () => lenis.start()

        window.addEventListener("lock-scroll", handleLock)
        window.addEventListener("unlock-scroll", handleUnlock)

        // Cleanup
        return () => {
            lenis.destroy()
            gsap.ticker.remove(raf)
            ScrollTrigger.getAll().forEach(t => t.kill())
            window.removeEventListener("lock-scroll", handleLock)
            window.removeEventListener("unlock-scroll", handleUnlock)
        }
    }, [])

    return <>{children}</>
}

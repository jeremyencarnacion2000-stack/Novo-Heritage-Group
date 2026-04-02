"use client"

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface MagneticProps {
    children: React.ReactElement
    strength?: number
}

export const Magnetic: React.FC<MagneticProps> = ({ children, strength = 0.5 }) => {
    const magneticRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = magneticRef.current
        if (!element) return

        const xTo = gsap.quickTo(element, "x", { duration: 1, ease: "elastic.out(1, 0.3)" })
        const yTo = gsap.quickTo(element, "y", { duration: 1, ease: "elastic.out(1, 0.3)" })

        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { height, width, left, top } = element.getBoundingClientRect()
            const x = clientX - (left + width / 2)
            const y = clientY - (top + height / 2)

            xTo(x * strength)
            yTo(y * strength)
        }

        const onMouseLeave = () => {
            xTo(0)
            yTo(0)
        }

        element.addEventListener("mousemove", onMouseMove)
        element.addEventListener("mouseleave", onMouseLeave)

        return () => {
            element.removeEventListener("mousemove", onMouseMove)
            element.removeEventListener("mouseleave", onMouseLeave)
        }
    }, [strength])

    return React.cloneElement(children, { ref: magneticRef })
}

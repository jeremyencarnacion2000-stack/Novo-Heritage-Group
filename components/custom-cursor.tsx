"use client"

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null)
    const followerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const cursor = cursorRef.current
        const follower = followerRef.current

        if (!cursor || !follower) return

        const xSetCursor = gsap.quickSetter(cursor, "x", "px")
        const ySetCursor = gsap.quickSetter(cursor, "y", "px")
        const xSetFollower = gsap.quickSetter(follower, "x", "px")
        const ySetFollower = gsap.quickSetter(follower, "y", "px")

        const onMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e

            xSetCursor(clientX)
            ySetCursor(clientY)

            gsap.to({}, {
                duration: 0.4,
                ease: "power2.out",
                onUpdate: function () {
                    xSetFollower(clientX)
                    ySetFollower(clientY)
                },
                overwrite: "auto"
            })
        }

        const onMouseDown = () => {
            gsap.to([cursor, follower], { scale: 0.8, duration: 0.2 })
        }

        const onMouseUp = () => {
            gsap.to([cursor, follower], { scale: 1, duration: 0.2 })
        }

        const onMouseEnterLink = () => {
            gsap.to(follower, {
                scale: 2.5,
                backgroundColor: "rgba(var(--foreground-rgb), 0.1)",
                borderWidth: "1px",
                duration: 0.3
            })
            gsap.to(cursor, { opacity: 0, duration: 0.3 })
        }

        const onMouseLeaveLink = () => {
            gsap.to(follower, {
                scale: 1,
                backgroundColor: "rgba(var(--foreground-rgb), 0.3)",
                borderWidth: "0px",
                duration: 0.3
            })
            gsap.to(cursor, { opacity: 1, duration: 0.3 })
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)

        const links = document.querySelectorAll('a, button, .magnetic')
        links.forEach(link => {
            link.addEventListener('mouseenter', onMouseEnterLink)
            link.addEventListener('mouseleave', onMouseLeaveLink)
        })

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
            links.forEach(link => {
                link.removeEventListener('mouseenter', onMouseEnterLink)
                link.removeEventListener('mouseleave', onMouseLeaveLink)
            })
        }
    }, [])

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-2 h-2 bg-foreground rounded-full pointer-events-none z-[10000] mix-blend-difference"
                style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
            />
            <div
                ref={followerRef}
                className="fixed top-0 left-0 w-8 h-8 border border-foreground/30 bg-foreground/10 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{ transform: 'translate(-50%, -50%)', willChange: 'transform' }}
            />
        </>
    )
}

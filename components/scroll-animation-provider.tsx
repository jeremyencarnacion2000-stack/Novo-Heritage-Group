"use client"

import { useEffect } from "react"

export function ScrollAnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate")
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(".animate-on-scroll")
    animatedElements.forEach((element) => observer.observe(element))

    return () => {
      animatedElements.forEach((element) => observer.unobserve(element))
    }
  }, [])

  return <>{children}</>
}

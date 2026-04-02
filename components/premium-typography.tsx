"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PremiumHeadingProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  className?: string
  children: React.ReactNode
  gradient?: boolean
  metallic?: boolean
  golden?: boolean
  animated?: boolean
}

export function PremiumHeading({
  as: Component = "h1",
  className,
  children,
  gradient = false,
  metallic = false,
  golden = false,
  animated = false,
  ...props
}: PremiumHeadingProps) {
  const baseClasses = cn(
    "font-serif font-light leading-[1.1] tracking-tight",
    Component === "h1" && "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
    Component === "h2" && "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
    Component === "h3" && "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
    Component === "h4" && "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
    Component === "h5" && "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
    Component === "h6" && "text-lg sm:text-xl md:text-2xl lg:text-3xl",
    gradient && "bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent",
    metallic && "bg-gradient-to-r from-slate-600 via-slate-800 to-slate-600 bg-clip-text text-transparent",
    golden && "bg-gradient-to-r from-yellow-600 via-yellow-800 to-yellow-600 bg-clip-text text-transparent",
    className
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Component className={baseClasses} {...props}>
          {children}
        </Component>
      </motion.div>
    )
  }

  return (
    <Component className={baseClasses} {...props}>
      {children}
    </Component>
  )
}

interface PremiumTextProps {
  className?: string
  children: React.ReactNode
  size?: "sm" | "base" | "lg" | "xl"
  weight?: "normal" | "medium" | "semibold" | "bold"
  gradient?: boolean
  metallic?: boolean
  golden?: boolean
}

export function PremiumText({
  className,
  children,
  size = "base",
  weight = "normal",
  gradient = false,
  metallic = false,
  golden = false,
  ...props
}: PremiumTextProps) {
  const baseClasses = cn(
    "leading-relaxed",
    size === "sm" && "text-sm",
    size === "base" && "text-base",
    size === "lg" && "text-lg",
    size === "xl" && "text-xl",
    weight === "normal" && "font-normal",
    weight === "medium" && "font-medium",
    weight === "semibold" && "font-semibold",
    weight === "bold" && "font-bold",
    gradient && "bg-gradient-to-r from-primary/80 to-secondary/80 bg-clip-text text-transparent",
    metallic && "bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent",
    golden && "bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent",
    className
  )

  return (
    <p className={baseClasses} {...props}>
      {children}
    </p>
  )
}

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export function AnimatedText({ text, className, delay = 0, duration = 0.05 }: AnimatedTextProps) {
  const words = text.split(" ")

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration,
            delay: delay + index * 0.1,
            ease: "easeOut"
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}
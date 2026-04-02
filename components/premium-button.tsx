"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  premium?: boolean
  metallic?: boolean
  golden?: boolean
  children: React.ReactNode
}

export default function PremiumButton({
  className,
  variant = "default",
  premium = false,
  metallic = false,
  golden = false,
  children,
  ...props
}: PremiumButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses = cn(
    "relative overflow-hidden transition-all duration-300",
    premium && "shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105",
    metallic && "bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500 hover:from-slate-400 hover:via-slate-500 hover:to-slate-600 text-slate-900",
    golden && "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-yellow-900 shadow-yellow-500/30",
    className
  )

  return (
    <Button
      className={baseClasses}
      variant={variant}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      {premium && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
          animate={isHovered ? { x: ['-100%', '100%'], opacity: [0, 0.3, 0] } : {}}
          transition={{ duration: 0.8 }}
        />
      )}
    </Button>
  )
}
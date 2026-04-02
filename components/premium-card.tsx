"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"

interface PremiumCardProps {
  className?: string
  children: React.ReactNode
  premium?: boolean
  metallic?: boolean
  golden?: boolean
  interactive?: boolean
}

export default function PremiumCard({
  className,
  children,
  premium = false,
  metallic = false,
  golden = false,
  interactive = true,
  ...props
}: PremiumCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses = cn(
    "relative overflow-hidden transition-all duration-500",
    premium && "hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2",
    metallic && "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400",
    golden && "bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-yellow-300 hover:from-yellow-100 hover:via-yellow-200 hover:to-yellow-300",
    interactive && "cursor-pointer",
    className
  )

  return (
    <motion.div
      className={baseClasses}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...(props as any)}
    >
      {metallic && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-150%" }}
          animate={{ x: isHovered ? "150%" : "-150%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}

      {golden && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent"
          initial={{ x: "-150%" }}
          animate={{ x: isHovered ? "150%" : "-150%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Enhanced Card components with premium effects
export function PremiumCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn("relative", className)} {...props} />
}

export function PremiumCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("relative", className)} {...props} />
}

export function PremiumCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return <CardFooter className={cn("relative", className)} {...props} />
}
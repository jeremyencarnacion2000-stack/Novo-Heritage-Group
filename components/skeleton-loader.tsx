"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "default" | "card" | "text" | "avatar" | "button"
  animate?: boolean
}

export function Skeleton({ 
  className, 
  variant = "default", 
  animate = true 
}: SkeletonProps) {
  const variants = {
    default: "h-4 w-full",
    card: "h-48 w-full rounded-none",
    text: "h-4 w-3/4",
    avatar: "h-10 w-10 rounded-none",
    button: "h-10 w-24 rounded-none"
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-none",
        variants[variant],
        animate && "animate-pulse",
        className
      )}
      aria-hidden="true"
    />
  )
}

// Pre-built skeleton components
export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl rounded-none border border-border/20">
      <Skeleton variant="avatar" className="h-12 w-12" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
      <Skeleton variant="button" className="h-10 w-full" />
    </div>
  )
}

export function BlogPostSkeleton() {
  return (
    <div className="space-y-4 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl rounded-none border border-border/20 overflow-hidden">
      <Skeleton variant="card" className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="avatar" className="h-6 w-6" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" className="h-6 w-full" />
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="button" className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="space-y-4 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl rounded-none border border-border/20 overflow-hidden">
      <Skeleton variant="card" className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton variant="text" className="h-5 w-3/4" />
          <Skeleton variant="text" className="h-4 w-1/2" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-6 w-24" />
          <Skeleton variant="button" className="h-8 w-28" />
        </div>
      </div>
    </div>
  )
}

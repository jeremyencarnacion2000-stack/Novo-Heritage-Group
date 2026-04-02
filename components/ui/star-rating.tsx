"use client"

import { useState } from "react"
// @ts-ignore - lucide-react types not resolving correctly
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  setRating?: (rating: number) => void
  readOnly?: boolean
  size?: number
}

export function StarRating({ rating, setRating, readOnly = false, size = 20 }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1
        return (
          <button
            key={index}
            type="button"
            disabled={readOnly}
            onClick={() => setRating && setRating(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(null)}
            className={cn("cursor-pointer transition-colors", { "cursor-default": readOnly })}
          >
            <Star
              className={cn(
                "transition-colors",
                ratingValue <= (hover || rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-muted-foreground/30"
              )}
              style={{ width: size, height: size }}
            />
          </button>
        )
      })}
    </div>
  )
}

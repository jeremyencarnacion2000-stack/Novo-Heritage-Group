"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface EnhancedImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
  blurDataURL?: string
  priority?: boolean
  quality?: number
  width?: number
  height?: number
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  placeholder?: "blur" | "empty"
  loading?: "lazy" | "eager"
  onLoad?: () => void
  onError?: () => void
}

// Enhanced blur placeholder generation
const generateBlurPlaceholder = (width: number = 16, height: number = 9) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Create a sophisticated gradient blur using actual HSL values
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, 'hsla(220, 90%, 45%, 0.1)') // primary with opacity
    gradient.addColorStop(0.5, 'hsla(35, 85%, 60%, 0.05)') // secondary with opacity
    gradient.addColorStop(1, 'hsla(160, 70%, 50%, 0.1)') // accent with opacity

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add subtle pattern
    ctx.fillStyle = 'hsla(220, 90%, 45%, 0.05)'
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 4 + 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return canvas.toDataURL()
}

export function EnhancedImage({
  src,
  alt,
  className,
  fallback = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==",
  blurDataURL,
  priority = false,
  quality = 75,
  width,
  height,
  objectFit = "cover",
  placeholder = "blur",
  loading = "lazy",
  onLoad,
  onError
}: EnhancedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const [generatedBlurDataURL, setGeneratedBlurDataURL] = useState<string>('')

  useEffect(() => {
    // Generate sophisticated blur placeholder on mount
    setGeneratedBlurDataURL(generateBlurPlaceholder(32, 18))
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (fallback && fallback !== imageSrc) {
      setImageSrc(fallback)
    }
    onError?.()
  }

  return (
    <div className={cn("relative overflow-hidden group", className)}>
      {/* Enhanced loading skeleton with sophisticated blur */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 animate-pulse rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-elegant-shimmer" />
        </div>
      )}

      {/* Enhanced error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 flex items-center justify-center rounded-lg border border-primary/10">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-primary/60 font-medium">Premium Image</p>
            <p className="text-xs text-primary/40">Loading...</p>
          </div>
        </div>
      )}

      {/* Actual image with enhanced transitions */}
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-all duration-1000 ease-out transform group-hover:scale-105",
          isLoading ? "opacity-0 scale-110 blur-sm" : "opacity-100 scale-100 blur-0",
          hasError ? "opacity-50" : "opacity-100",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down"
        )}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
        }}
      />

      {/* Enhanced hover overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}

// Predefined image sources from various banks
export const ImageSources = {
  // Unsplash (free, high-quality images)
  business: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center",
  insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&crop=center",
  realEstate: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center",
  travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&crop=center",
  luxury: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center",
  car: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center",
  home: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center",
  family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop&crop=center",
  
  // Pexels (free, high-quality images)
  office: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=800&h=600&fit=crop&crop=center",
  team: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=800&h=600&fit=crop&crop=center",
  success: "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?w=800&h=600&fit=crop&crop=center",
  
  // Lorem Picsum (placeholder images with specific dimensions)
  placeholder: (width: number = 800, height: number = 600, seed?: number) => 
    `https://picsum.photos/${width}/${height}${seed ? `?random=${seed}` : ''}`,
  
  // Custom gradients for fallbacks
  gradient: {
    primary: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+",
    secondary: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+",
    accent: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZWZlZmUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+"
  }
}

// Specialized image components for different use cases
export function BusinessImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.business} alt="Business professionals" className={className} {...props} />
}

export function InsuranceImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.insurance} alt="Insurance protection" className={className} {...props} />
}

export function RealEstateImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.realEstate} alt="Luxury real estate" className={className} {...props} />
}

export function TravelImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.travel} alt="Travel destination" className={className} {...props} />
}

export function LuxuryImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.luxury} alt="Luxury lifestyle" className={className} {...props} />
}

export function CarImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.car} alt="Luxury car" className={className} {...props} />
}

export function HomeImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.home} alt="Beautiful home" className={className} {...props} />
}

export function FamilyImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.family} alt="Happy family" className={className} {...props} />
}

export function OfficeImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.office} alt="Modern office" className={className} {...props} />
}

export function TeamImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.team} alt="Professional team" className={className} {...props} />
}

export function SuccessImage({ className, ...props }: Omit<EnhancedImageProps, 'src' | 'alt'>) {
  return <EnhancedImage src={ImageSources.success} alt="Success and growth" className={className} {...props} />
}

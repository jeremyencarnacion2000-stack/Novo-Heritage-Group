"use client"

import dynamic from 'next/dynamic'

// Dynamically import the Particles component with SSR disabled
const ParticlesComponent = dynamic(() => import('./particles').then(mod => ({ default: mod.Particles })), {
  ssr: false,
  loading: () => null // No loading state for particles
})

interface ParticlesClientProps {
  speed: number
  aperture: number
  focus: number
  size: number
  noiseScale?: number
  noiseIntensity?: number
  timeScale?: number
  pointSize?: number
  opacity?: number
  planeScale?: number
  useManualTime?: boolean
  manualTime?: number
  introspect?: boolean
}

export function ParticlesClient(props: ParticlesClientProps) {
  return <ParticlesComponent {...props} />
}
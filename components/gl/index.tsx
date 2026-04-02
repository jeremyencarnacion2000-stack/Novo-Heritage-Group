"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"

import { cn } from "@/lib/utils"

interface GLProps {
  hovering?: boolean
  className?: string
}

const PARTICLE_COUNT = 1400

function ParticleField({ hovering = false }: { hovering?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const data = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const idx = i * 3
      data[idx] = (Math.random() - 0.5) * 10
      data[idx + 1] = (Math.random() - 0.25) * 6
      data[idx + 2] = (Math.random() - 0.5) * 10
    }
    return data
  }, [])

  const colors = useMemo(() => {
    const data = new Float32Array(PARTICLE_COUNT * 3)
    const colorA = new THREE.Color("#fef3c7")
    const colorB = new THREE.Color("#38bdf8")

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const idx = i * 3
      const lerpValue = Math.random()
      const mixed = colorA.clone().lerp(colorB, lerpValue)
      data[idx] = mixed.r
      data[idx + 1] = mixed.g
      data[idx + 2] = mixed.b
    }
    return data
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const { clock } = state
    const t = clock.elapsedTime

    pointsRef.current.rotation.y = t * 0.08
    pointsRef.current.rotation.x = Math.sin(t * 0.12) * 0.2

    const material = pointsRef.current.material as THREE.PointsMaterial
    material.opacity = THREE.MathUtils.lerp(material.opacity ?? 0.6, hovering ? 0.95 : 0.65, 0.05)
    material.size = THREE.MathUtils.lerp(material.size, hovering ? 0.09 : 0.06, 0.05)
  })

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        sizeAttenuation
        vertexColors
        depthWrite={false}
        transparent
        blending={THREE.AdditiveBlending}
        opacity={0.7}
        size={0.06}
      />
    </points>
  )
}

export const GL = ({ hovering = false, className }: GLProps) => {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <Canvas
        className="[mask-image:radial-gradient(circle_at_center,rgba(255,255,255,0.9),transparent_70%)]"
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.6} />
        <Suspense fallback={null}>
          <ParticleField hovering={hovering} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
    </div>
  )
}

"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)

function HeroVehicle({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useLoader(GLTFLoader, "/models/porsche911turboS2021/scene.gltf")

  const car = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.scale.set(2.4, 2.4, 2.4)
    cloned.rotation.y = Math.PI * 0.15
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat && "envMapIntensity" in mat) {
              mat.envMapIntensity = 0.8
            }
          })
        } else if (child.material && "envMapIntensity" in child.material) {
          child.material.envMapIntensity = 0.8
        }
      }
    })
    return cloned
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const easedProgress = THREE.MathUtils.damp(0, scrollProgress, 0.15, delta)
    const targetY = THREE.MathUtils.lerp(0.5, -0.4, easedProgress)
    const targetXRotation = THREE.MathUtils.lerp(0.25, -0.15, easedProgress)
    const targetYRotation = Math.PI * (0.2 + easedProgress * 0.4)
    const floatOffset = Math.sin(Date.now() * 0.0018) * 0.05

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY + floatOffset, 0.08)
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, THREE.MathUtils.lerp(0, -0.4, easedProgress), 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetXRotation, 0.08)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYRotation, 0.08)
  })

  return <primitive ref={groupRef} object={car} position={[0, 0, 0]} />
}

export function Model3D() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    let frame: number | null = null
    const handleScroll = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.body.scrollHeight - window.innerHeight
        const progress = max > 0 ? window.scrollY / max : 0
        setScrollProgress(clamp(progress))
      })
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0.7, 5.5], fov: 35 }}
        dpr={[1, 1.5]}
        className="[mask-image:radial-gradient(circle_at_center,rgba(0,0,0,0.9),transparent_80%)]"
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#f59e0b" />
        <spotLight position={[0, 4, 2]} angle={0.6} penumbra={0.4} intensity={0.8} color="#38bdf8" />
        <Suspense fallback={null}>
          <HeroVehicle scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
    </div>
  )
}

useLoader.preload(GLTFLoader, "/models/porsche911turboS2021/scene.gltf")
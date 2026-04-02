"use client"

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registrar ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type PositionModel = {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
};

// Configuración premium para el efecto exacto del video - adjusted for new camera position
const modelConfigs = {
  hero: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    camera: { x: 0, y: 1.5, z: 4 }
  },
  scrollLeft: {
    position: { x: -1, y: 0, z: 0 },
    rotation: { x: 0, y: 0.3, z: 0 },
    scale: { x: 1.05, y: 1.05, z: 1.05 },
    camera: { x: 0.5, y: 1.5, z: 4 }
  },
  pinning: {
    position: { x: -0.8, y: 0, z: 0 },
    rotation: { x: 0, y: 0.2, z: 0 },
    scale: { x: 1.08, y: 1.08, z: 1.08 },
    camera: { x: 0.2, y: 1.5, z: 4 }
  },
  tour1: {
    position: { x: -1, y: 0.2, z: 0.4 },
    rotation: { x: -0.1, y: 0.5, z: 0.1 },
    scale: { x: 1.12, y: 1.12, z: 1.12 },
    camera: { x: -0.4, y: 1.7, z: 3.8 }
  },
  tour2: {
    position: { x: -0.7, y: -0.1, z: -0.4 },
    rotation: { x: 0.2, y: -0.3, z: -0.1 },
    scale: { x: 1.06, y: 1.06, z: 1.06 },
    camera: { x: 0.5, y: 1.3, z: 4.2 }
  },
  exit: {
    position: { x: -1.6, y: 0.8, z: 1.2 },
    rotation: { x: 0.3, y: 1, z: 0.2 },
    scale: { x: 0.9, y: 0.9, z: 0.9 },
    camera: { x: 0.8, y: 2.3, z: 4.8 }
  }
}

// Array de configuraciones de posición para el modelo - adjusted for new camera position
const arrPositionModel: PositionModel[] = [
  {
    id: 'hero',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  },
  {
    id: 'scrollLeft',
    position: { x: -1, y: 0, z: 0 },
    rotation: { x: 0, y: 0.3, z: 0 },
    scale: { x: 1.05, y: 1.05, z: 1.05 }
  },
  {
    id: 'pinning',
    position: { x: -0.8, y: 0, z: 0 },
    rotation: { x: 0, y: 0.2, z: 0 },
    scale: { x: 1.08, y: 1.08, z: 1.08 }
  },
  {
    id: 'tour1',
    position: { x: -1, y: 0.2, z: 0.4 },
    rotation: { x: -0.1, y: 0.5, z: 0.1 },
    scale: { x: 1.12, y: 1.12, z: 1.12 }
  },
  {
    id: 'tour2',
    position: { x: -0.7, y: -0.1, z: -0.4 },
    rotation: { x: 0.2, y: -0.3, z: -0.1 },
    scale: { x: 1.06, y: 1.06, z: 1.06 }
  },
  {
    id: 'exit',
    position: { x: -1.6, y: 0.8, z: 1.2 },
    rotation: { x: 0.3, y: 1, z: 0.2 },
    scale: { x: 0.9, y: 0.9, z: 0.9 }
  }
]

export function Seguros3DModel({ scrollProgress = 0, section = 'hero' }: { scrollProgress?: number, section?: string }) {
  const [isMobile, setIsMobile] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<THREE.Group | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const animationRef = useRef<number>(0)
  const scrollProgressRef = useRef<number>(0)

  useEffect(() => {
    // Mobile detection
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize camera with fixed position for optimal viewing
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 1.5, 4)
    cameraRef.current = camera

    // Initialize renderer - Optimizado para móviles
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile, // Desactivar antialiasing en móviles para mejor rendimiento
      powerPreference: isMobile ? "low-power" : "high-performance" // Preferencia de energía según dispositivo
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 0.8 : 2)) // Reducir pixel ratio aún más en móviles
    renderer.shadowMap.enabled = !isMobile // Desactivar sombras en móviles para mejor rendimiento
    if (!isMobile) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.shadowMap.autoUpdate = true
    }
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Premium dark lighting setup - estilo luxury tech
    const ambientLight = new THREE.AmbientLight(0x1a1a1a, 0.4)
    scene.add(ambientLight)

    // Luz principal dramática desde arriba
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0)
    mainLight.position.set(0, 15, 5)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 4096
    mainLight.shadow.mapSize.height = 4096
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 50
    mainLight.shadow.camera.left = -15
    mainLight.shadow.camera.right = 15
    mainLight.shadow.camera.top = 15
    mainLight.shadow.camera.bottom = -15
    mainLight.shadow.bias = -0.0001
    scene.add(mainLight)

    // Luz de relleno cálida desde el lado
    const fillLight = new THREE.DirectionalLight(0xffb347, 0.6)
    fillLight.position.set(-8, 8, 8)
    scene.add(fillLight)

    // Luz de borde dorada para efecto premium
    const rimLight = new THREE.DirectionalLight(0xffd700, 1.2)
    rimLight.position.set(5, -10, -15)
    scene.add(rimLight)

    // Luz puntual para highlights especulares
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 50)
    pointLight.position.set(0, 8, 10)
    scene.add(pointLight)

    // Luz adicional para sombras suaves
    const softLight = new THREE.DirectionalLight(0x404040, 0.3)
    softLight.position.set(0, -5, 5)
    scene.add(softLight)

    // Load Porsche GT3 model
    const loader = new GLTFLoader()
    loader.load(
      '/models/porsche911turboS2021/scene.gltf',
      (gltf) => {
        const car = gltf.scene
        modelRef.current = car
        scene.add(car)

        // Automatic centering and scaling with scale factor 3
        const modelScale = 3
        car.scale.set(modelScale, modelScale, modelScale)

        // Center the model automatically
        const box = new THREE.Box3().setFromObject(car)
        const center = box.getCenter(new THREE.Vector3())
        car.position.sub(center) // Center the model

        car.rotation.y = Math.PI * 0.8 // Slightly angled for better view

        // Enable shadows and remove unwanted orange cube
        car.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Enhanced detection for orange/red cube or placeholder meshes
            const isCubeLike = child.geometry && (
              child.geometry.type === 'BoxGeometry' ||
              child.geometry.type === 'BoxBufferGeometry' ||
              (child.geometry.type === 'BufferGeometry' && child.geometry.attributes?.position?.count === 24) // Cube has 8 vertices * 3 coordinates
            )

            const hasCubeName = child.name && (
              child.name.toLowerCase().includes('cube') ||
              child.name.toLowerCase().includes('box') ||
              child.name.toLowerCase().includes('placeholder')
            )

            let isOrangeRed = false
            if (child.material) {
              const checkMaterialColor = (mat: THREE.Material) => {
                if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshBasicMaterial) {
                  const color = mat.color
                  // Expanded thresholds: orange/red colors (high red, low blue, any green)
                  if (color.r > 0.6 && color.b < 0.4) {
                    return true
                  }
                }
                return false
              }

              if (Array.isArray(child.material)) {
                isOrangeRed = child.material.some(checkMaterialColor)
              } else {
                isOrangeRed = checkMaterialColor(child.material)
              }
            }

            // Log mesh details for debugging
            console.log(`Mesh: ${child.name}, Geometry: ${child.geometry?.type}, Color: ${child.material?.color ? `r:${child.material.color.r.toFixed(2)}, g:${child.material.color.g.toFixed(2)}, b:${child.material.color.b.toFixed(2)}` : 'N/A'}`)

            if ((isCubeLike || hasCubeName) && isOrangeRed) {
              console.log(`Removing orange/red cube/placeholder mesh: ${child.name}`)
              // Remove the mesh from its parent
              if (child.parent) {
                child.parent.remove(child)
              }
              return // Skip further processing for this mesh
            }

            child.castShadow = true
            child.receiveShadow = true
            // Enhance materials for premium look
            if (child.material) {
              child.material.metalness = 0.8
              child.material.roughness = 0.2
              child.material.envMapIntensity = 1.5
            }
          }
        })

        // Setup animation if available
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(car)
          mixerRef.current = mixer
          mixer.clipAction(gltf.animations[0]).play()
        }

        // Set initial position
        moveModelToSection('hero')

        // Animación de rotación suave constante - estilo premium
        const continuousRotation = gsap.to(car.rotation, {
          y: Math.PI * 2,
          duration: 25,
          ease: "none",
          repeat: -1
        })

        // ===== ANIMACIONES PREMIUM DE SCROLL - EFECTO EXACTO DEL VIDEO =====

        // 1. Hero → Scroll: Modelo se mueve a la izquierda con texto entrando
        const heroToScroll = gsap.timeline({
          scrollTrigger: {
            trigger: "#seguros-hero",
            start: "top top",
            end: "bottom center",
            scrub: 1,
          }
        })

        heroToScroll
          .to(car.position, {
            x: -3,
            duration: 2,
            ease: "power2.out"
          }, 0)
          .to(car.rotation, {
            y: 0.3,
            duration: 2,
            ease: "power2.out"
          }, 0)
          .to(car.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 2,
            ease: "power2.out"
          }, 0)
          .to(camera.position, {
            x: 1,
            duration: 2,
            ease: "power2.out"
          }, 0)

        // 2. Sección con pinning - Modelo se fija mientras texto cambia
        const pinningSection = gsap.timeline({
          scrollTrigger: {
            trigger: "#pinning-showcase",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: true,
            pinSpacing: true
          }
        })

        pinningSection
          // Tour sutil del objeto durante el pinning
          .to(car.position, {
            x: -2.5,
            y: 0.5,
            z: 1,
            duration: 3,
            ease: "power1.inOut"
          }, 0)
          .to(car.rotation, {
            x: -0.1,
            y: 0.5,
            z: 0.1,
            duration: 3,
            ease: "power1.inOut"
          }, 0)
          .to(car.scale, {
            x: 1.2,
            y: 1.2,
            z: 1.2,
            duration: 3,
            ease: "power1.inOut"
          }, 0)
          .to(camera.position, {
            x: -1,
            y: 1,
            z: 12,
            duration: 3,
            ease: "power1.inOut"
          }, 0)
          // Segundo movimiento del tour
          .to(car.position, {
            x: -1.8,
            y: -0.3,
            z: -1,
            duration: 3,
            ease: "power1.inOut"
          }, 3)
          .to(car.rotation, {
            x: 0.2,
            y: -0.3,
            z: -0.1,
            duration: 3,
            ease: "power1.inOut"
          }, 3)
          .to(car.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 3,
            ease: "power1.inOut"
          }, 3)
          .to(camera.position, {
            x: 1,
            y: -0.5,
            z: 14,
            duration: 3,
            ease: "power1.inOut"
          }, 3)

        // 3. Transición de salida elegante
        const exitTransition = gsap.timeline({
          scrollTrigger: {
            trigger: "#exit-transition",
            start: "top center",
            end: "bottom top",
            scrub: 1,
          }
        })

        exitTransition
          .to(car.position, {
            x: -4,
            y: 2,
            z: 3,
            duration: 2,
            ease: "power2.in"
          }, 0)
          .to(car.rotation, {
            x: 0.3,
            y: 1,
            z: 0.2,
            duration: 2,
            ease: "power2.in"
          }, 0)
          .to(car.scale, {
            x: 0.8,
            y: 0.8,
            z: 0.8,
            duration: 2,
            ease: "power2.in"
          }, 0)
          .to(car, {
            opacity: 0,
            duration: 1.5,
            ease: "power2.in"
          }, 0.5)
          .to(camera.position, {
            x: 2,
            y: 3,
            z: 16,
            duration: 2,
            ease: "power2.in"
          }, 0)
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error)
      }
    )

    // Animation loop - Optimizado para móviles
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      if (mixerRef.current) {
        mixerRef.current.update(0.02)
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    // Reducir frame rate en móviles para mejor rendimiento
    if (isMobile) {
      let frameCount = 0
      const throttledAnimate = () => {
        frameCount++
        if (frameCount % 2 === 0) { // Render cada 2 frames en móviles
          animate()
        } else {
          animationRef.current = requestAnimationFrame(throttledAnimate)
        }
      }
      throttledAnimate()
    } else {
      animate()
    }

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Handle scroll with GSAP ScrollTrigger for smoother animations
    const handleScroll = () => {
      if (modelRef.current) {
        modelMove()
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Add mouse interaction for dynamic lighting
    const handleMouseMove = (event: MouseEvent) => {
      if (!pointLight) return

      const mouseX = (event.clientX / window.innerWidth) * 2 - 1
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1

      gsap.to(pointLight.position, {
        x: mouseX * 5,
        y: mouseY * 5,
        z: 10,
        duration: 0.5,
        ease: "power2.out"
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationRef.current)

      if (rendererRef.current) {
        rendererRef.current.dispose()
      }

      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [])

  // Scroll-based animations
  useEffect(() => {
    if (!modelRef.current || !cameraRef.current) return

    let animationFrameId: number

    const updateModelFromScroll = () => {
      if (!modelRef.current || !cameraRef.current) return

      let targetConfig
      let progress = scrollProgress

      // Determine which animation phase we're in based on scroll progress
      if (progress < 0.3) {
        // Hero to Scroll Left phase
        const phaseProgress = progress / 0.3
        const heroConfig = modelConfigs.hero
        const scrollConfig = modelConfigs.scrollLeft

        targetConfig = {
          position: {
            x: heroConfig.position.x + (scrollConfig.position.x - heroConfig.position.x) * phaseProgress,
            y: heroConfig.position.y + (scrollConfig.position.y - heroConfig.position.y) * phaseProgress,
            z: heroConfig.position.z + (scrollConfig.position.z - heroConfig.position.z) * phaseProgress
          },
          rotation: {
            x: heroConfig.rotation.x + (scrollConfig.rotation.x - heroConfig.rotation.x) * phaseProgress,
            y: heroConfig.rotation.y + (scrollConfig.rotation.y - heroConfig.rotation.y) * phaseProgress,
            z: heroConfig.rotation.z + (scrollConfig.rotation.z - heroConfig.rotation.z) * phaseProgress
          },
          scale: {
            x: heroConfig.scale.x + (scrollConfig.scale.x - heroConfig.scale.x) * phaseProgress,
            y: heroConfig.scale.y + (scrollConfig.scale.y - heroConfig.scale.y) * phaseProgress,
            z: heroConfig.scale.z + (scrollConfig.scale.z - heroConfig.scale.z) * phaseProgress
          },
          camera: {
            x: heroConfig.camera.x + (scrollConfig.camera.x - heroConfig.camera.x) * phaseProgress,
            y: heroConfig.camera.y + (scrollConfig.camera.y - heroConfig.camera.y) * phaseProgress,
            z: heroConfig.camera.z + (scrollConfig.camera.z - heroConfig.camera.z) * phaseProgress
          }
        }
      } else if (progress < 0.7) {
        // Pinning phase with tour
        const tourProgress = (progress - 0.3) / 0.4
        const pinningConfig = modelConfigs.pinning

        if (tourProgress < 0.33) {
          // Tour 1
          const tour1Progress = tourProgress / 0.33
          targetConfig = {
            position: {
              x: pinningConfig.position.x + (modelConfigs.tour1.position.x - pinningConfig.position.x) * tour1Progress,
              y: pinningConfig.position.y + (modelConfigs.tour1.position.y - pinningConfig.position.y) * tour1Progress,
              z: pinningConfig.position.z + (modelConfigs.tour1.position.z - pinningConfig.position.z) * tour1Progress
            },
            rotation: {
              x: pinningConfig.rotation.x + (modelConfigs.tour1.rotation.x - pinningConfig.rotation.x) * tour1Progress,
              y: pinningConfig.rotation.y + (modelConfigs.tour1.rotation.y - pinningConfig.rotation.y) * tour1Progress,
              z: pinningConfig.rotation.z + (modelConfigs.tour1.rotation.z - pinningConfig.rotation.z) * tour1Progress
            },
            scale: {
              x: pinningConfig.scale.x + (modelConfigs.tour1.scale.x - pinningConfig.scale.x) * tour1Progress,
              y: pinningConfig.scale.y + (modelConfigs.tour1.scale.y - pinningConfig.scale.y) * tour1Progress,
              z: pinningConfig.scale.z + (modelConfigs.tour1.scale.z - pinningConfig.scale.z) * tour1Progress
            },
            camera: {
              x: pinningConfig.camera.x + (modelConfigs.tour1.camera.x - pinningConfig.camera.x) * tour1Progress,
              y: pinningConfig.camera.y + (modelConfigs.tour1.camera.y - pinningConfig.camera.y) * tour1Progress,
              z: pinningConfig.camera.z + (modelConfigs.tour1.camera.z - pinningConfig.camera.z) * tour1Progress
            }
          }
        } else if (tourProgress < 0.66) {
          // Tour 2
          const tour2Progress = (tourProgress - 0.33) / 0.33
          targetConfig = {
            position: {
              x: modelConfigs.tour1.position.x + (modelConfigs.tour2.position.x - modelConfigs.tour1.position.x) * tour2Progress,
              y: modelConfigs.tour1.position.y + (modelConfigs.tour2.position.y - modelConfigs.tour1.position.y) * tour2Progress,
              z: modelConfigs.tour1.position.z + (modelConfigs.tour2.position.z - modelConfigs.tour1.position.z) * tour2Progress
            },
            rotation: {
              x: modelConfigs.tour1.rotation.x + (modelConfigs.tour2.rotation.x - modelConfigs.tour1.rotation.x) * tour2Progress,
              y: modelConfigs.tour1.rotation.y + (modelConfigs.tour2.rotation.y - modelConfigs.tour1.rotation.y) * tour2Progress,
              z: modelConfigs.tour1.rotation.z + (modelConfigs.tour2.rotation.z - modelConfigs.tour1.rotation.z) * tour2Progress
            },
            scale: {
              x: modelConfigs.tour1.scale.x + (modelConfigs.tour2.scale.x - modelConfigs.tour1.scale.x) * tour2Progress,
              y: modelConfigs.tour1.scale.y + (modelConfigs.tour2.scale.y - modelConfigs.tour1.scale.y) * tour2Progress,
              z: modelConfigs.tour1.scale.z + (modelConfigs.tour2.scale.z - modelConfigs.tour1.scale.z) * tour2Progress
            },
            camera: {
              x: modelConfigs.tour1.camera.x + (modelConfigs.tour2.camera.x - modelConfigs.tour1.camera.x) * tour2Progress,
              y: modelConfigs.tour1.camera.y + (modelConfigs.tour2.camera.y - modelConfigs.tour1.camera.y) * tour2Progress,
              z: modelConfigs.tour1.camera.z + (modelConfigs.tour2.camera.z - modelConfigs.tour1.camera.z) * tour2Progress
            }
          }
        } else {
          // Back to pinning position
          const backProgress = (tourProgress - 0.66) / 0.34
          targetConfig = {
            position: {
              x: modelConfigs.tour2.position.x + (pinningConfig.position.x - modelConfigs.tour2.position.x) * backProgress,
              y: modelConfigs.tour2.position.y + (pinningConfig.position.y - modelConfigs.tour2.position.y) * backProgress,
              z: modelConfigs.tour2.position.z + (pinningConfig.position.z - modelConfigs.tour2.position.z) * backProgress
            },
            rotation: {
              x: modelConfigs.tour2.rotation.x + (pinningConfig.rotation.x - modelConfigs.tour2.rotation.x) * backProgress,
              y: modelConfigs.tour2.rotation.y + (pinningConfig.rotation.y - modelConfigs.tour2.rotation.y) * backProgress,
              z: modelConfigs.tour2.rotation.z + (pinningConfig.rotation.z - modelConfigs.tour2.rotation.z) * backProgress
            },
            scale: {
              x: modelConfigs.tour2.scale.x + (pinningConfig.scale.x - modelConfigs.tour2.scale.x) * backProgress,
              y: modelConfigs.tour2.scale.y + (pinningConfig.scale.y - modelConfigs.tour2.scale.y) * backProgress,
              z: modelConfigs.tour2.scale.z + (pinningConfig.scale.z - modelConfigs.tour2.scale.z) * backProgress
            },
            camera: {
              x: modelConfigs.tour2.camera.x + (pinningConfig.camera.x - modelConfigs.tour2.camera.x) * backProgress,
              y: modelConfigs.tour2.camera.y + (pinningConfig.camera.y - modelConfigs.tour2.camera.y) * backProgress,
              z: modelConfigs.tour2.camera.z + (pinningConfig.camera.z - modelConfigs.tour2.camera.z) * backProgress
            }
          }
        }
      } else {
        // Exit transition - fade out and translate up
        const exitProgress = (progress - 0.7) / 0.3
        const pinningConfig = modelConfigs.pinning
        const exitConfig = modelConfigs.exit

        targetConfig = {
          position: {
            x: pinningConfig.position.x + (exitConfig.position.x - pinningConfig.position.x) * exitProgress,
            y: pinningConfig.position.y + (exitConfig.position.y - pinningConfig.position.y) * exitProgress,
            z: pinningConfig.position.z + (exitConfig.position.z - pinningConfig.position.z) * exitProgress
          },
          rotation: {
            x: pinningConfig.rotation.x + (exitConfig.rotation.x - pinningConfig.rotation.x) * exitProgress,
            y: pinningConfig.rotation.y + (exitConfig.rotation.y - pinningConfig.rotation.y) * exitProgress,
            z: pinningConfig.rotation.z + (exitConfig.rotation.z - pinningConfig.rotation.z) * exitProgress
          },
          scale: {
            x: pinningConfig.scale.x + (exitConfig.scale.x - pinningConfig.scale.x) * exitProgress,
            y: pinningConfig.scale.y + (exitConfig.scale.y - pinningConfig.scale.y) * exitProgress,
            z: pinningConfig.scale.z + (exitConfig.scale.z - pinningConfig.scale.z) * exitProgress
          },
          camera: {
            x: pinningConfig.camera.x + (exitConfig.camera.x - pinningConfig.camera.x) * exitProgress,
            y: pinningConfig.camera.y + (exitConfig.camera.y - pinningConfig.camera.y) * exitProgress,
            z: pinningConfig.camera.z + (exitConfig.camera.z - pinningConfig.camera.z) * exitProgress
          }
        }
      }

      // Apply smooth transitions using GSAP for fluid animation
      gsap.to(modelRef.current.position, {
        x: targetConfig.position.x,
        y: targetConfig.position.y,
        z: targetConfig.position.z,
        duration: 0.1,
        ease: "none"
      })

      gsap.to(modelRef.current.rotation, {
        x: targetConfig.rotation.x,
        y: targetConfig.rotation.y,
        z: targetConfig.rotation.z,
        duration: 0.1,
        ease: "none"
      })

      gsap.to(modelRef.current.scale, {
        x: targetConfig.scale.x,
        y: targetConfig.scale.y,
        z: targetConfig.scale.z,
        duration: 0.1,
        ease: "none"
      })

      if (cameraRef.current) {
        gsap.to(cameraRef.current.position, {
          x: targetConfig.camera.x,
          y: targetConfig.camera.y,
          z: targetConfig.camera.z,
          duration: 0.1,
          ease: "none"
        })
      }

      // Handle fade out in exit phase
      if (progress > 0.7 && sceneRef.current) {
        const fadeProgress = (progress - 0.7) / 0.3
        if (modelRef.current) {
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.opacity = 1 - fadeProgress
                    mat.transparent = true
                  }
                })
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.opacity = 1 - fadeProgress
                child.material.transparent = true
              }
            }
          })
        }
      }
    }

    // Use requestAnimationFrame for smooth updates
    const animate = () => {
      updateModelFromScroll()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [scrollProgress, modelConfigs])

  const modelMove = () => {
    if (!modelRef.current) return

    const sections = document.querySelectorAll('.section')
    let currentSection
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect()
      if (rect.top <= window.innerHeight / 3) {
        currentSection = section.id
      }
    })

    let position_active = arrPositionModel.findIndex(
      (val) => val.id == currentSection
    )

    if (position_active >= 0) {
      let new_coordinates = arrPositionModel[position_active]

      // Animate position
      gsap.to(modelRef.current.position, {
        x: new_coordinates.position.x,
        y: new_coordinates.position.y,
        z: new_coordinates.position.z,
        duration: 3,
        ease: "power1.out"
      })

      // Animate rotation
      gsap.to(modelRef.current.rotation, {
        x: new_coordinates.rotation.x,
        y: new_coordinates.rotation.y,
        z: new_coordinates.rotation.z,
        duration: 3,
        ease: "power1.out"
      })

      // Animate scale
      gsap.to(modelRef.current.scale, {
        x: new_coordinates.scale.x,
        y: new_coordinates.scale.y,
        z: new_coordinates.scale.z,
        duration: 3,
        ease: "power1.out"
      })
    }
  }

  const moveModelToSection = (forceSection?: string) => {
    if (!modelRef.current) return

    let currentSection = forceSection

    if (!forceSection) {
      modelMove()
    } else {
      const positionData = arrPositionModel.find(pos => pos.id === currentSection)

      if (positionData && modelRef.current) {
        // Set initial position without animation
        modelRef.current.position.set(
          positionData.position.x,
          positionData.position.y,
          positionData.position.z
        )
        modelRef.current.rotation.set(
          positionData.rotation.x,
          positionData.rotation.y,
          positionData.rotation.z
        )
        modelRef.current.scale.set(
          positionData.scale.x,
          positionData.scale.y,
          positionData.scale.z
        )
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: 'transparent',
        willChange: 'transform',
        filter: 'contrast(1.1) saturate(1.2)'
      }}
    />
  )
}
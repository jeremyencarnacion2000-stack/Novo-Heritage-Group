"use client"

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber'
import { Points, ShaderMaterial } from 'three'
import * as THREE from 'three'

// Extend Three.js objects for React Three Fiber
extend({ Points, ShaderMaterial })

// Liquid particle vertex shader - simplified for performance
const vertexShader = `
  uniform sampler2D positions;
  uniform sampler2D initialPositions;
  uniform float uTime;
  uniform float uFocus;
  uniform float uFov;
  uniform float uBlur;
  uniform float uPointSize;
  varying float vDistance;
  varying float vPosY;
  varying vec3 vWorldPosition;
  varying vec3 vInitialPosition;

  // Simplified periodic noise function
  float periodicNoise(vec3 p, float time) {
    // Create fewer frequency components for better performance
    float noise = 0.0;

    // Primary wave - creates main flow pattern
    noise += sin(p.x * 2.0 + time) * cos(p.z * 1.5 + time);

    // Secondary wave - adds turbulence
    noise += sin(p.x * 3.2 + time * 2.0) * cos(p.z * 2.1 + time) * 0.6;

    return noise * 0.3;
  }

  void main() {
    vec3 pos = texture2D(positions, position.xy).xyz;
    vec3 initialPos = texture2D(initialPositions, position.xy).xyz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vDistance = abs(uFocus - -mvPosition.z);
    vPosY = pos.y;
    vWorldPosition = pos;
    vInitialPosition = initialPos;

    gl_PointSize = max(vDistance * uBlur * uPointSize, 2.0); // Minimum size of 2.0
  }
`

// Liquid particle fragment shader - simplified for performance
const fragmentShader = `
  uniform float uOpacity;
  uniform float uRevealFactor;
  uniform float uRevealProgress;
  uniform float uTime;
  varying float vDistance;
  varying float vPosY;
  varying vec3 vWorldPosition;
  varying vec3 vInitialPosition;
  uniform float uTransition;

  // Simplified periodic noise function
  float periodicNoise(vec3 p, float time) {
    float noise = 0.0;
    noise += sin(p.x * 2.0 + time) * cos(p.z * 1.5 + time);
    noise += sin(p.x * 3.2 + time * 2.0) * cos(p.z * 2.1 + time) * 0.6;
    return noise * 0.3;
  }

  // Simplified sparkle noise function
  float sparkleNoise(vec3 seed, float time) {
    float hash = sin(seed.x * 127.1 + seed.y * 311.7 + seed.z * 74.7) * 43758.5453;
    hash = fract(hash);

    float slowTime = time * 1.0;

    float sparkle = 0.0;
    sparkle += sin(slowTime + hash * 6.28318) * 0.5;
    sparkle += sin(slowTime * 1.7 + hash * 12.56636) * 0.3;

    return 0.8 + sparkle * 0.8;
  }

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  void main() {
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;

    // Create circular particle shape
    float sdf = sdCircle(cxy, 0.5);

    if (sdf > 0.0) discard;

    // Calculate distance from center for reveal effect
    float distanceFromCenter = length(vWorldPosition.xz);

    // Add noise to the reveal threshold for organic edge
    float noiseValue = periodicNoise(vInitialPosition * 4.0, 0.0);
    float revealThreshold = uRevealFactor + noiseValue * 0.3;

    // Create reveal mask based on distance from center
    float revealMask = 1.0 - smoothstep(revealThreshold - 0.2, revealThreshold + 0.1, distanceFromCenter);

    // Calculate sparkle brightness multiplier
    float sparkleBrightness = sparkleNoise(vInitialPosition, uTime);

    // Simplified liquid-like opacity with depth and sparkle
    float alpha = (1.04 - clamp(vDistance, 0.0, 1.0)) * uOpacity * revealMask * uRevealProgress * sparkleBrightness;

    // Simplified color mixing
    gl_FragColor = vec4(vec3(1.0), alpha);
  }
`

// Simulation material for particle movement
const simulationVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const simulationFragmentShader = `
  uniform sampler2D positions;
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseIntensity;
  uniform float uTimeScale;
  uniform float uLoopPeriod;
  varying vec2 vUv;

  // Simplified periodic noise function for better performance
  float periodicNoise(vec3 p, float time) {
    float noise = 0.0;
    // Primary wave - creates main flow pattern
    noise += sin(p.x * 2.0 + time) * cos(p.z * 1.5 + time);
    // Secondary wave - reduced complexity
    noise += sin(p.x * 3.2 + time * 2.0) * cos(p.z * 2.1 + time) * 0.6;
    return noise * 0.3;
  }

  void main() {
    // Get the original particle position
    vec3 originalPos = texture2D(positions, vUv).rgb;

    // Use continuous time that naturally loops
    float continuousTime = uTime * uTimeScale * (6.28318530718 / uLoopPeriod);

    // Scale position for noise input
    vec3 noiseInput = originalPos * uNoiseScale;

    // Generate periodic displacement for each axis - simplified
    float displacementX = periodicNoise(noiseInput, continuousTime);
    float displacementY = periodicNoise(noiseInput + vec3(50.0, 0.0, 0.0), continuousTime + 2.094);
    float displacementZ = periodicNoise(noiseInput + vec3(0.0, 50.0, 0.0), continuousTime + 4.188);

    // Apply distortion to original position
    vec3 distortion = vec3(displacementX, displacementY, displacementZ) * uNoiseIntensity;
    vec3 finalPos = originalPos + distortion;

    gl_FragColor = vec4(finalPos, 1.0);
  }
`

interface LiquidParticlesProps {
  speed?: number
  aperture?: number
  focus?: number
  size?: number
  noiseScale?: number
  noiseIntensity?: number
  timeScale?: number
  pointSize?: number
  opacity?: number
  planeScale?: number
  useManualTime?: boolean
  manualTime?: number
  className?: string
}

function LiquidParticleSystem({
  speed = 1,
  aperture = 30,
  focus = 5.1,
  size = 256, // Reduced from 512 to 256 to decrease particle count by 75%
  noiseScale = 1,
  noiseIntensity = 0.5,
  timeScale = 1,
  pointSize = 2,
  opacity = 1,
  planeScale = 10,
  useManualTime = false,
  manualTime = 0,
  ...props
}: LiquidParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const simulationMaterialRef = useRef<THREE.ShaderMaterial>(null)
  const renderTargetRef = useRef<THREE.WebGLRenderTarget>(null)
  const { gl, clock } = useThree()

  // Create initial positions texture
  const initialPositionsTexture = useMemo(() => {
    const data = new Float32Array(size * size * 4)
    for (let i = 0; i < size * size; i++) {
      const i4 = i * 4
      const x = (i % size) / size
      const y = Math.floor(i / size) / size
      data[i4 + 0] = (x - 0.5) * 2 * planeScale // x
      data[i4 + 1] = 0 // y
      data[i4 + 2] = (y - 0.5) * 2 * planeScale // z
      data[i4 + 3] = 1 // w
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return texture
  }, [size, planeScale])

  // Create render target for position simulation
  const renderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(size, size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    })
  }, [size])

  // Create simulation material
  const simulationMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        positions: { value: initialPositionsTexture },
        uTime: { value: 0 },
        uNoiseScale: { value: noiseScale },
        uNoiseIntensity: { value: noiseIntensity },
        uTimeScale: { value: timeScale },
        uLoopPeriod: { value: 24 },
      },
    })
  }, [initialPositionsTexture, noiseScale, noiseIntensity, timeScale])

  // Create particle material
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        positions: { value: renderTarget.texture },
        initialPositions: { value: initialPositionsTexture },
        uTime: { value: 0 },
        uFocus: { value: focus },
        uFov: { value: 50 },
        uBlur: { value: aperture },
        uTransition: { value: 0 },
        uPointSize: { value: pointSize },
        uOpacity: { value: opacity },
        uRevealFactor: { value: 0 },
        uRevealProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    })
  }, [renderTarget.texture, initialPositionsTexture, focus, aperture, pointSize, opacity])

  // Animation loop
  useFrame((state) => {
    if (!pointsRef.current || !simulationMaterial) return

    const time = useManualTime ? manualTime : clock.elapsedTime

    // Update simulation
    simulationMaterial.uniforms.uTime.value = time * speed

    // Render simulation to render target
    gl.setRenderTarget(renderTarget)
    gl.clear()
    gl.render(state.scene, state.camera)
    gl.setRenderTarget(null)

    // Update particle material
    particleMaterial.uniforms.uTime.value = time
    particleMaterial.uniforms.uRevealFactor.value = Math.min(time * 0.5, 4)
    particleMaterial.uniforms.uRevealProgress.value = Math.min(time / 3.5, 1)
  })

  // Create particle positions
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(size * size * 3)
    for (let i = 0; i < size * size; i++) {
      const i3 = i * 3
      positions[i3 + 0] = (i % size) / size // u
      positions[i3 + 1] = Math.floor(i / size) / size // v
      positions[i3 + 2] = 0
    }
    return positions
  }, [size])

  return (
    <>
      {/* Simulation plane (invisible) */}
      <mesh material={simulationMaterial}>
        <planeGeometry args={[2, 2]} />
      </mesh>

      {/* Particles */}
      <points ref={pointsRef} material={particleMaterial} {...props}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
      </points>
    </>
  )
}

export function LiquidParticles() {
  return null;
}

export default LiquidParticles
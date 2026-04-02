"use client"

import { useState, useEffect, useRef } from 'react'

interface Porsche3DSceneProps {
  className?: string
}

export default function Porsche3DScene({ className }: Porsche3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelViewerRef = useRef<HTMLElement & {
    cameraOrbit?: string
    getCameraOrbit?: () => { theta: number; phi: number; radius: number }
  }>(null)
  
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isScrollLocked, setIsScrollLocked] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  const sections = [
    {
      title: "Protección Total 360°",
      subtitle: "Cobertura Completa sin Compromisos",
      description: "Daños propios y a terceros, robo total, desastres naturales y vandalismo incluidos",
      color: "from-blue-500 to-blue-800",
      icon: "🛡️"
    },
    {
      title: "Asistencia Vial 24/7/365",
      subtitle: "Nunca Estarás Solo",
      description: "Grúa ilimitada, mecánico a domicilio, auto de reemplazo y auxilio en carretera",
      color: "from-emerald-500 to-emerald-800",
      icon: "🚗"
    },
    {
      title: "Reemplazo Sin Depreciación",
      subtitle: "Tu Inversión Protegida",
      description: "En pérdida total, recibe el valor de un vehículo nuevo equivalente durante los primeros 3 años",
      color: "from-purple-500 to-purple-800",
      icon: "✨"
    },
    {
      title: "Protección Legal Completa",
      subtitle: "Respaldo Jurídico Total",
      description: "Defensa legal, gastos médicos, responsabilidad civil y asesoría especializada",
      color: "from-amber-500 to-amber-800",
      icon: "⚖️"
    }
  ]

  // Cargar el script de model-viewer
  useEffect(() => {
    console.log('🔧 Cargando script de model-viewer...')
    
    // Verificar si ya existe el script
    const existingScript = document.querySelector('script[src*="model-viewer"]')
    if (existingScript) {
      console.log('✅ Script ya existe')
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
    
    script.onload = () => {
      console.log('✅ Script de model-viewer cargado exitosamente')
    }
    
    script.onerror = () => {
      console.error('❌ Error cargando script de model-viewer')
    }
    
    document.head.appendChild(script)

    return () => {
      // Solo remover si es el último componente
      const modelViewers = document.querySelectorAll('model-viewer')
      if (modelViewers.length === 0 && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Simular carga del modelo
  useEffect(() => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => setModelLoaded(true), 300)
      }
      setLoadingProgress(progress)
    }, 150)

    return () => clearInterval(interval)
  }, [])

  // Manejo del scroll con rotación del modelo
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrollLocked && modelLoaded) {
        e.preventDefault()
        
        const delta = e.deltaY > 0 ? 0.01 : -0.01
        const newProgress = Math.min(Math.max(scrollProgress + delta, 0), 1)
        setScrollProgress(newProgress)

        // Rotar el modelo usando model-viewer
        if (modelViewerRef.current) {
          const rotation = newProgress * 360
          modelViewerRef.current.cameraOrbit = `${rotation}deg 75deg 105%`
        }

        // Actualizar sección
        const section = Math.floor(newProgress * 4)
        setCurrentSection(Math.min(section, 3))

        // Desbloquear al llegar al 100%
        if (newProgress >= 0.99) {
          setIsScrollLocked(false)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [isScrollLocked, scrollProgress, modelLoaded])

  // Listener para eventos del modelo
  useEffect(() => {
    const modelViewer = modelViewerRef.current
    if (!modelViewer) {
      console.log('⏳ Esperando model-viewer ref...')
      return
    }

    console.log('🎯 Model-viewer ref conectado')

    const handleLoad = () => {
      console.log('✅ Modelo cargado exitosamente!')
      setModelLoaded(true)
      setLoadingProgress(100)
    }

    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ totalProgress: number }>
      if (customEvent.detail && typeof customEvent.detail.totalProgress === 'number') {
        const progress = customEvent.detail.totalProgress * 100
        console.log(`📦 Cargando modelo: ${Math.round(progress)}%`)
        setLoadingProgress(progress)
      }
    }

    const handleError = (event: Event) => {
      console.error('❌ Error cargando el modelo:', event)
    }

    modelViewer.addEventListener('load', handleLoad)
    modelViewer.addEventListener('progress', handleProgress as EventListener)
    modelViewer.addEventListener('error', handleError)

    console.log('🔍 Intentando cargar:', modelViewer.getAttribute('src'))

    return () => {
      modelViewer.removeEventListener('load', handleLoad)
      modelViewer.removeEventListener('progress', handleProgress as EventListener)
      modelViewer.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative w-full min-h-screen overflow-hidden ${className}`}
    >
      {/* Loading Screen */}
      {!modelLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-slate-950 to-slate-900">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-none animate-spin mb-6"></div>
            <h3 className="text-xl font-light text-white mb-2">Cargando experiencia premium</h3>
            <p className="text-slate-400 mb-6">Preparando modelo 3D del Porsche</p>
            <div className="w-64 h-2 bg-slate-800 rounded-none overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-none transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <span className="text-slate-500 mt-2">{Math.round(loadingProgress)}%</span>
          </div>
        </div>
      )}

      {/* Model Viewer Container */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <model-viewer
          ref={modelViewerRef}
          src="/models/porsche_gt3/scene.gltf"
          alt="Porsche 911 GT3"
          camera-orbit="0deg 80deg 4m"
          camera-target="0m 0.5m 0m"
          field-of-view="30deg"
          min-camera-orbit="auto auto 2m"
          max-camera-orbit="auto auto 6m"
          camera-controls={false}
          disable-zoom={true}
          disable-pan={true}
          auto-rotate={false}
          shadow-intensity="2"
          environment-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.hdr"
          skybox-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.hdr"
          exposure="1.3"
          tone-mapping="commerce"
          loading="eager"
          reveal="auto"
          ar={false}
          style={{
            width: '100%',
            height: '100%',
            opacity: modelLoaded ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            backgroundColor: 'transparent',
            '--poster-color': 'transparent'
          } as React.CSSProperties}
        >
          <div slot="progress-bar" style={{ display: 'none' }}></div>
        </model-viewer>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-8 right-8 z-40 text-right">
        <div className="text-5xl font-bold text-white/20">
          0{currentSection + 1}
        </div>
        <div className="text-sm text-slate-500 font-medium tracking-wider">
          DE 04
        </div>
      </div>

      {/* Scroll Indicator */}
      {isScrollLocked && scrollProgress < 0.95 && modelLoaded && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-12 border-2 border-white/20 rounded-none flex justify-center pt-2 animate-bounce">
              <div className="w-2 h-4 bg-gradient-to-b from-amber-500 to-transparent rounded-none" />
            </div>
            <p className="text-white/60 text-sm font-light tracking-wide">
              Desliza para explorar
            </p>
          </div>
        </div>
      )}

      {/* Completion Indicator */}
      {!isScrollLocked && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-40 animate-pulse">
          <div className="bg-green-500/10 backdrop-blur-md border border-green-500/30 rounded-none px-8 py-4">
            <p className="text-green-400 text-sm font-semibold flex items-center gap-2">
              <span className="text-lg">✓</span>
              Continúa explorando
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-1/2 max-w-2xl">
        <div className="flex gap-4 justify-center">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-none transition-all duration-700 ${
                idx === currentSection
                  ? `w-20 bg-gradient-to-r ${section.color} shadow-lg`
                  : idx < currentSection
                  ? 'w-12 bg-green-500/80'
                  : 'w-2 bg-slate-700/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`transition-all duration-1000 ${
                index === currentSection 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95 absolute inset-0'
              }`}
            >
              <div className="text-6xl mb-4">{section.icon}</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white drop-shadow-2xl mb-4">
                {section.title}
              </h2>
              <h3 className="text-xl sm:text-2xl text-amber-300 drop-shadow-md font-medium mb-3">
                {section.subtitle}
              </h3>
              <p className="text-lg text-slate-200 drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}

          {/* CTA Button */}
          {!isScrollLocked && (
            <button
              className="pointer-events-auto mt-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-bold py-4 px-10 rounded-none shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-110"
            >
              Solicitar Cotización Gratuita
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
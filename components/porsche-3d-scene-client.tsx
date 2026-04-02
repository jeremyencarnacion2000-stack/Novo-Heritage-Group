"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// @ts-ignore - lucide-react types not resolving correctly
import { Shield, Check, Star, Search, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Reviews } from "@/components/reviews"
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const Porsche3DScene = dynamic(() => import("@/components/porsche-3d-scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-white text-xl">Cargando experiencia 3D...</div>
    </div>
  )
})

export default function SegurosClientPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Animaciones más suaves y profesionales
    gsap.fromTo('.hero-title-seguros',
      { opacity: 0, y: 80, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 1.5, 
        ease: 'power3.out',
        delay: 0.3
      }
    )

    gsap.fromTo('.hero-subtitle-seguros',
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        delay: 0.6, 
        ease: 'power3.out' 
      }
    )

    gsap.fromTo('.hero-search-seguros',
      { opacity: 0, y: 60, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 1.3, 
        delay: 0.9, 
        ease: 'back.out(1.2)' 
      }
    )

    // Animaciones de las tarjetas mejoradas
    gsap.utils.toArray('.insurance-card').forEach((card: any, index) => {
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 100,
          scale: 0.85,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          },
          delay: index * 0.15
        }
      )
    })

    gsap.fromTo('.cta-section-seguros',
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cta-section-seguros',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const insuranceProducts = [
    {
      id: "seg-001",
      name: "Cobertura Básica",
      description: "Protección esencial para tu vehículo con responsabilidad civil",
      price: 899,
      period: "anual",
      features: ["Responsabilidad civil", "Asistencia vial básica", "Gastos médicos ocupantes", "Defensa legal"],
      popular: false,
      image: "/modern-car-insurance-protection.jpg",
      type: "insurance" as const,
    },
    {
      id: "seg-002",
      name: "Cobertura Premium",
      description: "Protección avanzada con cobertura amplia y beneficios exclusivos",
      price: 1499,
      period: "anual",
      features: ["Cobertura amplia", "Asistencia vial premium", "Gastos médicos ampliados", "Defensa legal", "Vehículo de reemplazo", "Cobertura de lunas"],
      popular: true,
      image: "/modern-car-insurance-protection.jpg",
      type: "insurance" as const,
    },
    {
      id: "seg-003",
      name: "Cobertura Total",
      description: "La máxima protección para tu vehículo con todos los beneficios",
      price: 2199,
      period: "anual",
      features: ["Cobertura total", "Asistencia vial 24/7", "Gastos médicos ilimitados", "Defensa legal premium", "Vehículo de reemplazo", "Cobertura de lunas", "Asistencia legal completa", "Cobertura de accesorios"],
      popular: false,
      image: "/modern-car-insurance-protection.jpg",
      type: "insurance" as const,
    }
  ]

  const handleAddToCart = (product: typeof insuranceProducts[0]) => {
    if (!product || !product.id || !product.name) {
      toast({
        title: "Error",
        description: "Producto no válido. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      return
    }
    
    try {
      addItem(product)
      toast({
        title: "Producto agregado",
        description: `${product.name} ha sido añadido a tu cotización.`,
      })
    } catch (error) {
      console.error('Error adding item to cart:', error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section with Porsche 3D Experience */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Porsche3DScene className="absolute inset-0" />
        
        {/* Gradient overlay para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/80 pointer-events-none z-10" />
        
        {/* Contenido del Hero */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20 pointer-events-none">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="hero-title-seguros">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-light text-white mb-4 leading-tight">
                Seguros Automotrices{" "}
                <span className="block mt-2 italic font-normal bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl">
                  Premium
                </span>
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-200 hero-subtitle-seguros max-w-3xl mx-auto font-light leading-relaxed">
              Protege tu inversión con cobertura de lujo respaldada por tecnología de vanguardia
            </p>
            
            <div className="hero-search-seguros pointer-events-auto">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                <Input
                  type="text"
                  placeholder="Buscar por marca, modelo o año..."
                  className="pl-14 pr-6 py-7 text-lg rounded-none bg-white/10 backdrop-blur-2xl border border-white/30 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 hover:bg-white/15"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator mejorado */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-10 border-2 border-white/30 rounded-none flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-amber-400 rounded-none animate-pulse" />
            </div>
            <span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
          </div>
        </div>
      </section>

      {/* Insurance Plans Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-none blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-none blur-3xl" />
        </div>

        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-6 leading-tight">
              Planes{" "}
              <span className="italic font-normal bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Adaptados a Ti
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Descubre nuestras opciones de cobertura diseñadas para proteger tu vehículo y brindarte la tranquilidad que mereces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {insuranceProducts.map((product) => (
              <div 
                key={product.id} 
                className={`insurance-card group relative rounded-none p-8 lg:p-10 border transition-all duration-700 hover:scale-105 ${
                  product.popular 
                    ? 'border-amber-500/50 bg-gradient-to-br from-amber-950/30 via-amber-900/20 to-slate-900/30 shadow-2xl shadow-amber-500/20' 
                    : 'border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/30 hover:border-slate-600/70 hover:shadow-xl hover:shadow-slate-700/20'
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-900 text-xs font-bold px-6 py-2 rounded-none shadow-lg uppercase tracking-wider">
                      ⭐ Más Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-10">
                  <h3 className={`text-2xl lg:text-3xl font-serif font-light mb-3 transition-colors ${
                    product.popular ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                  }`}>
                    {product.name}
                  </h3>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl lg:text-6xl font-light text-white">
                      ${product.price}
                    </span>
                    <span className="text-slate-400 text-lg">
                      /{product.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-5 mb-10">
                  {product.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-none p-1 ${
                        product.popular ? 'bg-amber-500/20' : 'bg-slate-700/50'
                      }`}>
                        <Check className={`w-4 h-4 ${
                          product.popular ? 'text-amber-400' : 'text-slate-300'
                        }`} />
                      </div>
                      <span className="text-slate-300 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-7 rounded-none font-semibold text-base transition-all duration-500 group-hover:scale-105 ${
                    product.popular
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-slate-900 shadow-lg shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40'
                      : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border border-slate-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Agregar a Cotización
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-6">
              Beneficios{" "}
              <span className="italic font-normal bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Exclusivos
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
              Descubre por qué miles de clientes confían en nuestra protección premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Cobertura Total",
                description: "Protección completa contra todo tipo de riesgos y siniestros en cualquier situación"
              },
              {
                icon: Star,
                title: "Asistencia 24/7",
                description: "Servicio de asistencia disponible las 24 horas del día, los 365 días del año"
              },
              {
                icon: Check,
                title: "Sin Deductible",
                description: "Cobertura sin deducibles para tu máxima tranquilidad y comodidad"
              },
              {
                icon: ShoppingCart,
                title: "Proceso Rápido",
                description: "Cotización y contratación en minutos, completamente digital y sin complicaciones"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-slate-800/40 to-slate-900/30 backdrop-blur-xl rounded-none p-8 border border-slate-700/40 hover:border-slate-600/70 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-none flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <feature.icon className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-2xl font-serif font-light mb-4 text-white group-hover:text-blue-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <Reviews />

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_50%)]" />
        
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto cta-section-seguros">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-white mb-6 leading-tight">
              Protege tu Vehículo{" "}
              <span className="block mt-2 italic font-normal bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Hoy Mismo
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto">
              Únete a miles de clientes satisfechos que confían en nuestra protección premium y experiencia de servicio excepcional
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                size="lg" 
                className="rounded-none px-10 h-16 text-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-slate-900 shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-500 hover:scale-110 font-semibold"
                asChild
              >
                <Link href="/cotizar">
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  Cotizar Ahora
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-none px-10 h-16 text-lg bg-transparent border-2 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 text-white transition-all duration-500 hover:scale-105 backdrop-blur-sm font-semibold"
                asChild
              >
                <Link href="/contacto">
                  Hablar con un Asesor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
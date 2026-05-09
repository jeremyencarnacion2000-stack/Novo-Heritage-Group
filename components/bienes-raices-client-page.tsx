"use client"

import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
// @ts-ignore - lucide-react types
import { Bed, Bath, Maximize, MapPin, Heart, Home, Building, Castle, Warehouse, Search, SlidersHorizontal, ArrowRight, Star, Award, Shield, Users, ChevronDown, Layers, TrendingUp, DollarSign, Check } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"
import { SidebarNav } from "./sidebar-nav"
import { trackBehavior } from "@/lib/tracking"
import { useAuth } from "@/hooks/use-auth"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PropertyCarousel } from "@/components/property-carousel"
import { RealEstateQuoteForm } from "@/components/forms/real-estate-quote-form"
import { PropertySellForm } from "@/components/forms/property-sell-form"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BookingForms } from "@/components/booking-forms"
import { PremiumHeading, PremiumText } from "@/components/premium-typography"
import PropertyDetailModal from "@/components/property-detail-modal"
import { cn } from "@/lib/utils"

const ParallaxCard = ({ children, image, title, className, onClick, overlayOpacity = 0.4 }: any) => {
  const ref = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])
  const smoothY = useSpring(y, { stiffness: 60, damping: 25, mass: 0.8 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <motion.div
        style={{ y: smoothY, height: "140%", top: "-20%" }}
        className="absolute inset-0 w-full"
      >
        <Image
          src={image}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
      </motion.div>
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-700 group-hover:opacity-20`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
      {children}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-700" />
    </motion.div>
  )
}

export default function BienesRaicesClientPage({ properties: initialProperties }: { properties?: any[] }) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000000])
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [properties, setProperties] = useState<any[]>(initialProperties || [])
  const [isLoadingProps, setIsLoadingProps] = useState<boolean>(!initialProperties)
  const [activeScene, setActiveScene] = useState<'hero' | 'gallery'>('hero')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [panelTab, setPanelTab] = useState<'catalog' | 'sell'>('catalog')

  
  const [services, setServices] = useState<any[]>([
    {
      icon: "TrendingUp",
      title: "Asesoría VIP de Inversiones",
      description: "Servicio de localización y propuesta de inmuebles con alto ROI y plusvalía asegurada.",
    },
    {
      icon: "Building",
      title: "Gestión Inmobiliaria Integral",
      description: "Nos encargamos de comercializar, mantener y rentabilizar su propiedad sin que mueva un dedo.",
    },
    {
      icon: "Users",
      title: "Concierge de Alto Nivel",
      description: "Asistencia dedicada. Gestionamos mudanzas, mobiliario e integración de inquilinos exclusivos.",
    },
    {
      icon: "Shield",
      title: "Seguridad y Blindaje Legal",
      description: "Auditoría de activos, cierres seguros y debida diligencia de título con especialistas.",
    },
  ])

  const [collections, setCollections] = useState<any[]>([
    { id: "torre-naco", title: "Torre Naco", image: "/modern_minimalist_house_pushkino.png", subtitle: "Exclusividad Metropolitana", sector: "Naco", area: 250, bedrooms: 3, bathrooms: 3, price: 550000, description: "Lujosa torre en el corazón de Naco con acabados premium.", features: ["Seguridad 24/7", "Lobby", "Piscina"] },
    { id: "villa-cap-cana", title: "Villa Cap Cana", image: "/luxury_modern_villa_renaissance.png", subtitle: "Santuario Costero", sector: "Cap Cana", area: 850, bedrooms: 5, bathrooms: 5, price: 2500000, description: "Villa frente al mar con diseño contemporáneo y vistas inigualables.", features: ["Playa Privada", "Cine", "Muelle"] },
    { id: "altos-chavon", title: "Altos de Chavón", image: "/contemporary_house_barminka.png", subtitle: "Legado Arquitectónico", sector: "La Romana", area: 450, bedrooms: 4, bathrooms: 4, price: 1200000, description: "Residencia inspirada en la arquitectura clásica con toques modernos.", features: ["Campo de golf", "Seguridad VIP"] },
    { id: "piantini-luxury", title: "Piantini Luxury", image: "/elegant_modern_home_venice.png", subtitle: "Vistas Panorámicas", sector: "Piantini", area: 320, bedrooms: 3, bathrooms: 3, price: 780000, description: "Apartamento de lujo con domótica integrada y vistas a toda la ciudad.", features: ["Gimnasio", "Social Area"] },
  ])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    // Load data only if not provided by server
    if (!initialProperties) {
      const load = async () => {
        try {
          const response = await fetch('/api/properties')
          const data = await response.json()
          setProperties(data)
        } catch (err) {
          console.error('Failed to load properties', err)
        } finally {
          setIsLoadingProps(false)
        }
      }
      load()
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (activeScene === 'gallery') {
      document.body.style.overflow = 'hidden'
      window.dispatchEvent(new CustomEvent('lock-scroll'))
    } else {
      document.body.style.overflow = 'unset'
      window.dispatchEvent(new CustomEvent('unlock-scroll'))
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.dispatchEvent(new CustomEvent('unlock-scroll'))
    }
  }, [activeScene])

  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 1000], [0, 300])

  const scrollToGallery = () => {
    const element = document.getElementById('full-gallery')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const iconMap: Record<string, any> = { Home, Building, Users, Shield, Star, Award, TrendingUp, DollarSign }

  return (
    <div className="min-h-screen w-full relative bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      <Header isScrolled={isScrolled} isIntroFinished={true} />
      <MobileHeader
        isMobileMenuOpen={isSidebarOpen}
        setIsMobileMenuOpen={setIsSidebarOpen}
        handleMobileNavClick={(section) => {
          setIsSidebarOpen(false)
        }}
        isIntroFinished={true}
      />
      <SidebarNav isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Side Panel Overlay for 'Gallery' Scene - Placed BEFORE main content so it's not affected by displacement */}
      <AnimatePresence mode="wait">
        {activeScene === 'gallery' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveScene('hero')}
              className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[10000]"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="fixed right-0 top-0 w-full md:w-[50%] lg:w-[45%] h-[100vh] glass-premium z-[10001] border-l border-primary/20 overflow-y-auto overscroll-contain shadow-[-50px_0_100px_rgba(0,0,0,0.5)]"
              data-lenis-prevent
            >
               <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 flex px-12 py-6 gap-8 overflow-x-auto scrollbar-hide">
                  <button 
                    onClick={() => setPanelTab('catalog')}
                    className={cn("text-[10px] uppercase tracking-[0.4em] font-black pb-2 transition-all", panelTab === 'catalog' ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white")}
                  >
                    Catálogo VIP
                  </button>
                  <button 
                    onClick={() => setPanelTab('sell')}
                    className={cn("text-[10px] uppercase tracking-[0.4em] font-black pb-2 transition-all", panelTab === 'sell' ? "text-primary border-b-2 border-primary" : "text-white/40 hover:text-white")}
                  >
                    Alquilar o Vender
                  </button>
                  <button 
                    onClick={() => setActiveScene('hero')}
                    className="ml-auto p-2 hover:bg-primary hover:text-black transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </div>

              <div className="p-12 md:p-20 pt-12">
                {panelTab === 'catalog' ? (
                  <>
                    <div className="flex justify-between items-center mb-20 text-balance">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.6em] text-primary font-black block">Colección Privada</span>
                        <h2 className="text-5xl md:text-6xl font-light font-serif text-white leading-none">Selecciones <br/><span className="italic text-primary/80">VIP</span></h2>
                      </div>
                    </div>

                    <div className="grid gap-12">
                      {(properties.length > 0 ? properties.slice(0, 5) : collections).map((item: any, idx: number) => (
                        <Link href={item.id ? `/bienes-raices/propiedad/${item.id}` : "#propiedades"} key={item.id || item.title} onClick={() => {if(!item.id) scrollToGallery()}}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1, duration: 0.6 }}
                            className="group cursor-pointer flex gap-10 items-center pb-12 border-b border-white/5 hover:border-primary/30 transition-all duration-700"
                          >
                            <div className="relative w-32 h-32 overflow-hidden border border-white/10 bg-black/40 shadow-premium shrink-0">
                              <Image src={item.image || "/luxury_modern_villa_renaissance.png"} alt={item.title} fill sizes="128px" className="object-cover scale-110 group-hover:scale-100 grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <h4 className="text-2xl md:text-3xl font-serif text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                              <div className="flex items-center gap-4">
                                <span className="text-[9px] text-white/40 uppercase tracking-[0.4em]">{item.sector || item.subtitle || "Premium"}</span>
                                <div className="w-8 h-[1px] bg-primary/20" />
                                <span className="text-[10px] font-bold text-primary tracking-widest">Ver Detalles</span>
                              </div>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center border border-white/10 rounded-full opacity-0 group-hover:opacity-100 group-hover:border-primary transition-all duration-700">
                              <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1" />
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="pt-8"
                  >
                    <PropertySellForm />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          x: activeScene === 'gallery' ? '-25%' : 0,
          scale: activeScene === 'gallery' ? 0.97 : 1,
          opacity: activeScene === 'gallery' ? 0.7 : 1,
          filter: activeScene === 'gallery' ? 'blur(8px)' : 'blur(0px)'
        }}
        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        className="relative z-[10] w-full origin-right"
      >
        {/* Dynamic Background Accents */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[120px]" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square opacity-[0.03] grayscale brightness-0 invert pointer-events-none select-none overflow-hidden">
            <Image
              src="/Realty.svg"
              alt=""
              fill
              sizes="100vw"
              className="object-contain scale-150 rotate-[-15deg]"
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <motion.div style={{ y: bgY }} className="absolute inset-0">
              <Image
                src="/premium-luxury-villa-real-estate-hero.png"
                alt="Luxury Real Estate"
                fill
                sizes="100vw"
                className="object-cover brightness-[0.5]"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
          </div>

          <div className="container layout-guide-visual relative z-10 text-center max-w-7xl mx-auto pt-fixed-header">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-6 py-2 mb-10 border border-primary/20 glass-premium">
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-primary/80">Realty & Rentals</span>
              </div>

              <PremiumHeading as="h1" className="mb-12 leading-[0.85] text-7xl md:text-9xl tracking-tighter">
                Habitaciones que<br />
                <span className="italic font-extralight text-primary drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">hablan de ti</span>
              </PremiumHeading>

              <PremiumText className="text-lg md:text-xl text-foreground/40 mb-16 max-w-3xl mx-auto font-light tracking-widest uppercase pb-12 border-b border-white/5">
                Arquitectura de vanguardia con alma Quisqueyana. <br/>Escenarios para legados familiares.
              </PremiumText>

              <div className="flex flex-col sm:flex-row gap-12 justify-center mt-12 bg-black/20 backdrop-blur-sm p-8 max-w-fit mx-auto border border-white/5">
                <button 
                  className="group relative flex items-center justify-between gap-16 px-16 py-6 bg-primary text-black transition-all duration-700 hover:scale-[1.05] rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
                  onClick={() => setActiveScene('gallery')}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Explorar Catálogo</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <Dialog modal={true}>
                  <DialogTrigger asChild>
                    <button className="px-16 py-6 border border-white/20 glass-premium text-[11px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-black transition-all duration-700">
                      Consultar Inversión
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[92vh] outline-none">
                    <DialogTitle className="sr-only">Consultar Inversión Inmobiliaria</DialogTitle>
                    <DialogDescription className="sr-only">Formulario para consultar opciones de inversión en bienes raíces</DialogDescription>
                    <div className="bg-background rounded-none p-10 md:p-20 shadow-2xl border border-primary/20 relative">
                      <RealEstateQuoteForm defaultType="inversion" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Projects Grid */}
        <section id="propiedades" className="section-airy relative px-4 bg-background overflow-hidden border-t border-white/5">
          <div className="container layout-guide-visual max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8 md:items-end justify-between mb-32 border-b border-primary/10 pb-20">
              <div className="col-span-12 lg:col-span-8">
                <PremiumHeading as="h2" className="leading-[0.9] text-6xl md:text-8xl">
                  Colecciones <br/><span className="italic text-primary">Arquitectónicas</span>
                </PremiumHeading>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <PremiumText className="text-foreground/30 text-xl font-light leading-relaxed tracking-wider mb-2">
                  Curaduría de espacios que trascienden la utilidad para convertirse en hitos de diseño global.
                </PremiumText>
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-16">
              {(properties.length > 0 ? properties.slice(0, 4) : collections).map((item, index) => (
                <div key={item.id || item.title} className="col-span-12 md:col-span-6">
                  <Link href={item.id ? `/bienes-raices/propiedad/${item.id}` : "#"}>
                  <ParallaxCard
                    image={item.image || "/placeholder.jpg"}
                    title={item.title}
                    className="aspect-[4/3] border border-white/5 shadow-2xl"
                  >
                    <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black via-black/40 to-transparent">
                      <div className="z-10 group-hover:-translate-y-6 transition-transform duration-1000">
                        <p className="text-[10px] text-primary uppercase tracking-[0.5em] font-black mb-4">{item.sector || item.subtitle || "Premium"}</p>
                        <h3 className="text-4xl md:text-5xl font-light font-serif text-white mb-8 leading-none line-clamp-2 italic">
                          {item.title}
                        </h3>
                        
                        <div className="flex gap-12 text-[9px] uppercase tracking-[0.3em] text-white/50 mb-10 border-t border-white/10 pt-8">
                          <div className="space-y-2">
                            <span className="block opacity-30 font-black">Área</span>
                            <span className="text-white font-bold">{item.area} m²</span>
                          </div>
                          <div className="space-y-2">
                            <span className="block opacity-30 font-black">Habitaciones</span>
                            <span className="text-white font-bold">{item.bedrooms} Units</span>
                          </div>
                   
                        </div>

                        <button 
                          onClick={async (e) => {
                            e.preventDefault(); e.stopPropagation(); setSelectedProperty(item); setIsDetailModalOpen(true);
                            if (user) { trackBehavior({ usuario_id: (user as any).id, evento: 'click', seccion: 'bienes-raices', metadata: { property_id: item.id, price: item.price } }); }
                          }}
                          className="px-12 py-5 bg-transparent border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-primary hover:text-black transition-all duration-700 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
                        >
                          Ver Ficha Técnica
                        </button>
                      </div>
                    </div>
                  </ParallaxCard>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Property Carousel Section */}
        <section className="section-airy relative px-4 glass-premium bg-primary/[0.01] overflow-hidden border-y border-white/5">
          <div className="container layout-guide-visual max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24 border-b border-primary/10 pb-16">
              <div>
                <PremiumHeading as="h2" className="leading-none text-5xl md:text-7xl">
                  Propiedades <br/><span className="italic text-primary">Insignia</span>
                </PremiumHeading>
              </div>
              <Link href="/bienes-raices/coleccion" className="text-[10px] uppercase tracking-[0.5em] font-black text-primary hover:text-white transition-all flex items-center gap-6 group mb-4 pb-2 border-b border-primary/40">
                Catálogo Completo <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-700" />
              </Link>
            </div>
            <PropertyCarousel properties={properties.filter(p => p.featured).slice(0, 6)} />
          </div>
        </section>

        {/* Corporate Services */}
        <section id="servicios" className="section-airy relative px-4 overflow-hidden bg-background">
          <div className="container layout-guide-visual mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-32"
            >
              <PremiumHeading as="h2" className="mb-12 text-6xl">
                Protocolos de <span className="italic text-primary underline underline-offset-[12px] decoration-1">Excelencia</span>
              </PremiumHeading>
              <div className="w-24 h-[1px] bg-primary/40 mx-auto" />
            </motion.div>

            <div className="grid grid-cols-12 gap-12">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="col-span-12 md:col-span-6 lg:col-span-3 group p-12 glass-premium border-white/5 hover:border-primary/40 transition-all duration-1000 hover:-translate-y-2"
                >
                  <div className="w-20 h-20 bg-black/40 border border-white/10 flex items-center justify-center mb-10 group-hover:bg-primary transition-colors duration-700 shadow-xl group-hover:rotate-[360deg]">
                    {React.createElement(iconMap[service.icon] || Home, { className: "w-10 h-10 text-primary group-hover:text-black transition-colors" })}
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-6 leading-tight">{service.title}</h3>
                  <p className="text-white/30 font-light text-[13px] leading-relaxed tracking-widest uppercase">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ROI & Investment */}
        <section className="section-airy relative px-4 bg-primary/[0.02] border-y border-white/5 overflow-hidden">
          <div className="container layout-guide-visual max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-16 lg:gap-32 items-center">
              <div className="col-span-12 lg:col-span-7 space-y-16">
                <PremiumHeading as="h2" className="leading-[0.8] text-7xl md:text-9xl">
                  Ingeniería de <br/><span className="italic text-primary">Patrimonio</span>
                </PremiumHeading>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex items-start gap-8 group pb-8 border-b border-white/5">
                     <div className="flex-shrink-0 w-16 h-16 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-700">
                        <TrendingUp className="w-8 h-8" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-2xl font-serif text-white">Plusvalía Curada</h4>
                        <PremiumText className="text-[11px] text-white/40 font-light uppercase tracking-widest leading-loose">Activos estratégicos con rendimientos proyectados del 12-18% anual en polos de alta gama.</PremiumText>
                     </div>
                  </div>
                  <div className="flex items-start gap-8 group pb-8 border-b border-white/5">
                     <div className="flex-shrink-0 w-16 h-16 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-700">
                        <DollarSign className="w-8 h-8" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-2xl font-serif text-white">Cash-Flow</h4>
                        <PremiumText className="text-[11px] text-white/40 font-light uppercase tracking-widest leading-loose">Optimización de rentas vía Luxury Rentals en Santo Domingo y destinos élite.</PremiumText>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-12 lg:col-span-5">
                <div className="glass-premium border-primary/20 p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute -top-4 left-10 px-6 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-[0.4em]">Protocolo VIP</div>
                  <h3 className="text-3xl font-serif mb-12 text-center text-white italic">Consultoría de Inversión</h3>
                  <BookingForms type="appointment" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </motion.div>

      <PropertyDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        property={selectedProperty}
      />

      <Chatbot />
    </div>
  )
}


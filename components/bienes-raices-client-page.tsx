"use client"

import React, { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
// @ts-ignore - lucide-react types
import { Bed, Bath, Maximize, MapPin, Heart, Home, Building, Castle, Warehouse, Search, SlidersHorizontal, ArrowRight, Star, Award, Shield, Users, ChevronDown, Layers, TrendingUp, DollarSign } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"
import { SidebarNav } from "./sidebar-nav"
import PropertyDetailModal from "@/components/property-detail-modal"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PropertyCarousel } from "@/components/property-carousel"
import { RealEstateQuoteForm } from "@/components/forms/real-estate-quote-form"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BookingForms } from "@/components/booking-forms"
import { PremiumHeading, PremiumText } from "@/components/premium-typography"

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

export default function BienesRaicesClientPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000000])
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [properties, setProperties] = useState<any[]>([])
  const [isLoadingProps, setIsLoadingProps] = useState<boolean>(true)
  const [activeScene, setActiveScene] = useState<'hero' | 'gallery'>('hero')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [services, setServices] = useState<any[]>([
    {
      icon: "Home",
      title: "Adquisición Elitista",
      description: "Propiedades que definen estatus y legado arquitectónico.",
    },
    {
      icon: "Building",
      title: "Asset Management",
      description: "Maximizamos el valor de su patrimonio con estrategias globales.",
    },
    {
      icon: "Users",
      title: "Concierge Inmobiliario",
      description: "Acompañamiento VIP desde la conceptualización hasta el cierre.",
    },
    {
      icon: "Shield",
      title: "Blindaje Jurídico",
      description: "Transacciones protegidas bajo los más altos estándares legales.",
    },
  ])

  const [collections, setCollections] = useState<any[]>([
    { title: "Torre Naco", image: "/modern_minimalist_house_pushkino.png", subtitle: "Exclusividad Metropolitana", area: "250", floors: "1", bedrooms: "3" },
    { title: "Villa Cap Cana", image: "/luxury_modern_villa_renaissance.png", subtitle: "Santuario Costero", area: "850", floors: "2", bedrooms: "5" },
    { title: "Altos de Chavón", image: "/contemporary_house_barminka.png", subtitle: "Legado Arquitectónico", area: "450", floors: "2", bedrooms: "4" },
    { title: "Piantini Luxury", image: "/elegant_modern_home_venice.png", subtitle: "Vistas Panorámicas", area: "320", floors: "1", bedrooms: "3" },
  ])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    // Load data
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
           layout
           className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${activeScene === 'gallery' ? 'translate-x-[-25%] scale-110 blur-md' : 'translate-x-0 scale-100'}`}
        >
          <motion.div style={{ y: bgY }} className="absolute inset-0">
            <Image
              src="/premium-luxury-villa-real-estate-hero.png"
              alt="Luxury Real Estate"
              fill
              className="object-cover brightness-[0.5]"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        </motion.div>

        <div className="container layout-guide-visual relative z-10 text-center max-w-7xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-4 py-1.5 mb-8 border border-primary/20 glass-premium">
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-foreground/60">Legacy Real Estate</span>
            </div>

            <PremiumHeading as="h1" className="mb-10 leading-[0.9]">
              Habitaciones que<br />
              <span className="italic font-extralight text-primary">hablan de ti</span>
            </PremiumHeading>

            <PremiumText className="text-base md:text-lg text-foreground/50 mb-12 max-w-2xl mx-auto font-light tracking-wide">
              No solo construimos estructuras; curamos el escenario donde se desarrolla su legado. Arquitectura de vanguardia con alma Quisqueyana.
            </PremiumText>

            <div className="flex flex-col sm:flex-row gap-8 justify-center mt-12 mb-20">
              <button 
                className="group relative flex items-center justify-between gap-12 px-12 py-5 bg-primary text-black transition-all duration-700 hover:scale-[1.02] rounded-none shadow-premium overflow-hidden border border-primary/20"
                onClick={() => setActiveScene('gallery')}
              >
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Explorar Catálogo</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="px-12 py-5 border border-primary/20 glass-premium text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary/5 transition-all">
                    Consultar Inversión
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[95vh]">
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

        {/* Side Panel Overlay for 'Gallery' Scene */}
        <AnimatePresence>
          {activeScene === 'gallery' && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 w-full md:w-[40%] h-full glass-premium z-20 border-l border-primary/10 overflow-y-auto"
            >
              <div className="p-12 pt-32">
                <div className="flex justify-between items-center mb-16">
                  <h2 className="text-4xl font-light font-serif text-foreground">Selecciones VIP</h2>
                  <button
                    onClick={() => setActiveScene('hero')}
                    className="p-3 border border-primary/20 hover:bg-primary hover:text-black transition-all"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </button>
                </div>

                <div className="grid gap-10">
                  {collections.map((item: any, idx: number) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="group cursor-pointer flex gap-8 items-center p-6 border border-primary/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-700"
                      onClick={scrollToGallery}
                    >
                      <div className="relative w-24 h-24 overflow-hidden border border-primary/10">
                        <Image src={item.image} alt={item.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                      </div>
                      <div>
                        <h4 className="text-xl font-serif text-foreground mb-1">{item.title}</h4>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-[0.2em]">{item.subtitle}</p>
                      </div>
                      <ArrowRight className="ml-auto w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Featured Projects Grid */}
      <section id="propiedades" className="section-airy relative px-4 bg-background overflow-hidden">
        <div className="container layout-guide-visual max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8 md:items-end justify-between mb-20 border-b border-primary/10 pb-16">
            <div className="col-span-12 lg:col-span-8">
              <PremiumHeading as="h2" className="leading-[0.9]">
                Colecciones <br/><span className="italic text-primary">Arquitectónicas</span>
              </PremiumHeading>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <PremiumText className="text-foreground/40 text-lg font-light leading-relaxed">
                Curaduría de espacios que trascienden la mera utilidad para convertirse en hitos de diseño.
              </PremiumText>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-10">
            {collections.map((collection, index) => (
              <div key={collection.title} className="col-span-12 md:col-span-6">
                <ParallaxCard
                  image={collection.image}
                  title={collection.title}
                  className="aspect-[4/3] border border-primary/5"
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black via-black/20 to-transparent">
                    <div className="z-10 group-hover:-translate-y-4 transition-transform duration-700">
                      <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold mb-3">{collection.subtitle}</p>
                      <h3 className="text-4xl md:text-5xl font-light font-serif text-white mb-6 leading-tight">
                        {collection.title}
                      </h3>
                      
                      <div className="flex gap-10 text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8 border-t border-white/10 pt-6">
                        <div className="space-y-1">
                          <span className="block opacity-50">Área</span>
                          <span className="text-white">{collection.area} m²</span>
                        </div>
                        <div className="space-y-1">
                          <span className="block opacity-50">Hab</span>
                          <span className="text-white">{collection.bedrooms}</span>
                        </div>
                      </div>

                      <button className="px-10 py-4 bg-transparent border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                        Ver Ficha Técnica
                      </button>
                    </div>
                  </div>
                </ParallaxCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Carousel Section */}
      <section className="section-airy relative px-4 glass-premium bg-primary/[0.01] overflow-hidden">
        <div className="container layout-guide-visual max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20 border-b border-primary/10 pb-12">
            <div>
              <PremiumHeading as="h2" className="leading-tight">
                Propiedades <br/><span className="italic text-primary">Insignia</span>
              </PremiumHeading>
            </div>
            <Link href="/bienes-raices/coleccion" className="text-[10px] uppercase tracking-[0.4em] font-bold text-foreground/40 hover:text-primary transition-all flex items-center gap-4 group mb-4">
              Catálogo Completo <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
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
            className="text-center mb-24"
          >
            <PremiumHeading as="h2" className="mb-8">
              Protocolos de <span className="italic text-primary">Excelencia</span>
            </PremiumHeading>
            <div className="w-32 h-[1px] bg-primary/40 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-12 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="col-span-12 md:col-span-6 lg:col-span-3 group p-10 glass-premium border-primary/5 hover:border-primary/20 transition-all duration-700"
              >
                <div className="w-16 h-16 bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors duration-500">
                  {React.createElement(iconMap[service.icon] || Home, { className: "w-8 h-8 text-primary group-hover:text-black transition-colors" })}
                </div>
                <h3 className="text-2xl font-serif text-foreground mb-4">{service.title}</h3>
                <p className="text-foreground/50 font-light text-sm leading-relaxed tracking-wide">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI & Investment */}
      <section className="section-airy relative px-4 bg-primary/[0.02] border-y border-primary/5 overflow-hidden">
        <div className="container layout-guide-visual max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="col-span-12 lg:col-span-7 space-y-12">
              <PremiumHeading as="h2" className="leading-[0.9]">
                Ingeniería de <br/><span className="italic text-primary">Patrimonio</span>
              </PremiumHeading>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-6 group">
                   <div className="flex-shrink-0 w-12 h-12 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <TrendingUp className="w-6 h-6" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-serif">Plusvalía Curada</h4>
                      <PremiumText className="text-sm text-foreground/40 font-light">Seleccionamos únicamente activos en zonas de crecimiento estratégico con rendimientos proyectados del 12-18% anual.</PremiumText>
                   </div>
                </div>
                <div className="flex items-start gap-6 group">
                   <div className="flex-shrink-0 w-12 h-12 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                      <DollarSign className="w-6 h-6" />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-xl font-serif">Cash-Flow Inmobiliario</h4>
                      <PremiumText className="text-sm text-foreground/40 font-light">Optimización de rentas mediante nuestra red de Luxury Rentals en Santo Domingo y Cap Cana.</PremiumText>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-5">
              <div className="glass-premium border-primary/10 p-10 md:p-12 shadow-premium relative">
                <div className="absolute -top-4 -left-4 px-4 py-1 bg-primary text-black text-[9px] uppercase font-black tracking-widest">Atención Prioritaria</div>
                <h3 className="text-2xl font-serif mb-8 text-center">Consultoría de Inversión</h3>
                <BookingForms type="appointment" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Catalog Trigger */}
      <section id="vender" className="section-airy relative px-4 overflow-hidden bg-background">
        <div className="container layout-guide-visual max-w-5xl mx-auto text-center">
            <PremiumHeading as="h2" className="mb-12 leading-[0.9]">
               Encuentra tu lugar en el <span className="italic text-primary">mundo</span>
            </PremiumHeading>
            <Link href="/bienes-raices/coleccion">
              <button className="group relative px-20 py-7 bg-primary text-black text-sm font-bold uppercase tracking-[0.4em] transition-all hover:scale-[1.05] shadow-premium rounded-none">
                Ver Colección Completa
                <div className="absolute inset-x-0 -bottom-1 h-px bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </button>
            </Link>
        </div>
      </section>

      <PropertyDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        property={selectedProperty}
      />
      <Chatbot />
      <Footer />
    </div>
  )
}

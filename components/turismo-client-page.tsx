"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
// @ts-ignore - lucide-react types
import { Users, Clock, Star, MapPin, Heart, Search, Calendar, SlidersHorizontal, ArrowRight, CheckCircle2, Plane, Shield, FileText, Globe, Landmark, BadgeCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TravelQuoteForm } from "@/components/forms/travel-quote-form"
import { TrivagoSearch } from "@/components/trivago-search"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SidebarNav } from "./sidebar-nav"
import { PremiumHeading, PremiumText } from "@/components/premium-typography"

export default function TurismoClientPage() {
  const [destination, setDestination] = useState<string>("")
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [origin, setOrigin] = useState<string>("Santo Domingo")
  const [guests, setGuests] = useState<string>("2")
  const [travelClass, setTravelClass] = useState<string>("economy")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [isScrolled, setIsScrolled] = useState(false)
  const [hotels, setHotels] = useState<any[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 1000], [0, 300])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    gsap.registerPlugin(ScrollTrigger)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchHotels = async () => {
    setIsLoadingHotels(true)
    setError(null)
    try {
      const response = await fetch(`/api/turismo/hotels`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setHotels(data)
      } else {
        setHotels([])
      }
    } catch (err: any) {
      setError("Error al cargar ofertas")
      setHotels([])
    } finally {
      setIsLoadingHotels(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const consularServices = [
    {
      id: "visa-usa",
      title: "Asistencia de Visas USA",
      description: "Gestión completa de formulario DS-160, creación de perfil consular y programación de citas en el VAC y Embajada.",
      features: ["Llenado DS-160", "Citas Consulares", "Asesoría de Perfil"],
      icon: Landmark,
      color: "bg-blue-500/10"
    },
    {
      id: "visa-schengen",
      title: "Visas Schengen (Europa)",
      description: "Preparación de expedientes para España, Francia, Italia y más. Incluye pre-reserva de vuelos y asistencia documental.",
      features: ["Pre-reserva de Vuelos", "Asesoría de Seguro", "Carta de Invitación"],
      icon: Globe,
      color: "bg-emerald-500/10"
    },
    {
      id: "travel-insurance",
      title: "Seguro de Viaje Global",
      description: "Cobertura médica internacional obligatoria para visas y viajes de placer. Somos corredores autorizados.",
      features: ["Cobertura COVID-19", "Asistencia 24/7", "Repatriación"],
      icon: Shield,
      color: "bg-primary/10"
    }
  ]

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

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
      
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-none bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-none bg-primary/5 blur-[120px]" />
        
        {/* Section Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square opacity-[0.03] grayscale brightness-0 invert pointer-events-none select-none overflow-hidden">
          <Image
            src="/Turismos.svg"
            alt=""
            fill
            className="object-contain scale-150 rotate-[-15deg]"
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <Image
            src="/luxury-travel-destination-beach-resort.jpg"
            alt="Novo Heritage Turismo"
            fill
            className="object-cover opacity-30 grayscale-[0.5]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/40 to-background" />
        </motion.div>

        <div className="container relative z-10 text-center max-w-7xl mx-auto pt-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-block px-4 py-1.5 mb-8 border border-primary/20 glass-premium">
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-foreground/60">Novo Heritage Group</span>
            </div>

            <PremiumHeading as="h1" className="mb-10 leading-[0.9]">
              Asesoría Consular &<br />
              <span className="italic font-extralight text-primary">Viajes de Autor</span>
            </PremiumHeading>

            <PremiumText className="text-base md:text-lg text-foreground/50 mb-16 max-w-2xl mx-auto font-light tracking-wide">
              Expertos en gestión de visados, seguros de viaje y experiencias exclusivas. Facilitamos su camino al mundo con profesionalismo y seguridad patrimonial.
            </PremiumText>

            <div className="flex flex-col sm:flex-row gap-8 justify-center mt-12 mb-20">
              <button 
                className="group relative flex items-center justify-between gap-12 px-12 py-6 bg-primary text-black transition-all duration-700 hover:scale-[1.05] shadow-premium border border-primary/20"
                onClick={() => scrollToSection('servicios-consulares')}
              >
                <span className="text-sm font-bold uppercase tracking-[0.4em]">Gestión de Visas</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Link href="/seguros" className="px-12 py-6 border border-primary/20 glass-premium text-sm font-bold uppercase tracking-[0.4em] hover:bg-primary/5 transition-all duration-700 text-center">
                Seguro de Viaje
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Consular Services Section */}
      <section id="servicios-consulares" className="section-airy relative px-4 bg-background overflow-hidden border-y border-primary/5">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <PremiumHeading as="h2" className="mb-8">
                Gestión de <span className="italic text-primary">Visados</span>
              </PremiumHeading>
              <PremiumText className="text-foreground/50 font-light">
                Brindamos asistencia legal y técnica para sus trámites consulares, asegurando que cada detalle de su perfil sea presentado con excelencia.
              </PremiumText>
            </div>
            <div className="hidden md:block">
              <BadgeCheck className="w-16 h-16 text-primary/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {consularServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group p-10 glass-premium border-primary/10 hover:border-primary/40 transition-all duration-700 flex flex-col h-full"
              >
                <div className={`w-16 h-16 ${service.color} border border-primary/10 flex items-center justify-center mb-10 group-hover:bg-primary transition-all duration-500`}>
                  <service.icon className="w-8 h-8 text-primary group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-2xl font-serif mb-6">{service.title}</h3>
                <p className="text-foreground/50 font-light text-sm leading-relaxed mb-10 flex-1">{service.description}</p>
                
                <div className="space-y-4 mb-10 border-t border-primary/5 pt-8">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-foreground/60 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Dialog modal={true}>
                  <DialogTrigger asChild>
                    <button className="btn-premium w-full py-5 text-[10px] tracking-[0.3em]">
                      Solicitar Consulta
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-transparent border-none overflow-y-auto max-h-[92vh] outline-none">
                    <div className="bg-background p-10 md:p-16 border border-primary/20 shadow-2xl">
                      <TravelQuoteForm 
                        defaultType="consular"
                        initialData={{
                           destination: service.title,
                           origin: "Santo Domingo"
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Partnership Section */}
      <section className="py-24 px-4 bg-primary/[0.02] overflow-hidden">
        <div className="container max-w-7xl mx-auto text-center">
          <PremiumText className="text-[10px] uppercase tracking-[0.5em] text-foreground/30 mb-12">Alianzas Estratégicas Globales</PremiumText>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
             <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-10 flex items-center justify-center text-3xl font-black tracking-tighter italic">trivago</div>
                <span className="text-[8px] uppercase tracking-widest text-foreground/40 font-bold">Reserva de Hoteles</span>
             </div>
             <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-10 flex items-center justify-center text-3xl font-black tracking-widest uppercase">CheapOair</div>
                <span className="text-[8px] uppercase tracking-widest text-foreground/40 font-bold">Vuelos Internacionales</span>
             </div>
          </div>
        </div>
      </section>

      {/* Search & Offers Section */}
      <section id="ofertas" className="py-32 px-4 bg-background">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24">
             <PremiumHeading as="h2" className="mb-10 leading-[1.1]">
                Viajes y <span className="italic text-primary">Boletos</span>
             </PremiumHeading>
             <PremiumText className="max-w-2xl text-foreground/50 font-light">
                Utilice nuestro sistema inteligente para encontrar las mejores tarifas en hoteles y vuelos a través de nuestra red de partners.
             </PremiumText>
          </div>

          <div className="mb-32">
             <TrivagoSearch 
                className="max-w-5xl mx-auto"
                onSearch={() => fetchHotels()}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingHotels ? (
               Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-[450px] bg-background border border-primary/5 animate-pulse" />
               ))
            ) : error ? (
               <div className="col-span-full py-20 text-center glass-premium border-red-500/20">
                  <p className="text-red-400 font-light text-xs uppercase tracking-widest mb-4">Error de Conexión</p>
                  <h3 className="text-2xl font-serif mb-6 text-foreground/80">{error}</h3>
                  <button onClick={() => fetchHotels()} className="text-[10px] uppercase tracking-[0.3em] text-primary hover:underline">Reintentar</button>
               </div>
            ) : hotels.length > 0 ? (
               hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
               ))
            ) : (
               <div className="col-span-full py-20 text-center glass-premium">
                  <p className="text-foreground/40 font-light italic">No hay ofertas destacadas en este momento. Por favor contacte con un asesor para un plan personalizado.</p>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Special Offer: USA Visa Pack */}
      <section className="section-airy px-4 bg-background relative border-t border-primary/5">
         <div className="container max-w-7xl mx-auto">
            <div className="bg-primary/5 border border-primary/10 p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-16 group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] pointer-events-none" />
               
               <div className="relative z-10 space-y-10 flex-1">
                  <div className="premium-label text-primary">Oferta de Temporada</div>
                  <h2 className="text-4xl md:text-6xl font-serif leading-[0.9]">
                     Protocolo Completo<br/>
                     <span className="italic">Visa B1/B2 (USA)</span>
                  </h2>
                  <p className="text-foreground/50 font-light max-w-xl text-lg leading-relaxed">
                     El paquete más solicitado: Formulario DS-160 profesional, pago de tasa consular, programación de citas y simulación de entrevista presencial.
                  </p>
                  <div className="flex flex-wrap gap-8 items-center border-t border-primary/5 pt-10">
                     <div>
                        <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/30 mb-1">Precio Especial</div>
                        <div className="text-4xl font-serif">$150.00 <span className="text-sm font-sans text-foreground/40">/ persona</span></div>
                     </div>
                     <button 
                        onClick={() => scrollToSection('servicios-consulares')}
                        className="group flex items-center gap-8 px-10 py-5 bg-primary text-black text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:gap-12"
                     >
                        Comenzar Ahora <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="relative w-full md:w-1/3 aspect-[4/5] overflow-hidden">
                  <Image 
                     src="/luxury_modern_villa_renaissance.png"
                     alt="Visa Services"
                     fill
                     className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-125 group-hover:scale-100"
                  />
               </div>
            </div>
         </div>
      </section>

      <Chatbot />
      <Footer />
    </div>
  )
}

function HotelCard({ hotel }: { hotel: any }) {
  if (!hotel) return null;
  const name = hotel.name || "Hotel de Lujo";
  const location = hotel.location || "Destino Novo Heritage";
  const rating = hotel.rating || "5";
  const price = hotel.price || 0;
  const image = hotel.image || "/luxury-travel-destination-beach-resort.jpg";

  return (
    <div className="bg-background border border-primary/10 hover:border-primary/40 transition-all duration-700 overflow-hidden group shadow-premium relative h-full flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-6 left-8 right-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">{rating} Estrellas</span>
          </div>
          <h3 className="font-serif text-2xl text-foreground leading-tight">{name}</h3>
        </div>
      </div>
      <div className="p-8 space-y-6 flex-1 flex flex-col bg-background relative z-10">
        <div className="flex items-center gap-3 text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
          <MapPin className="w-3 h-3 text-primary" />
          {location}
        </div>
        <div className="flex items-end justify-between pt-6 border-t border-primary/10">
          <div>
            <p className="text-3xl font-serif text-foreground font-light">${price.toLocaleString()}</p>
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Partner Rate</p>
          </div>
          <button className="btn-premium px-8 py-4 text-[10px]">Ver Link</button>
        </div>
      </div>
    </div>
  );
}

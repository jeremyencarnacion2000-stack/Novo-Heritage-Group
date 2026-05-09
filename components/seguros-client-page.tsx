"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
// @ts-ignore - lucide-react types
import { ArrowRight, CheckCircle2, Clock, Shield, Car, Plane, Heart, Star, ChevronRight, Home } from "lucide-react"
import Chatbot from "@/components/chatbot"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { InsuranceQuoteForm } from "@/components/forms/insurance-quote-form"
import { SidebarNav } from "./sidebar-nav"
import { BookingForms } from "@/components/booking-forms"

const insuranceTypes = [
  {
    icon: Car,
    title: "Vehículos",
    description: "Desde coberturas básicas de ley hasta protección VIP para vehículos 0KM.",
    features: ["Asistencia vial 24/7", "Auto sustituto premium", "Responsabilidad civil en exceso", "Cobertura en todo el país"],
    gradient: "from-primary/10 to-transparent",
  },
  {
    icon: Plane,
    title: "Viajes Globales",
    description: "Protección integral para tus destinos internacionales.",
    features: ["Gastos médicos ilimitados", "Cancelación 'Any Reason'", "Concierge de viaje", "Protección de equipaje VIP"],
    gradient: "from-primary/10 to-transparent",
  },
  {
    icon: Home,
    title: "Propiedades y Hogar",
    description: "Protección total para tu residencia y patrimonio inmobiliario.",
    features: ["Incendio y líneas aliadas", "Robo y asalto", "Responsabilidad civil", "Asistencia domiciliaria 24/7"],
    gradient: "from-primary/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Empresarial Elite",
    description: "Blindaje corporativo para tu patrimonio empresarial.",
    features: ["Responsabilidad civil", "Ciberseguridad", "Lucro cesante", "Flotilla ejecutiva"],
    gradient: "from-primary/10 to-transparent",
  },
]

const vehiclePlans = [
  {
    title: "Plan Básico (Ley)",
    description: "La cobertura mínima exigida por ley para transitar con seguridad.",
    features: ["Responsabilidad Civil", "Fianza Judicial", "Lesiones o Muerte a Terceros", "Daños a la Propiedad Ajena"],
    price: "Desde RD$ 4,500",
    recommended: false
  },
  {
    title: "Plan Semi-Full",
    description: "Protección equilibrada para vehículos con más de 10 años de uso.",
    features: ["Cobertura de Ley ampliada", "Colisión y Vuelco (Riesgo Compartido)", "Incendio y Robo", "Asistencia Vial"],
    price: "Desde RD$ 12,000",
    recommended: false
  },
  {
    title: "Plan Full Total",
    description: "Protección completa para vehículos modernos y de uso personal.",
    features: ["Daños Propios (Colisión/Vuelco)", "Incendio y Robo Total", "Rotura de Cristales", "Responsabilidad Civil en Exceso"],
    price: "Desde RD$ 25,000",
    recommended: true
  },
  {
    title: "Plan VIP / 0KM",
    description: "La máxima protección para vehículos nuevos y clientes exigentes.",
    features: ["Valor Convenido Garantizado", "Auto Sustituto Premium", "Asistencia VIP 24/7", "Deducibles Flexibles (0-5%)"],
    price: "Desde RD$ 45,000",
    recommended: false
  }
]

export default function SegurosClientPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Framer Motion Scroll Hooks
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 1000], [0, 300])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    
    // Always ensure scroll is unlocked when landing here
    window.dispatchEvent(new CustomEvent("unlock-scroll"))
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-none bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-none bg-primary/5 blur-[120px]" />
        
        {/* Section Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square opacity-[0.03] grayscale brightness-0 invert pointer-events-none select-none overflow-hidden">
          <Image
            src="/seguros.svg"
            alt=""
            fill
            className="object-contain scale-150 rotate-[-15deg]"
          />
        </div>
      </div>

      <section ref={heroRef} id="seguros-hero" className="relative min-h-screen flex items-center justify-center pt-fixed-header overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 z-0 text-foreground"
        >
          <Image
            src="/premium-insurance-hero.png"
            alt="Premium Insurance"
            fill
            className="object-cover opacity-60 grayscale-[40%] hover:grayscale-0 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/20 to-background z-10" />
        </motion.div>

        <div className="container layout-guide-visual relative z-20">
          <div className="layout-grid-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="col-span-12 lg:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left"
            >
              <div className="premium-label mb-8">
                Seguridad & Legado
              </div>

              <h1 className="text-6xl md:text-9xl font-light mb-12 font-serif leading-[0.85] tracking-tighter">
                Seguridad que<br />
                <span className="italic font-extralight text-primary">trasciende</span>
              </h1>

              <p className="text-lg md:text-xl text-foreground/50 mb-14 max-w-2xl leading-relaxed font-light tracking-wide">
                Diseñamos arquitecturas de protección financiera para quienes exigen excelencia. Tu patrimonio blindado con el más alto estándar internacional.
              </p>

              <div id="cotizaciones" className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <Dialog modal={true}>
                  <DialogTrigger asChild>
                    <button className="group relative flex items-center justify-between gap-12 px-12 py-6 bg-primary text-black transition-all duration-700 hover:scale-[1.02] shadow-premium overflow-hidden border border-primary/20">
                      <span className="text-sm font-bold uppercase tracking-[0.3em]">Cotizar Ahora</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[92vh] outline-none">
                    <DialogTitle className="sr-only">Cotizador de Seguros</DialogTitle>
                    <DialogDescription className="sr-only">Formulario de cotización de seguros patrimoniales Novo Heritage</DialogDescription>
                    <div className="bg-background rounded-none p-10 md:p-20 shadow-2xl border border-primary/20 relative">
                      <InsuranceQuoteForm defaultType="auto" />
                    </div>
                  </DialogContent>
                </Dialog>
                
                <button
                  className="px-12 py-6 border border-primary/20 glass-premium text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary/5 transition-all duration-500"
                  onClick={() => {
                    const element = document.getElementById('planes')
                    if (element) element.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Explorar Coberturas
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.5, duration: 1.5 }}
           className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 group cursor-pointer"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] font-semibold text-foreground/40 font-sans">Saber Más</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary/40 to-transparent transition-all duration-700" />
        </motion.div>
      </section>

      {/* Pinning Showcase Section */}
      <section id="pinning-showcase" className="relative min-h-[200vh] bg-background">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,193,90,0.03),transparent_70%)]" />

          <div className="relative z-10 container layout-guide-visual h-full flex flex-col justify-center">
            <div className="layout-grid-12 items-center h-full">
              {/* Left Side - Decorative Visual */}
              <div className="hidden lg:flex lg:col-span-6 items-center justify-center h-full relative">
                <div className="relative flex items-center justify-center w-full h-full">
                  {/* Outer glow ring */}
                  <div className="absolute w-[420px] h-[420px] rounded-full border border-primary/10 animate-pulse" />
                  <div className="absolute w-[320px] h-[320px] rounded-full border border-primary/15" />
                  <div className="absolute w-[220px] h-[220px] rounded-full bg-primary/5 blur-3xl" />
                  {/* Center icon */}
                  <div className="relative z-10 w-40 h-40 bg-background border border-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(230,193,90,0.15)]">
                    <Shield className="w-20 h-20 text-primary/70" strokeWidth={0.8} />
                  </div>
                  {/* Floating labels */}
                  <div className="absolute top-[28%] right-[15%] p-3 border border-primary/20 bg-background/80 backdrop-blur-sm text-[10px] uppercase tracking-widest text-primary/60 font-bold">
                    360° Elite
                  </div>
                  <div className="absolute bottom-[28%] left-[15%] p-3 border border-primary/20 bg-background/80 backdrop-blur-sm text-[10px] uppercase tracking-widest text-primary/60 font-bold">
                    Protección Total
                  </div>
                </div>
              </div>

              {/* Right Side - Scrolling Content */}
              <div className="col-span-12 lg:col-span-5 lg:col-start-8 flex flex-col justify-center space-y-32 py-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="space-y-8"
                >
                  <div className="w-20 h-20 bg-primary/5 border border-primary/10 flex items-center justify-center glass-premium shadow-premium rounded-none">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-5xl md:text-7xl font-light font-serif text-foreground leading-[1.1]">Protección<br/><span className="italic text-primary">360° Elite</span></h2>
                  <p className="text-xl text-foreground/50 leading-relaxed font-light max-w-md tracking-wide">
                    Un ecosistema de seguridad que envuelve cada aspecto de tu vida. Desde tu movilidad hasta tu salud, todo bajo una misma póliza maestra.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="space-y-8"
                >
                  <div className="w-20 h-20 bg-primary/5 border border-primary/10 flex items-center justify-center glass-premium shadow-premium rounded-none">
                    <Clock className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-5xl md:text-7xl font-light font-serif text-foreground leading-[1.1]">Respuesta<br/><span className="italic text-primary">Inmediata</span></h2>
                  <p className="text-xl text-foreground/50 leading-relaxed font-light max-w-md tracking-wide">
                    Cuando cada segundo cuenta, nuestra red de asistencia prioritaria se activa con tiempos de respuesta garantizados.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Types Grid */}
      <section className="section-airy relative z-10 bg-background border-y border-border/40">
        <div className="container layout-guide-visual">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-8xl font-light font-serif text-foreground mb-10 tracking-tight">Soluciones <span className="italic text-primary">Premium</span></h2>
            <div className="w-32 h-[0.5px] bg-primary/40 mx-auto" />
          </div>

          <div className="layout-grid-12 gap-y-12">
            {insuranceTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 1 }}
                viewport={{ once: true }}
                className="col-span-12 md:col-span-6 lg:col-span-3 group"
              >
                <div className="relative h-full p-12 glass-premium border-border/40 hover:border-primary/40 transition-all duration-1000 overflow-hidden cursor-pointer flex flex-col items-center text-center rounded-none">
                  <div className="relative z-10 mb-10">
                    <div className="w-20 h-20 bg-primary/5 border border-border/60 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 transition-all duration-700 rounded-none">
                      <type.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-serif text-foreground mb-6 group-hover:text-primary transition-colors duration-500">
                    {type.title}
                  </h3>
                  <p className="text-foreground/50 leading-relaxed mb-10 font-light text-base tracking-wide flex-1">
                    {type.description}
                  </p>
                  <ul className="space-y-4 w-full text-left">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40 group-hover:text-foreground/80 transition-colors duration-500">
                        <CheckCircle2 className="w-4 h-4 text-primary/40" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="planes" className="section-airy relative z-10 bg-background border-b border-border/40">
        <div className="container layout-guide-visual">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-8xl font-light font-serif text-foreground mb-10 tracking-tight">Planes de <span className="italic text-primary">Cobertura</span></h2>
            <div className="w-32 h-[0.5px] bg-primary/40 mx-auto" />
          </div>

          <div className="layout-grid-12 gap-y-12">
            {vehiclePlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 1 }}
                viewport={{ once: true }}
                className={`col-span-12 md:col-span-6 lg:col-span-3 relative p-12 glass-premium transition-all duration-1000 flex flex-col h-full border-border/40 rounded-none ${plan.recommended ? 'border-primary/60 ring-1 ring-primary/20 scale-[1.03] z-20 shadow-premium' : 'hover:border-primary/40'}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-8 py-2 bg-primary text-black text-[10px] font-bold uppercase tracking-[0.4em] shadow-premium">
                    Recomendado
                  </div>
                )}
                <div className="mb-12">
                  <h3 className="text-3xl font-serif text-foreground mb-4">{plan.title}</h3>
                  <p className="text-base text-foreground/50 font-light leading-relaxed tracking-wide">{plan.description}</p>
                </div>
                <div className="flex-1 space-y-6 mb-16">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 group/feature">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 transition-colors duration-500 ${plan.recommended ? 'text-primary' : 'text-primary/30 group-hover/feature:text-primary'}`} />
                      <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/60 font-medium leading-snug group-hover/feature:text-foreground/90 transition-colors">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-10 border-t border-border/40">
                  <div className="premium-label text-foreground/30 mb-3">Inversión Estimada</div>
                  <div className="text-3xl font-serif text-foreground leading-none">{plan.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="reclamaciones" className="section-airy relative overflow-hidden bg-background">
        <div className="container layout-guide-visual relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-6xl md:text-9xl font-light font-serif text-foreground mb-12 leading-[0.9] tracking-tighter">
              ¿Listo para elevar <br/><span className="italic text-primary font-extralight">tu estándar?</span>
            </h2>
            <p className="text-foreground/50 mb-20 text-xl md:text-2xl leading-relaxed font-light tracking-wide max-w-3xl mx-auto">
              Descubre cómo podemos blindar lo que más valoras con el servicio más exclusivo del mercado. Una arquitectura de seguridad diseñada para tu legado.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Dialog modal={true}>
                <DialogTrigger asChild>
                  <button className="group relative flex items-center justify-between gap-12 px-15 py-7 bg-primary text-black transition-all duration-700 hover:scale-[1.05] shadow-premium overflow-hidden border border-primary/20">
                    <span className="text-sm font-bold uppercase tracking-[0.4em]">Agendar Cita Private</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[92vh] outline-none">
                  <DialogTitle className="sr-only">Agendar Cita Private</DialogTitle>
                  <DialogDescription className="sr-only">Formulario de reserva de cita con asesor de seguros Novo Heritage</DialogDescription>
                  <div className="bg-background rounded-none p-10 md:p-20 shadow-2xl border border-primary/20 relative">
                    <BookingForms type="insurance" />
                  </div>
                </DialogContent>
              </Dialog>
              
              <a href="https://wa.me/18092157540" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-15 py-7 border border-primary/20 glass-premium text-sm font-bold uppercase tracking-[0.4em] hover:bg-primary/5 transition-all duration-700">
                  Contactar Directo
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </div>
  )
}

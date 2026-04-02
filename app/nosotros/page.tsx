"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Building2, Plane, Shield, Users, Target, Lightbulb, Heart, Sparkles } from "lucide-react"
import Image from "next/image"
import Chatbot from "@/components/chatbot"

export default function NosotrosPage() {
    const [isScrolled, setIsScrolled] = useState(false)
    const heroRef = useRef<HTMLDivElement>(null)

    const { scrollY } = useScroll()
    const bgY = useTransform(scrollY, [0, 1000], [0, 300])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const services = [
        "Asesoría Inmobiliaria",
        "Administración de Condominios",
        "Corredores de Seguros",
        "Agente de Viajes y Tour Operador",
        "Asesoría en Productos de Terminación",
        "Promoción y Venta de Inmuebles"
    ]

    const values = [
        {
            icon: Lightbulb,
            title: "Proactividad",
            description: "Tenemos iniciativa. Elaboramos un plan de marketing individualizado para cada división de negocios. Tratamos de adelantarnos a las situaciones adversas con el único objetivo de ofrecer un asesoramiento de calidad."
        },
        {
            icon: Heart,
            title: "Pasión",
            description: "Disfrutamos con nuestro trabajo. Somos expertos y dedicados con nuestra labor intermediaria para lograr sacar el mayor rendimiento de nuestras propiedades y servicios ofrecidos."
        },
        {
            icon: Building2,
            title: "Profesionalidad",
            description: "Siempre que ofrecemos soluciones, lo hacemos desde el conocimiento técnico de la materia. Trabajamos con propiedades con alto potencial por lo que la exigencia en el servicio debe ser máxima. En Novo Heritage Group cada cliente es único; respetamos sus preferencias por encima de todo y nos adaptamos a ellas."
        }
    ]

    return (
        <div className="min-h-screen w-full relative bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
            <Header isScrolled={isScrolled} isIntroFinished={true} />
            <MobileHeader
                isMobileMenuOpen={false}
                setIsMobileMenuOpen={() => { }}
                handleMobileNavClick={() => { }}
                isIntroFinished={true}
            />

            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
                {/* Parallax Background */}
                <motion.div
                    style={{ y: bgY }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src="/premium-corporate-nosotros-hero.png"
                        alt="Novo Heritage Group"
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background z-10" />
                </motion.div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-5xl mx-auto"
                    >
                        <div className="inline-block px-4 py-1.5 mb-8 border border-primary/20 glass-architectural">
                            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-foreground/60">Legado & Excelencia</span>
                        </div>

                        <h1 className="text-6xl md:text-9xl font-light mb-10 font-serif leading-[0.9] tracking-tight">
                            Novo Heritage<br />
                            <span className="italic font-extralight text-primary">Group SRL</span>
                        </h1>

                        <p className="text-base md:text-lg text-foreground/50 mb-12 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                            Suministramos asesoría de la más alta calidad para que tome decisiones inteligentes en el mundo de la arquitectura y la inversión real.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-24 relative z-10 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="h-full p-12 glass-architectural border-primary/10 hover:border-primary/30 transition-all duration-700">
                                <div className="w-16 h-16 bg-primary/5 flex items-center justify-center mb-8 border border-primary/10">
                                    <Target className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-4xl font-light font-serif text-foreground mb-6 underline decoration-primary/20 underline-offset-8">Misión</h2>
                                <p className="text-foreground/60 leading-relaxed text-lg font-light">
                                    Brindar un servicio de Promoción, Venta y Asesoría Inmobiliaria, Servicios Turísticos y Corretaje de Seguros de forma personalizada orientada a cumplir con las exigencias de nuestros clientes. Trabajamos con ética profesional, honestidad y discreción.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="h-full p-12 glass-architectural border-primary/10 hover:border-primary/30 transition-all duration-700">
                                <div className="w-16 h-16 bg-primary/5 flex items-center justify-center mb-8 border border-primary/10">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-4xl font-light font-serif text-foreground mb-6 underline decoration-primary/20 underline-offset-8">Visión</h2>
                                <p className="text-foreground/60 leading-relaxed text-lg font-light">
                                    Ser la mejor y más innovadora alternativa para quienes requieren la ayuda de un Profesional Inmobiliario, Promotor Turístico y Corredor de Seguros en un solo eje comercial, brindando una relación cercana y resolutiva.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-background relative z-10">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-light font-serif text-foreground mb-6">Valores Centrales</h2>
                        <div className="w-24 h-[1px] bg-primary/40 mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="h-full p-12 glass-architectural border-primary/5 hover:border-primary/40 transition-all duration-1000">
                                    <div className="w-16 h-16 bg-primary/5 flex items-center justify-center mb-8 border border-primary/10 group-hover:bg-primary transition-colors duration-500">
                                        <value.icon className="w-8 h-8 text-primary group-hover:text-black transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-serif text-foreground mb-4">{value.title}</h3>
                                    <p className="text-foreground/50 leading-relaxed font-light group-hover:text-foreground/80 transition-colors">
                                        {value.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-24 relative z-10 bg-background overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto glass-architectural p-16 border-primary/10 relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-light font-serif text-foreground mb-8 leading-tight">
                                    Pool de<br/><span className="italic text-primary">Servicios</span>
                                </h2>
                                <p className="text-foreground/50 mb-10 text-xl font-light leading-relaxed">
                                    Soluciones integrales a través de nuestras divisiones de negocios enfocadas en la excelencia.
                                </p>
                                <a href="https://wa.me/18092157540" target="_blank" rel="noopener noreferrer">
                                    <button className="group relative flex items-center justify-between gap-12 px-10 py-5 bg-primary text-black transition-all duration-700 hover:scale-[1.02] rounded-none shadow-premium overflow-hidden">
                                        <span className="text-xs font-bold uppercase tracking-[0.3em]">Contáctanos</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </a>
                            </div>

                            <div className="grid gap-4">
                                {services.map((service, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-6 p-5 glass-architectural bg-white/5 hover:border-primary/40 transition-all duration-300 group"
                                    >
                                        <div className="w-10 h-10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <CheckCircle2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-foreground/70 font-light text-lg tracking-tight uppercase text-[12px] font-bold tracking-[0.2em]">{service}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Chatbot />
            <Footer />
        </div>
    )
}

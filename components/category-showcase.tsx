"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import NextImage from "next/image"
import { PremiumHeading } from "./premium-typography"
// @ts-ignore - lucide-react types not resolving correctly
import { Shield, Building2, Plane, ArrowRight, CheckCircle2 } from "lucide-react"

function ParallaxImage({ src, alt, accent }: { src: string, alt: string, accent: any }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} className="col-span-12 lg:col-span-7">
      <div
        className="relative aspect-[16/10] overflow-hidden border border-border/50 bg-background shadow-2xl transition-all duration-700 group"
      >
        <motion.div
          style={{ y }}
          className="absolute inset-[-10%] w-[120%] h-[120%] transition-transform duration-1000 group-hover:scale-105 will-change-transform"
        >
          <NextImage
            src={src}
            alt={alt}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-1000"
          />
        </motion.div>

        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 pointer-events-none" />
        
        {/* Subtle Accent Glow */}
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent.primary}20, transparent 70%)`,
          }}
        />
      </div>
    </div>
  )
}

export function CategoryShowcase() {
  const categories = [
    {
      title: "Seguros",
      description: "Protección integral para tus vehículos, viajes y propiedades, diseñada para tu total tranquilidad y seguridad patrimonial.",
      tagline: "Protección total",
      href: "/seguros",
      accent: { primary: "var(--premium-gold)", glow: "rgba(var(--primary-rgb), 0.2)" },
      features: ["Cobertura completa", "Asistencia 24/7", "Cotización inmediata"],
      image: "/category-seguros.png",
    },
    {
      title: "Bienes Raíces",
      description: "Encuentra la propiedad de tus sueños o invierte en el mejor inmueble con nuestra asesoría experta y personalizada.",
      tagline: "Inversiones inteligentes",
      href: "/bienes-raices",
      accent: { primary: "var(--foreground)", glow: "rgba(var(--foreground-rgb), 0.1)" },
      features: ["Propiedades exclusivas", "Asesoría personalizada", "Proceso transparente"],
      image: "/category-bienes-raices.png",
    },
    {
      title: "Turismo",
      description: "Descubre experiencias únicas y paquetes turísticos diseñados para crear recuerdos inolvidables en destinos exclusivos.",
      tagline: "Experiencias memorables",
      href: "/turismo",
      accent: { primary: "var(--premium-gold)", glow: "rgba(var(--primary-rgb), 0.2)" },
      features: ["Destinos exclusivos", "Paquetes personalizados", "Atención premium"],
      image: "/category-turismo.png",
    },
  ]

  return (
    <section id="servicios" className="bg-background section-airy overflow-hidden">
      <div className="container layout-guide-visual">
        {/* Header Section */}
        <div className="layout-grid-12 mb-32">
          <div className="col-span-12 lg:col-span-8">
            <span className="premium-label mb-6 inline-block">Nuestra Excelencia</span>
            <PremiumHeading as="h2" className="mb-10 text-editorial leading-[1.1]">
              Servicios <br /> <span className="text-primary italic">de Alto Perfil</span>
            </PremiumHeading>
            <p className="text-editorial max-w-xl">
              Soluciones integrales diseñadas para proteger su legado y potenciar sus metas financieras con precisión absoluta.
            </p>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-48 lg:space-y-64">
          {categories.map((category, index) => {
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="layout-grid-12 items-center"
              >
                {isEven ? (
                  <>
                    <ParallaxImage src={category.image} alt={category.title} accent={category.accent} />
                    <div className="col-span-12 lg:col-start-9 lg:col-span-4 space-y-12 py-10">
                      <div className="space-y-6">
                        <span className="premium-label text-primary">
                          {category.tagline}
                        </span>
                        <PremiumHeading as="h3" className="text-5xl md:text-6xl">
                          {category.title}
                        </PremiumHeading>
                        <p className="text-editorial">
                          {category.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 pb-4">
                        {category.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-4 group/item">
                            <div className="h-[0.5px] w-6 bg-primary/40 group-hover/item:w-12 transition-all duration-500" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8">
                        <Link href={category.href} className="btn-premium w-full sm:w-auto">
                          <span>Gestionar {category.title}</span>
                          <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-12 lg:col-span-4 space-y-12 py-10 order-2 lg:order-1">
                      <div className="space-y-6">
                        <span className="premium-label text-primary">
                          {category.tagline}
                        </span>
                        <PremiumHeading as="h3" className="text-5xl md:text-6xl">
                          {category.title}
                        </PremiumHeading>
                        <p className="text-editorial">
                          {category.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 pb-4">
                        {category.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-4 group/item">
                            <div className="h-[0.5px] w-6 bg-primary/40 group-hover/item:w-12 transition-all duration-500" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8">
                        <Link href={category.href} className="btn-premium w-full sm:w-auto">
                          <span>Gestionar {category.title}</span>
                          <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                        </Link>
                      </div>
                    </div>
                    <div className="col-span-12 lg:col-start-6 lg:col-span-7 order-1 lg:order-2">
                       <ParallaxImage src={category.image} alt={category.title} accent={category.accent} />
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
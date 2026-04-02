"use client"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import Image from "next/image"
import { Target, Users, Lightbulb } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { PremiumHeading } from "./premium-typography"

function ParallaxImage({ src, alt }: { src: string, alt: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} className="absolute inset-0 w-full h-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-[-10%] w-[120%] h-[120%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover opacity-90"
        />
      </motion.div>
    </div>
  )
}

export function MissionVision() {
  const { ref } = useIntersectionObserver()

  return (
    <section className="relative overflow-hidden bg-background section-airy" ref={ref}>
      <div className="container layout-guide-visual">
        {/* Header Section */}
        <div className="layout-grid-12 mb-32">
          <div className="col-span-12 lg:col-span-8">
            <span className="premium-label mb-6 inline-block">Nuestra Esencia</span>
            <PremiumHeading as="h2" className="mb-10 leading-[0.9]">
              Compromiso <br /> <span className="text-[#E6C15A] italic">Inquebrantable</span>
            </PremiumHeading>
            <p className="text-editorial max-w-2xl">
              Novo Heritage Group SRL es una organización enfocada en suministrar asesoría de la más alta calidad a la hora de tomar la decisión de invertir su dinero de manera inteligente.
            </p>
          </div>
        </div>

        {/* Feature Image with Parallax */}
        <div className="relative w-full aspect-[21/8] overflow-hidden mb-32 shadow-3xl border border-white/5 bg-black/5">
          <ParallaxImage src="/Novo Heritage Group.jpg" alt="Novo Heritage Group" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none opacity-60" />
          
          {/* Subtle line decoration */}
          <div className="absolute bottom-0 left-0 w-full h-[0.5px] bg-primary/30" />
        </div>

        {/* Grid of Values */}
        <div className="layout-grid-12">
          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-12 md:col-span-4 glass-architectural p-12 space-y-8 group border-t-primary/20"
          >
            <div className="w-16 h-16 rounded-none bg-[#E6C15A]/5 flex items-center justify-center border border-[#E6C15A]/10 group-hover:bg-[#E6C15A]/10 transition-colors duration-700">
              <Target className="w-8 h-8 text-[#E6C15A]/80" />
            </div>
            <PremiumHeading as="h3" className="text-4xl">Misión</PremiumHeading>
            <p className="text-editorial text-base opacity-80 group-hover:opacity-100 transition-opacity">
              Brindar un servicio de Promoción, Venta y Asesoría Inmobiliaria, Servicios Turísticos y Corretaje de Seguros de forma personalizada orientada a cumplir con las exigencias de nuestros clientes.
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1 }}
             className="col-span-12 md:col-span-4 glass-architectural p-12 space-y-8 group border-t-primary/20"
          >
            <div className="w-16 h-16 rounded-none bg-[#E6C15A]/5 flex items-center justify-center border border-[#E6C15A]/10 group-hover:bg-[#E6C15A]/10 transition-colors duration-700">
              <Users className="w-8 h-8 text-[#E6C15A]/80" />
            </div>
            <PremiumHeading as="h3" className="text-4xl">Visión</PremiumHeading>
            <p className="text-editorial text-base opacity-80 group-hover:opacity-100 transition-opacity">
              Ser la mejor y más innovadora alternativa para quienes requieren la ayuda de un Profesional Inmobiliario, Promotor Turístico y Corredor de Seguros en un solo eje comercial.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="col-span-12 md:col-span-4 glass-architectural p-12 space-y-8 group border-t-primary/20"
          >
            <div className="w-16 h-16 rounded-none bg-[#E6C15A]/5 flex items-center justify-center border border-[#E6C15A]/10 group-hover:bg-[#E6C15A]/10 transition-colors duration-700">
              <Lightbulb className="w-8 h-8 text-[#E6C15A]/80" />
            </div>
            <PremiumHeading as="h3" className="text-4xl">Valores</PremiumHeading>
            <ul className="space-y-6">
              {['Proactividad', 'Pasión', 'Profesionalidad'].map((val) => (
                <li key={val} className="flex items-center gap-4 group/item">
                  <div className="w-8 h-[0.5px] bg-[#E6C15A]/40 group-hover/item:w-12 transition-all duration-500" />
                  <span className="premium-label text-foreground/80">{val}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

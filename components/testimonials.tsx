"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const testimonials = [
  {
    name: "Carlos Rodríguez",
    username: "@carlos_seguros",
    body: "Novo Heritage transformó completamente mi experiencia con seguros. Su servicio personalizado y atención al detalle es incomparable.",
    img: "/testimonial-1.png",
  },
  {
    name: "María González",
    username: "@maria_bienes",
    body: "Encontré la casa de mis sueños gracias a Novo Heritage. Su equipo de bienes raíces es profesional y confiable.",
    img: "/testimonial-2.png",
  },
  {
    name: "José Martínez",
    username: "@jose_turismo",
    body: "Los paquetes de turismo de Novo Heritage superaron todas mis expectativas. Cada detalle fue perfecto.",
    img: "/testimonial-3.png",
  },
  {
    name: "Ana López",
    username: "@ana_seguros",
    body: "La tranquilidad que me dan los seguros de Novo Heritage no tiene precio. Servicio excepcional.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Pedro Sánchez",
    username: "@pedro_inversiones",
    body: "Invertir en propiedades con Novo Heritage fue la mejor decisión. Rentabilidad garantizada.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    name: "Laura Torres",
    username: "@laura_viajes",
    body: "Cada viaje organizado por Novo Heritage es una experiencia inolvidable. Servicio de primera.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
  },
]

const TestimonialCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <div className="relative w-[420px] flex-shrink-0 overflow-hidden rounded-none glass-premium p-12 transition-all duration-700 hover:scale-[1.02] border border-primary/10 group shadow-premium" style={{ willChange: 'transform' }}>
      <div className="absolute -top-10 -right-10 -z-10 h-64 w-64 rounded-none bg-primary/5 blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>

      {/* Quote Mark - Luxury Serif */}
      <div className="text-6xl text-primary/30 font-serif italic leading-none mb-6">"</div>

      <div className="text-foreground/70 leading-relaxed font-sans text-lg italic tracking-tight mb-8">
        {body}
      </div>

      <div className="mt-auto flex items-center gap-4 border-t border-primary/10 pt-8">
        <div className="relative h-14 w-14 group-hover:scale-105 transition-transform duration-500">
           <img 
             src={img || "/placeholder.svg"} 
             alt={name} 
             className="h-full w-full object-cover rounded-none ring-2 ring-primary/20 p-0.5" 
           />
           <div className="absolute inset-0 rounded-none border border-primary/10 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
        </div>
        <div className="flex flex-col">
          <div className="font-serif italic text-xl tracking-tight text-foreground">{name}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">{username}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const trigger = triggerRef.current
    if (!section || !trigger) return

    const totalWidth = section.scrollWidth - (window.innerWidth * 0.8) // Adjust for padding

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: () => `+=${section.scrollWidth}`,
        scrub: 1.5,
        pin: true,
        anticipatePin: 1,
      }
    })

    tl.to(section, {
      x: -totalWidth,
      ease: "power2.inOut",
      force3D: true
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  const handleShareExperience = () => {
    const subject = encodeURIComponent("Quiero compartir mi experiencia con Novo Heritage")
    const body = encodeURIComponent("Hola equipo de Novo Heritage,%0D%0A%0D%0ADeseo compartir mi testimonio para publicarlo en la web.")
    window.open(`mailto:info@novoheritage.com?subject=${subject}&body=${body}`, "_blank")
  }

  return (
    <section id="testimonials" ref={triggerRef} className="min-h-screen flex flex-col justify-center overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-8 mb-20">
        <div className="flex flex-col items-center text-center">
          <div className="inline-block px-4 py-1.5 rounded-none glass-premium border border-primary/20 mb-8 animate-fade-in-up">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Testimonios Exclusivos</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-serif italic text-foreground tracking-tight mb-8 max-w-4xl">
            La confianza de nuestra <span className="text-primary italic">clientela distinguida</span>
          </h2>
          <div className="w-24 h-px bg-primary/30 mt-4 mb-4" />
        </div>
      </div>

      <div className="relative flex items-center overflow-hidden pb-12">
        <div
          ref={sectionRef}
          className="flex gap-12 px-8 md:px-[15vw]"
        >
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.username} {...testimonial} />
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center pb-20">
        <button
          type="button"
          onClick={handleShareExperience}
          className="group relative px-10 py-4 bg-primary text-black text-[12px] font-black uppercase tracking-[0.3em] rounded-none transition-all hover:translate-y-[-4px] hover:shadow-premium active:scale-95 flex items-center gap-3"
        >
          Compartir Experiencia
          <div className="w-1.5 h-1.5 bg-black rounded-none" />
        </button>
      </div>
    </section>
  )
}

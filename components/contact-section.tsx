"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
// @ts-ignore - lucide-react types not resolving correctly
import { Mail, Phone, MapPin, Loader2, CheckCircle2, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

export function ContactSection() {
  const { ref } = useIntersectionObserver()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        division: "contacto_general",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message || "Usuario ha contactado desde Contact Section principal",
        source: "contacto_general"
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("API Error");

      console.log("Form submitted via API:", formData)
      setIsSuccess(true)
      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      })

      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "", message: "" })
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="relative py-20 sm:py-32 px-4 bg-background overflow-hidden" ref={ref}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      <div className="container max-w-6xl mx-auto relative">
        <div className="text-center mb-12 sm:mb-20 animate-on-scroll">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif font-light text-balance mb-6 section-title text-foreground">Contáctanos</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estamos aquí para ayudarte. Envíanos un mensaje o contáctanos directamente por WhatsApp.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-16">
          {/* Contact Info */}
          <div className="space-y-8 sm:space-y-12 animate-on-scroll">
            <div className="space-y-6 sm:space-y-8">
              <h3 className="text-2xl sm:text-3xl font-serif font-light text-foreground">Información directa</h3>

              {/* WhatsApp Quick Action */}
              <a
                href="https://wa.me/18092157540"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 sm:p-6 rounded-none bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group active:scale-95"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_rgba(37,211,102,0.4)] group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg sm:text-xl text-foreground">WhatsApp</div>
                  <div className="text-sm sm:text-base text-[#25D366] font-medium">Respuesta inmediata</div>
                </div>
              </a>

              <div className="grid sm:grid-cols-1 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-none hover:bg-foreground/5 transition-colors">
                  <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground mb-0.5">Email</div>
                    <a href="mailto:novoheritagesales@gmail.com" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                      novoheritagesales@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-none hover:bg-foreground/5 transition-colors">
                  <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground mb-0.5">Teléfono</div>
                    <a href="tel:+18092157540" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors">
                      809-215-7540
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-none p-8 border border-border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              <h4 className="font-bold text-foreground mb-4">Horario de atención</h4>
              <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Lunes - Viernes</span>
                  <span className="text-foreground font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Sábado</span>
                  <span className="text-foreground font-medium">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingo</span>
                  <span className="text-red-400 font-medium">Cerrado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-morphism rounded-none p-6 sm:p-10 border border-border shadow-2xl animate-on-scroll relative">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] ml-1">
                    Nombre
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    className="h-14 rounded-none bg-background/40 border-primary/10 text-foreground focus:border-primary/50 focus:ring-primary/5 shadow-inner transition-all glass-architectural font-bold tracking-widest text-xs placeholder:text-foreground/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] ml-1">
                    Teléfono
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (---) --- ----"
                    className="h-14 rounded-none bg-background/40 border-primary/10 text-foreground focus:border-primary/50 focus:ring-primary/5 shadow-inner transition-all glass-architectural font-bold tracking-widest text-xs placeholder:text-foreground/20"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] ml-1">
                  Email Patrimonial
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@patrimonio.com"
                  className="h-14 rounded-none bg-background/40 border-primary/10 text-foreground focus:border-primary/50 focus:ring-primary/5 shadow-inner transition-all glass-architectural font-bold tracking-widest text-xs placeholder:text-foreground/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] ml-1">
                  Descripción del Requerimiento
                </label>
                <Textarea
                  id="message"
                  placeholder="¿En qué podemos asistirle hoy?"
                  rows={4}
                  className="rounded-none bg-background/40 border-primary/10 text-foreground focus:border-primary/50 focus:ring-primary/5 shadow-inner transition-all resize-none glass-architectural font-bold tracking-widest text-xs placeholder:text-foreground/20"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-16 rounded-none bg-primary text-black font-black uppercase tracking-[0.4em] text-xs shadow-premium hover:shadow-premium-hover hover:-translate-y-1 active:scale-95 transition-all duration-500"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  "Iniciar Gestión de Contacto"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}


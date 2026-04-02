import Link from "next/link"
// @ts-ignore - lucide-react types not resolving correctly
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    servicios: [
      { name: "Seguros de Vehículos", href: "/seguros" },
      { name: "Bienes Raíces", href: "/bienes-raices" },
      { name: "Turismo Express", href: "/turismo" },
    ],
    empresa: [
      { name: "Nuestra Historia", href: "/nosotros" },
      { name: "Misión y Visión", href: "/nosotros" },
      { name: "Contacto Directo", href: "/#contacto" },
    ],
    legal: [
      { name: "Privacidad", href: "/privacidad" },
      { name: "Términos", href: "/terminos" },
      { name: "Cookies", href: "/cookies" },
    ],
  }

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/novoheritage" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/novoheritage" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/novoheritage" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/novoheritage" },
  ]

  return (
    <footer className="bg-background border-t border-primary/5 text-foreground py-32 relative overflow-hidden">
      {/* Background Texture Detail */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,var(--premium-gold-glow),transparent_50%)]" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-10">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Logo className="h-12 w-44 brightness-0 dark:invert" />
            </Link>
            <p className="text-xs text-foreground/40 max-w-sm leading-relaxed font-black uppercase tracking-[0.2em]">
              Elevando el estándar en <span className="text-primary italic">propiedad, protección y experiencias</span> con asesoría de clase mundial.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#E6C15A] mt-1 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                  Av. Winston Churchill, Santo Domingo, RD
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+18092157540" className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors">
                  809-215-7540
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:novoheritagesales@gmail.com" className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors">
                  novoheritagesales@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {[
            { title: "Servicios", links: footerLinks.servicios },
            { title: "Empresa", links: footerLinks.empresa },
            { title: "Legal", links: footerLinks.legal },
          ].map((col) => (
            <div key={col.title} className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#E6C15A]">
                {col.title}
              </h3>
              <ul className="space-y-5">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            © {currentYear} Novo Heritage Group SRL. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-none border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all duration-500 hover:scale-110 shadow-lg"
                  aria-label={social.name}
                >
                  <Icon className="w-4 h-4" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}

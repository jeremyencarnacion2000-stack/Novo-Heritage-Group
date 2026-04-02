"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export default function DivisionSubmenu() {
  const pathname = usePathname()

  const isSeguros = pathname?.startsWith("/seguros") ?? false
  const isBienes = pathname?.startsWith("/bienes-raices") ?? false
  const isTurismo = pathname?.startsWith("/turismo") ?? false

  let links: { href: string; label: string }[] = []

  if (isSeguros) {
    links = [
      { href: "#planes", label: "Planes" },
      { href: "#cotizaciones", label: "Cotizaciones" },
      { href: "#beneficios", label: "Beneficios" },
      { href: "#reclamaciones", label: "Reclamaciones" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ]
  } else if (isBienes) {
    links = [
      { href: "#propiedades", label: "Propiedades" },
      { href: "#cotizador-roi", label: "Cotizador ROI" },
      { href: "#servicios", label: "Servicios" },
      { href: "#vender", label: "Vender" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ]
  } else if (isTurismo) {
    links = [
      { href: "#paquetes", label: "Paquetes" },
      { href: "#cotizador", label: "Cotizador" },
      { href: "#beneficios", label: "Beneficios" },
      { href: "#reservas", label: "Reservas" },
      { href: "#faq", label: "Preguntas frecuentes" },
    ]
  }

  if (links.length === 0) return null

  return (
    <div className="fixed bottom-12 left-0 right-0 z-50 pointer-events-none flex justify-center">
      <nav
        className="pointer-events-auto flex items-center gap-2 overflow-x-auto px-4 py-2 bg-[#050505]/80 backdrop-blur-2xl border border-primary/20 rounded-none shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        aria-label="Menú secundario de acceso rápido"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/50 hover:text-primary transition-colors px-4 py-2 rounded-none hover:bg-primary/10 whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

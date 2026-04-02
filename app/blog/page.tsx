"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Star,
  TrendingUp,
  Clock,
  Hash
} from "lucide-react"
import { useState } from "react"
import BlogSection from "../../skiper-ui-clone/components/blog-section"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"

interface BlogPost {
  slug: string
  title: string
  summary: string
  imageUrl: string
  category: string
  author: string
  authorImageUrl: string
  date: string
}

const dummyPosts: BlogPost[] = [
  {
    slug: "guia-completa-seguros-de-vida",
    title: "Guía Completa de Seguros de Vida: Protegiendo a tu Familia",
    summary: "Entender los seguros de vida puede ser complicado. Te guiamos a través de los diferentes tipos, beneficios y cómo elegir el plan perfecto para tus seres queridos.",
    imageUrl: "/placeholder.jpg",
    category: "Seguros",
    author: "Ana García",
    authorImageUrl: "/placeholder-user.jpg",
    date: "12 de Oct, 2025",
  },
  {
    slug: "inversion-inteligente-bienes-raices",
    title: "Inversión Inteligente: 5 Consejos para Comprar tu Primera Propiedad",
    summary: "El mercado inmobiliario ofrece grandes oportunidades. Aprende los pasos clave para realizar una inversión segura y rentable en tu primera casa o apartamento.",
    imageUrl: "/luxury-modern-real-estate-property.jpg",
    category: "Bienes Raíces",
    author: "Carlos Martínez",
    authorImageUrl: "/placeholder-user.jpg",
    date: "10 de Oct, 2025",
  },
  {
    slug: "destinos-turisticos-para-desconectar",
    title: "Top 3 Destinos en el Caribe para Desconectar y Recargar Energías",
    summary: "¿Necesitas un descanso? Descubre playas paradisíacas, resorts de lujo y actividades inolvidables en los destinos más espectaculares del Caribe.",
    imageUrl: "/luxury-travel-destination-beach-resort.jpg",
    category: "Turismo",
    author: "Sofía Rodríguez",
    authorImageUrl: "/placeholder-user.jpg",
    date: "8 de Oct, 2025",
  },
]


export default function BlogPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        const headerOffset = 120
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000",
        }}
      />

      {/* Desktop Header */}
      <Header isScrolled={isScrolled} />

      {/* Mobile Header */}
      <MobileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleMobileNavClick={handleMobileNavClick}
      />

      {/* Blog Section */}
      <BlogSection />

      {/* Footer */}
      <Footer />

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}

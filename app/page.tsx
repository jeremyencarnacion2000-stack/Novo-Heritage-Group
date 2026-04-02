"use client"

import { useState, useEffect } from "react"
import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"
import { ClientErrorBoundary } from "@/components/client-error-boundary"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import dynamic from "next/dynamic"
import { Spinner } from "@/components/ui/spinner"
import "./home.css"

const LoadingFallback = () => (
  <div className="w-full h-[400px] flex items-center justify-center bg-background">
    <Spinner className="w-8 h-8 text-primary" />
  </div>
)

const CategoryShowcase = dynamic(() => import("@/components/category-showcase").then(mod => mod.CategoryShowcase), {
  ssr: false,
  loading: () => <LoadingFallback />
})
const StatsCounter = dynamic(() => import("@/components/stats-counter").then(mod => mod.StatsCounter), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-foreground/5 rounded-sm" />
})
const TestimonialsSection = dynamic(() => import("@/components/testimonials").then(mod => mod.TestimonialsSection), {
  ssr: false,
  loading: () => <LoadingFallback />
})
const FAQSection = dynamic(() => import("@/components/faq-section").then(mod => mod.FAQSection), {
  ssr: false,
  loading: () => <LoadingFallback />
})
const ContactSection = dynamic(() => import("@/components/contact-section").then(mod => mod.ContactSection), {
  ssr: false,
  loading: () => <LoadingFallback />
})
const MissionVision = dynamic(() => import("@/components/mission-vision").then(mod => mod.MissionVision), {
  ssr: false,
  loading: () => <LoadingFallback />
})
const TrustBadges = dynamic(() => import("@/components/trust-badges").then(mod => mod.TrustBadges), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse bg-foreground/5 rounded-sm" />
})
const DynamicOfferBanner = dynamic(() => import("@/components/dynamic-offer-banner").then(mod => mod.DynamicOfferBanner), {
  ssr: false
})
const Chatbot = dynamic(() => import("@/components/chatbot"), { ssr: false })

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomCursor } from "@/components/custom-cursor"
import { SidebarNav } from "@/components/sidebar-nav"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [introFinished, setIntroFinished] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Initial lock for cinematic intro
    if (!introFinished) {
      window.dispatchEvent(new CustomEvent("lock-scroll"))
    } else {
      window.dispatchEvent(new CustomEvent("unlock-scroll"))
    }

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const revealElements = gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]")

      revealElements.forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        )
      })
    })

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      ctx.revert()
    }
  }, [introFinished])

  return (
    <div className={`min-h-screen w-full relative bg-background ${!introFinished ? "h-screen overflow-hidden" : ""}`}>
      <DynamicOfferBanner />
      <CustomCursor />

      {/* Navigation Layer */}
      <Header 
        isScrolled={isScrolled} 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isIntroFinished={introFinished}
      />
      <SidebarNav isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MobileHeader
        isMobileMenuOpen={isSidebarOpen}
        setIsMobileMenuOpen={setIsSidebarOpen}
        handleMobileNavClick={() => {}}
        isIntroFinished={introFinished}
      />

      {/* Hero Core */}
      <ClientErrorBoundary name="Hero">
        <Hero 
          introFinished={introFinished}
          onIntroComplete={() => setIntroFinished(true)} 
        />
      </ClientErrorBoundary>

      {/* Main Content Flow */}
      <main className={`transition-opacity duration-1000 ${introFinished ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        
        {/* Trust Badges - Social Proof Anchor */}
        <div data-scroll-reveal>
          <TrustBadges />
        </div>

        {/* Feature Sections - Grid of Services */}
        <section id="features" data-scroll-reveal>
          <CategoryShowcase />
        </section>

        {/* Brand Essence */}
        <section id="mision" data-scroll-reveal>
          <MissionVision />
        </section>

        {/* Statistics - Proof of Scale */}
        <section className="bg-background py-32" data-scroll-reveal>
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <StatsCounter value={10000} suffix="+" label="Clientes Satisfechos" />
              <StatsCounter value={4.9} decimals={1} suffix="/5" label="Calificación Promedio" />
              <StatsCounter value={15} suffix="+" label="Años de Experiencia" />
              <StatsCounter value={98} suffix="%" label="Tasa de Éxito Real" />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" data-scroll-reveal>
          <TestimonialsSection />
        </section>

        {/* FAQ */}
        <section id="faq" data-scroll-reveal>
          <FAQSection />
        </section>

        {/* Contact Form */}
        <section id="contacto" data-scroll-reveal>
          <ContactSection />
        </section>

        {/* Global Footer */}
        <Footer />
      </main>

      {/* Chatbot Overlay */}
      {introFinished && (
        <ClientErrorBoundary name="Chatbot">
          <Chatbot />
        </ClientErrorBoundary>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"
import { BLOG_POSTS, BlogPost } from "@/lib/blog-data"
import { BlogCard } from "@/components/blog-card"
import { PremiumHeading, PremiumText } from "@/components/premium-typography"
// @ts-ignore
import { Search, Filter, X } from "lucide-react"

export default function BlogPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const categories = ["All", "Seguros", "Inmuebles", "Turismo", "Lifestyle"]

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.pageYOffset - 120,
          behavior: "smooth",
        })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen w-full relative bg-[#050505] overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[100vh] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-[20vh] -left-[10vw] w-[40vw] h-[40vw] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute top-[60vh] -right-[10vw] w-[30vw] h-[30vw] bg-amber-500/5 blur-[100px] rounded-full" />
      </div>

      <Header isScrolled={isScrolled} />
      <MobileHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleMobileNavClick={handleMobileNavClick}
      />

      <main className="relative z-10 pt-48 pb-32 container mx-auto px-6">
        {/* Editorial Header */}
        <div className="max-w-4xl mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-primary mb-6 block">
              Editorial Heritage
            </span>
            <PremiumHeading as="h1" className="mb-8 text-7xl md:text-9xl leading-[0.85]">
              Perspectivas de <span className="italic">Excelencia</span>
            </PremiumHeading>
            <PremiumText className="text-xl md:text-2xl text-white/60 font-light max-w-2xl">
              Descubra artículos analíticos, guías de inversión y las últimas tendencias en estilo de vida premium gestionadas por nuestros expertos.
            </PremiumText>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] uppercase tracking-[0.3em] font-black px-6 py-3 transition-all duration-500 border rounded-none ${
                    activeCategory === cat 
                    ? "bg-primary text-black border-primary scale-105" 
                    : "text-white/40 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Buscar perspectivas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-xs tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all rounded-none"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3 text-white/40 hover:text-white" />
                </button>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </AnimatePresence>
        </div>
        
        {filteredPosts.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
            >
                <PremiumText className="text-white/40 uppercase tracking-[0.4em] font-black">
                    No se encontraron artículos
                </PremiumText>
            </motion.div>
        )}
      </main>

      <Footer />
      <Chatbot />
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"
import { BLOG_POSTS } from "@/lib/blog-data"
import { PremiumHeading, PremiumText } from "@/components/premium-typography"
// @ts-ignore
import { ArrowLeft, Clock, Calendar, Share2, MessageCircle } from "lucide-react"

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const post = BLOG_POSTS.find(p => p.slug === params.slug)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <PremiumText className="text-primary uppercase tracking-[0.5em] font-black">Artículo no encontrado</PremiumText>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full relative bg-[#050505] overflow-x-hidden">
      <Header isScrolled={isScrolled} />
      
      <main className="relative z-10 pt-48 pb-32">
        <article className="container mx-auto px-6 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link 
              href="/blog" 
              className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black text-white/40 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
              Volver a la Editorial
            </Link>
          </motion.div>

          {/* Post Header */}
          <header className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] uppercase tracking-[0.6em] font-black text-primary mb-6 block">
                {post.category}
              </span>
              <PremiumHeading as="h1" className="mb-10 text-5xl md:text-7xl leading-[1.1]">
                {post.title}
              </PremiumHeading>
              
              <div className="flex flex-wrap items-center gap-8 py-8 border-y border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-primary/20 relative">
                    <Image src={post.authorImageUrl} alt={post.author} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{post.author}</span>
                    <span className="text-[8px] uppercase tracking-tighter text-white/40">Expert Advisor</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 ml-auto">
                    <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}
                    </div>
                </div>
              </div>
            </motion.div>
          </header>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative h-[60vh] w-full mb-20 overflow-hidden glass-premium border border-white/10"
          >
             <Image src={post.imageUrl} alt={post.title} fill className="object-cover brightness-75 scale-105" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="prose prose-invert prose-lg max-w-none prose-p:text-white/60 prose-p:font-light prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-light prose-headings:text-white prose-strong:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Post Footer */}
          <footer className="mt-32 pt-12 border-t border-white/10 flex items-center justify-between">
             <div className="flex items-center gap-6">
                <button className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" /> Compartir
                </button>
                <button className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" /> Comentar
                </button>
             </div>
             
             <Link 
              href="/nosotros#contacto" 
              className="px-10 py-4 bg-primary text-black text-[10px] font-black uppercase tracking-[0.3em] hover:shadow-premium transition-all"
             >
                Consultar con {post.author.split(' ')[0]}
             </Link>
          </footer>
        </article>
      </main>

      <Footer />
      <Chatbot />
    </div>
  )
}


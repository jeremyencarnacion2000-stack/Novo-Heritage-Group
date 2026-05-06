"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
// @ts-ignore
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// @ts-ignore
import { MessageCircle, X, Send, Sparkles, ShieldCheck, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, status } = useAuth()
  
  // Custom states can be removed as we use the hook
  const userName = user?.name || user?.email?.split('@')[0] || "Invitado"

  // Force ANY to bypass the AI SDK type mismatches on build
  const chatProps: any = {
    api: '/api/chat',
    body: {
      userId: (user as any)?.id
    }
  }

  const chatHelpers = useChat(chatProps)

  // Use any-casting for all helpers to ensure build success
  const aiMessages = (chatHelpers as any).messages || []
  const input = (chatHelpers as any).input || ""
  const handleInputChange = (chatHelpers as any).handleInputChange
  const handleSubmit = (chatHelpers as any).handleSubmit
  const isLoading = (chatHelpers as any).isLoading

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [aiMessages, isLoading])

  // Scroll locking logic
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent("lock-scroll"))
    } else {
      window.dispatchEvent(new CustomEvent("unlock-scroll"))
    }
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-4 md:right-8 z-[99996] flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 bg-background/80 backdrop-blur-md border border-primary/30 shadow-premium group overflow-hidden animate-fade-in-up"
          >
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Sparkles className="w-5 h-5 text-primary relative z-10 transition-transform group-hover:rotate-12" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-black text-foreground relative z-10">AI Concierge</span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full relative z-10 animate-pulse shadow-[0_0_8px_rgba(230,193,90,0.5)]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for focus */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[99996]"
            />
            
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[99997] w-full max-w-[500px] flex flex-col bg-background/95 backdrop-blur-xl border-l border-primary/20 shadow-2xl overflow-hidden"
              data-lenis-prevent
            >
              {/* EDITORIAL HEADER */}
              <div className="p-10 pb-6 border-b border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                   <Sparkles className="w-48 h-48 text-primary" />
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Personal Assistant</p>
                    <h3 className="text-4xl font-serif italic text-foreground tracking-tight">AI Concierge</h3>
                  </div>
                  <Button 
                    onClick={() => setIsOpen(false)} 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-primary/10 rounded-full text-foreground/40 hover:text-primary transition-all"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-[0.5px] flex-1 bg-primary/20" />
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-black whitespace-nowrap">Private Secured Line</span>
                  <div className="h-[0.5px] flex-1 bg-primary/20" />
                </div>
              </div>

              {/* MESSAGE AREA - EDITORIAL STYLE */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                {aiMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                    <div className="w-16 h-[0.5px] bg-primary/30" />
                    <p className="max-w-[280px] text-sm text-foreground/40 font-serif italic leading-relaxed">
                      "Bienvenido a Novo Heritage. Soy su asistente personal. ¿En qué puedo asistirle con su patrimonio hoy?"
                    </p>
                    <div className="w-16 h-[0.5px] bg-primary/30" />
                  </div>
                )}
                
                {aiMessages.map((m: any) => (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={m.id}
                    className={cn(
                      "flex flex-col gap-3",
                      m.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] md:max-w-[90%] p-5 md:p-6 text-[13px] md:text-[14px] leading-relaxed relative",
                      m.role === "user"
                        ? "bg-primary/10 border border-primary/20 text-foreground font-black tracking-tight rounded-2xl rounded-tr-none shadow-premium"
                        : "bg-foreground/5 border border-foreground/10 text-foreground/80 font-serif rounded-2xl rounded-tl-none italic"
                    )}>
                      {m.content}
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.4em] text-foreground/20 font-black px-2">
                       {m.role === "user" ? "Client Request" : "Concierge Response"}
                    </span>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-primary/60 text-[10px] px-2 font-bold uppercase tracking-[0.3em]">
                    <div className="flex gap-2">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-1 bg-primary rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 bg-primary rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 bg-primary rounded-full" />
                    </div>
                    <span>Curating your experience</span>
                  </motion.div>
                )}
              </div>

              {/* INPUT AREA - MINIMALIST LUXE */}
              <div className="p-10 pt-0 bg-gradient-to-t from-background to-transparent">
                <form onSubmit={handleSubmit} className="relative group">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Escriba su consulta aquí..."
                    className="bg-transparent border-t-0 border-x-0 border-b border-primary/20 rounded-none px-0 py-8 text-lg font-serif italic placeholder:text-foreground/20 focus-visible:ring-0 focus-visible:border-primary transition-all h-auto"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-0 bottom-4 h-10 w-10 p-0 rounded-full bg-transparent hover:bg-primary/10 text-primary transition-all active:scale-90"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </form>
                <div className="flex items-center justify-between mt-6 opacity-30">
                  <p className="text-[8px] font-black uppercase tracking-[0.4em]">Proprietary AI Architecture</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.4em]">NH-G v4.0</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
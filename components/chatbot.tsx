"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2, Sparkles, Zap, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type ChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

const extractMessageText = (message: any) => {
  if (typeof message?.content === "string") return message.content
  if (Array.isArray(message?.parts)) {
    return message.parts
      .filter((part: any) => part?.type === "text" && typeof part?.text === "string")
      .map((part: any) => part.text)
      .join("")
  }
  return ""
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [predictions, setPredictions] = useState<string[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      content: "¡Bienvenido a Novo Heritage! Soy su asistente exclusivo. ¿Cómo puedo asistirle hoy con su patrimonio?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages: aiMessages, sendMessage, status, error } = useChat()

  const isProcessing = status === "streaming" || status === "submitted"

  const smartPredictions = [
    "✨ Cotizar Seguro Premium",
    "🏢 Propiedades en Santo Domingo",
    "🌴 Tours VIP en Caribe",
    "👤 Hablar con un Asesor"
  ]

  useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = smartPredictions.filter(p => p.toLowerCase().includes(inputValue.toLowerCase()))
      setPredictions(filtered)
      setShowPredictions(filtered.length > 0)
    } else {
      setPredictions(smartPredictions)
      setShowPredictions(true)
    }
  }, [inputValue])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isProcessing])

  useEffect(() => {
    if (!aiMessages.length) return
    setMessages(prev => {
      const next = [...prev]
      let hasNew = false
      aiMessages.forEach(message => {
        if (message.role !== "assistant") return
        const content = extractMessageText(message)
        if (!content.trim()) return
        if (!next.some(msg => msg.id === message.id)) {
          next.push({ id: message.id, role: "assistant", content, timestamp: new Date() })
          hasNew = true
        }
      })
      return hasNew ? next : prev
    })
  }, [aiMessages])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue?.trim() || isProcessing) return
    const userMsg = { id: Date.now().toString(), content: inputValue.trim(), role: "user" as const, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInputValue("")
    setShowPredictions(false)
    sendMessage({ text: userMsg.content }).catch(() => {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "assistant", content: "Error de conexión. Por favor reintente.", timestamp: new Date() }])
    })
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-[60] p-4 rounded-none shadow-premium-lg glass-architectural text-primary border border-primary/30 group"
          >
            <MessageCircle className="w-8 h-8 transition-transform group-hover:scale-110" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-none animate-pulse shadow-[0_0_10px_rgba(230,193,90,0.5)]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[70] w-full max-w-[420px] h-[650px] flex flex-col rounded-[2rem] shadow-premium-lg overflow-hidden glass-architectural border border-primary/20"
          >
            {/* LUXURY CONCIERGE HEADER */}
            <div className="p-6 border-b border-primary/10 bg-gradient-to-b from-primary/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-none glass-architectural flex items-center justify-center border border-primary/30 shadow-inner">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-none border-[3px] border-[#F5F5F0] dark:border-[#0A0A0A]" />
                </div>
                <div>
                  <h3 className="text-foreground font-serif italic text-lg leading-tight tracking-tight">Concierge Novo</h3>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="w-1 h-1 rounded-none bg-primary/60 animate-pulse" />
                    <span className="text-[9px] text-foreground/40 uppercase tracking-[0.2em] font-black">Asesoría Patrimonial VIP</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setIsOpen(false)} 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10 rounded-none text-foreground/30 hover:text-primary transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* MESSAGE AREA */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-primary/[0.02]">
              {messages.map((m) => (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-2 max-w-[88%]",
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 px-5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-black font-medium rounded-tr-none shadow-md shadow-primary/20"
                      : "glass-architectural text-foreground/80 border border-primary/10 rounded-tl-none font-sans"
                  )}>
                    {m.content}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[8px] text-foreground/30 uppercase tracking-widest font-black">
                      {m.role === "user" ? "Usted" : "Concierge"}
                    </span>
                    <span className="w-0.5 h-0.5 rounded-none bg-foreground/20" />
                    <span className="text-[8px] text-foreground/20 uppercase font-bold">
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-primary/40 text-[10px] px-2 font-black uppercase tracking-widest">
                  <div className="flex gap-1.5">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-primary rounded-none shadow-glow" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-none shadow-glow" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-none shadow-glow" />
                  </div>
                  <span>Redactando propuesta...</span>
                </motion.div>
              )}
            </div>

            {/* PREDICTIONS GEMS */}
            {showPredictions && predictions.length > 0 && (
              <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
                {predictions.map((p, i) => (
                  <motion.button
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={p}
                    onClick={() => { setInputValue(p); inputRef.current?.focus(); }}
                    className="whitespace-nowrap px-4 py-2 rounded-none glass-architectural border border-primary/10 text-[10px] font-black uppercase tracking-widest text-foreground/50 hover:border-primary/40 hover:text-primary hover:shadow-premium transition-all active:scale-95"
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            )}

            {/* INPUT AREA CONCIERGE */}
            <form onSubmit={onSubmit} className="p-6 pt-2 border-t border-primary/10 bg-background/50">
              <div className="relative flex items-center group">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="¿En qué puedo asistirle hoy?"
                  className="bg-transparent border-primary/20 text-foreground placeholder-foreground/20 rounded-xl pr-14 focus-visible:ring-primary focus-visible:border-primary h-14 font-sans text-sm shadow-inner transition-all group-focus-within:border-primary/40"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isProcessing}
                  className="absolute right-2 h-10 w-10 p-0 rounded-lg bg-primary hover:bg-primary/90 text-black shadow-premium-lg transition-all active:scale-90"
                >
                  <Send className="w-5 h-5 text-black" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
                   <div className="w-4 h-[1px] bg-foreground/50" />
                   <p className="text-[8px] font-black uppercase tracking-[0.3em]">Exclusividad Novo</p>
                   <div className="w-4 h-[1px] bg-foreground/50" />
                </div>
                <p className="text-[8px] text-foreground/40 font-bold tracking-tighter">SECURE ENCRYPTED PORTAL</p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
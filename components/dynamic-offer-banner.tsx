"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, X, ArrowRight, Sparkles } from "lucide-react"

export function DynamicOfferBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 44,
        seconds: 59
    })

    useEffect(() => {
        // Show banner after a short delay
        const showTimer = setTimeout(() => setIsVisible(true), 2000)

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 }
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
                }
                return prev
            })
        }, 1000)

        return () => {
            clearTimeout(showTimer)
            clearInterval(timer)
        }
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-12 right-12 z-[99995] max-w-[360px] w-full"
                >
                    <div className="bg-background border border-primary/20 p-10 shadow-3xl relative overflow-hidden group">
                        {/* Elegant Corner Accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 -rotate-45 translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-all duration-700" />
                        
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-foreground/20 hover:text-primary transition-colors active:scale-90"
                            aria-label="Cerrar invitación"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col gap-8 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-px w-8 bg-primary/40" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                                        Private Invitation
                                    </p>
                                </div>
                                
                                <h3 className="text-3xl font-serif italic text-foreground leading-tight tracking-tight">
                                    Un estándar superior <br/>
                                    <span className="text-primary not-italic font-light">para su legado.</span>
                                </h3>
                                
                                <p className="text-xs text-foreground/50 leading-relaxed font-light tracking-wide">
                                    Obtenga una cortesía exclusiva del <span className="text-foreground font-medium">20% de descuento</span> en su primera arquitectura de protección patrimonial.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6 pt-6 border-t border-primary/10">
                                <div className="flex items-center gap-4">
                                    <Clock className="w-4 h-4 text-primary/30" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase tracking-widest text-foreground/30 font-black">Offer Expires In</span>
                                        <span className="text-sm font-mono font-medium text-foreground/70">
                                            {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>

                                <a
                                    href="https://wa.me/18092157540?text=Hola,%20me%20gustaría%20obtener%20la%20cortesía%20exclusiva%20del%2020%%20en%20Novo%20Heritage."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button className="w-full flex items-center justify-between bg-primary text-black px-8 py-5 text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 shadow-premium">
                                        <span>Solicitar Cortesía</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </a>
                                
                                <p className="text-[7px] text-center uppercase tracking-[0.5em] text-foreground/20 font-black">
                                    Exclusivo Novo Heritage Group
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

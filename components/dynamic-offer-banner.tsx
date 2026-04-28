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
                    initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 right-6 z-[100] max-w-[320px] w-full"
                >
                    <div className="glass-premium border-glow rounded-3xl p-5 shadow-2xl relative overflow-hidden group">
                        {/* Background Accent */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full group-hover:bg-amber-500/20 transition-colors duration-500" />

                        <button
                            onClick={() => setIsVisible(false)}
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}
                            className="absolute top-0 right-0 hover:bg-foreground/5 rounded-full transition-colors text-muted-foreground hover:text-foreground z-50 active:scale-90"
                            aria-label="Cerrar oferta"
                        >
                            <X style={{ width: '24px', height: '24px' }} />
                        </button>

                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/80 mb-0.5">
                                        Oferta Exclusiva
                                    </p>
                                    <p className="text-sm font-semibold text-foreground leading-tight">
                                        20% de descuento en tu primer seguro
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border">
                                <div className="flex items-center gap-2 font-mono text-xs font-medium text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                                </div>

                                <a
                                    href="https://wa.me/18092157540?text=Hola,%20me%20gustaría%20obtener%20el%2020%%20de%20descuento%20en%20mi%20primer%20seguro."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95">
                                        Obtener
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

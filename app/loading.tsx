"use client"

import { motion } from "framer-motion"
import { Logo } from "@/components/logo"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#050505] overflow-hidden">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-12 relative"
        >
          <Logo className="h-16 w-64 md:h-20 md:w-80" />
          
          {/* Subtle Shine Effect */}
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "200%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] pointer-events-none"
          />
        </motion.div>

        {/* Loading Progress Wrapper */}
        <div className="w-48 h-px bg-white/10 relative overflow-hidden mb-6">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-2/3 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>

        {/* Minimalist Text Branding */}
        <div className="flex flex-col items-center gap-2">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-[10px] uppercase tracking-[0.6em] font-black text-primary/60"
          >
            Excelencia Patrimonial
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="flex items-center gap-4 mt-2"
          >
            <div className="h-[0.5px] w-8 bg-white/20" />
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-white/40">Secure Line</span>
            <div className="h-[0.5px] w-8 bg-white/20" />
          </motion.div>
        </div>
      </div>

      {/* Decorative Border Accents */}
      <div className="absolute top-8 left-8 bottom-8 right-8 border border-white/[0.03] pointer-events-none" />
      <div className="absolute top-12 left-12 bottom-12 right-12 border border-white/[0.02] pointer-events-none" />
    </div>
  )
}



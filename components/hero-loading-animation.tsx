"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const HeroLoadingAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-12">
            {/* Logo Container with Ambient Glow */}
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative z-10 w-32 h-32 md:w-40 md:h-40"
                >
                    <Image
                        src="/Icono.png"
                        alt="Novo Heritage Logo"
                        fill
                        className="object-contain brightness-125"
                    />
                </motion.div>
                
                {/* Golden Pulsing Glow */}
                <motion.div 
                    animate={{ 
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full z-0"
                />
            </div>

            {/* Typography & Progress */}
            <div className="flex flex-col items-center gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col items-center"
                >
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.8em] text-white/80 mb-2">
                        Novo Heritage
                    </h2>
                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-primary/60 font-medium">
                        Excelencia Patrimonial
                    </p>
                </motion.div>

                {/* Minimalist Progress Bar */}
                <div className="w-48 h-[1px] bg-white/5 relative overflow-hidden">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                </div>
            </div>
        </div>
    );
}

export default HeroLoadingAnimation;
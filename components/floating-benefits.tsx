"use client"

import { motion } from "framer-motion"
// @ts-ignore - lucide-react types not resolving correctly
import { Shield, Building2, Plane } from "lucide-react"

const benefits = [
    {
        icon: Shield,
        title: "Protección Total",
        description: "Seguros de vida y auto",
        position: "top-20 left-8",
        delay: 0,
    },
    {
        icon: Building2,
        title: "Inversiones Seguras",
        description: "Bienes raíces premium",
        position: "top-32 right-8",
        delay: 0.5,
    },
    {
        icon: Plane,
        title: "Viajes Exclusivos",
        description: "Experiencias únicas",
        position: "bottom-40 left-12",
        delay: 1,
    },
]

export function FloatingBenefits() {
    return (
        <>
            {benefits.map((benefit, index) => (
                <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + benefit.delay }}
                    className={`absolute ${benefit.position} hidden lg:block z-20`}
                >
                    <div className={`glass-premium rounded-2xl p-4 shadow-premium animate-float ${index === 1 ? 'animate-float-delay-1' : index === 2 ? 'animate-float-delay-2' : ''}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <benefit.icon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{benefit.title}</p>
                                <p className="text-xs text-white/40">{benefit.description}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </>
    )
}

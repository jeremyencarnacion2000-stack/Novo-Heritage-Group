"use client"

// @ts-ignore - lucide-react types not resolving correctly
import { ShieldCheck, Users, Star, Award } from "lucide-react"
import { motion } from "framer-motion"

const badges = [
    {
        icon: ShieldCheck,
        label: "SSL Secure",
        description: "Transacciones protegidas",
    },
    {
        icon: Users,
        label: "10,000+ Clientes",
        description: "Confían en nosotros",
    },
    {
        icon: Star,
        label: "98% Satisfacción",
        description: "Tasa de éxito real",
    },
    {
        icon: Award,
        label: "15+ Años",
        description: "Liderando el mercado",
    },
]

export function TrustBadges() {
    return (
        <section className="bg-background section-airy border-y border-border/40">
            <div className="container layout-guide-visual">
                <div className="layout-grid-12 gap-y-16">
                    {badges.map((badge, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 1, ease: "easeOut" }}
                            className="col-span-6 lg:col-span-3 flex flex-col items-center text-center group"
                        >
                            <div className="mb-10 relative">
                                <div className="w-24 h-24 flex items-center justify-center border border-border/60 transition-all duration-1000 group-hover:border-primary/60 group-hover:bg-primary/5 shadow-premium">
                                    <badge.icon className="w-10 h-10 text-[#E6C15A]/60 group-hover:text-[#E6C15A] transition-all duration-1000 group-hover:scale-110" />
                                </div>
                                {/* Elegant Corner Detail */}
                                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-[#E6C15A] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-[#E6C15A] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </div>

                            <div className="space-y-4">
                                <h3 className="premium-label text-foreground tracking-[0.4em]">
                                    {badge.label}
                                </h3>
                                <div className="w-12 h-[0.5px] bg-[#E6C15A]/40 mx-auto transition-all duration-700 group-hover:w-16 group-hover:bg-[#E6C15A]" />
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.25em] leading-relaxed max-w-[180px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity">
                                    {badge.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

"use client"

import { motion, AnimatePresence } from "framer-motion"
// @ts-ignore - lucide-react types not resolving correctly
import { X, Home, Shield, Building2, Plane, MessageSquare, Info, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface SidebarNavProps {
    isOpen: boolean
    onClose: () => void
}

const menuItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: Shield },
    { name: "Seguros", href: "/seguros", icon: Shield },
    { name: "Bienes Raíces", href: "/bienes-raices", icon: Building2 },
    { name: "Turismo", href: "/turismo", icon: Plane },
    { name: "Nosotros", href: "#nosotros", icon: Info },
    { name: "Contacto", href: "#contacto", icon: MessageSquare },
]

export function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith("#")) {
            e.preventDefault()
            onClose()
            const element = document.querySelector(href)
            if (element) {
                const headerOffset = 100
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                })
            }
        } else {
            onClose()
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[9998]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 left-0 h-full w-full max-w-[400px] z-[9999] glass-premium border-r border-border shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 flex items-center justify-between border-b border-border">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/60 mb-1">
                                    Novo Heritage
                                </span>
                                <span className="text-xl font-serif text-foreground">Menú</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center rounded-none glass-premium border-glow hover:scale-110 transition-all duration-300 group"
                            >
                                <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 overflow-y-auto py-12 px-8">
                            <div className="flex flex-col gap-2">
                                {menuItems.map((item, index) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={(e) => handleNavClick(e, item.href)}
                                            className="group flex items-center justify-between p-4 rounded-none hover:bg-foreground/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 flex items-center justify-center rounded-none bg-foreground/5 border border-border group-hover:border-amber-500/30 group-hover:bg-amber-500/10 transition-all">
                                                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-amber-400 transition-colors" />
                                                </div>
                                                <span className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/0 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </nav>

                        {/* Footer */}
                        <div className="p-8 border-t border-border">
                            <div className="glass-premium rounded-none p-6 border-glow">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm font-medium text-foreground">Tema Visual</span>
                                    <div className="scale-75 origin-right">
                                        <ThemeToggle />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-4 font-light leading-relaxed">
                                    ¿Necesitas asesoría personalizada? Nuestro equipo está listo para ayudarte.
                                </p>
                                <Link
                                    href="#contacto"
                                    onClick={(e) => handleNavClick(e, "#contacto")}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-none text-sm font-bold transition-all"
                                >
                                    Hablar con un experto
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

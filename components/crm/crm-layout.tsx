"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    FiLayout as LayoutDashboard,
    FiHome as Building2,
    FiUsers as Users,
    FiMessageSquare as MessageSquare,
    FiSettings as Settings,
    FiLogOut as LogOut,
    FiMenu as Menu,
    FiX as X,
    FiBell as Bell,
    FiCalendar as CalendarIcon
} from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

interface CRMLayoutProps {
    children: React.ReactNode
    currentView: string
    onViewChange: (view: string) => void
    userRole: string | null
}

export function CRMLayout({ children, currentView, onViewChange, userRole }: CRMLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'properties', label: 'Propiedades', icon: Building2 },
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'pipeline', label: 'Pipeline', icon: MessageSquare },
        { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
        { id: 'settings', label: 'Configuración', icon: Settings },
    ]

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                    !isSidebarOpen && "-translate-x-full lg:w-20"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center justify-center border-b border-border">
                        <span className={cn("font-serif font-bold text-xl transition-opacity", !isSidebarOpen && "lg:hidden")}>
                            Novo CRM
                        </span>
                        {!isSidebarOpen && <span className="hidden lg:block font-serif font-bold text-xl">N</span>}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Button
                                key={item.id}
                                variant={currentView === item.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    !isSidebarOpen && "lg:justify-center lg:px-2"
                                )}
                                onClick={() => onViewChange(item.id)}
                            >
                                <item.icon className={cn("h-5 w-5", isSidebarOpen && "mr-3")} />
                                <span className={cn(!isSidebarOpen && "lg:hidden")}>{item.label}</span>
                            </Button>
                        ))}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-border">
                        <div className={cn("flex items-center mb-4", !isSidebarOpen && "lg:justify-center")}>
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                A
                            </div>
                            <div className={cn("ml-3 overflow-hidden", !isSidebarOpen && "lg:hidden")}>
                                <p className="text-sm font-medium truncate">Admin User</p>
                                <p className="text-xs text-muted-foreground truncate capitalize">{userRole}</p>
                            </div>
                        </div>
                        <Button variant="outline" className={cn("w-full", !isSidebarOpen && "lg:p-2")} size="sm">
                            <LogOut className={cn("h-4 w-4", isSidebarOpen && "mr-2")} />
                            <span className={cn(!isSidebarOpen && "lg:hidden")}>Cerrar Sesión</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>

                    <div className="flex items-center space-x-4 ml-auto">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

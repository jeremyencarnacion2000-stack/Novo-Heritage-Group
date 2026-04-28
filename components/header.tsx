"use client"

import { useState, useEffect } from "react"
// @ts-ignore - lucide-react types not resolving correctly
import { Settings, Menu, LogOut, User, ShieldCheck } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ThemeToggle } from "@/components/theme-toggle"

interface HeaderProps {
  isScrolled: boolean
  onMenuClick?: () => void
  isIntroFinished?: boolean
}

export function Header({ isScrolled, onMenuClick, isIntroFinished = true }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 2. Listen for auth changes (Google Sign In, Sign Out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (_event === 'SIGNED_IN') router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const userEmail = user?.email
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail?.split('@')[0]
  const userAvatar = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail || 'User'}`

  return (
    <header
      className={`fixed top-8 left-0 right-0 z-[100] mx-auto hidden md:flex items-center justify-between transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${
        isScrolled 
        ? "max-w-[1400px] w-[calc(100%-4rem)] px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 shadow-premium rounded-none" 
        : "max-w-7xl w-full px-12 py-6 bg-transparent"
      } ${!isIntroFinished ? "opacity-0 pointer-events-none scale-95 blur-[10px]" : "opacity-100 scale-100 blur-0"}`}
    >
      <div className="flex items-center gap-12">
        <Link href="/" className="transition-transform hover:scale-[1.02] flex-shrink-0">
          <Logo className="transition-all duration-500 brightness-0 invert h-12 w-auto min-w-[160px]" />
        </Link>

        <nav className={`flex items-center gap-8 border-l pl-8 h-8 transition-colors duration-500 ${isScrolled ? "border-white/20" : "border-foreground/10"}`}>
          {[
            { label: "Nosotros", href: "/nosotros" },
            { label: "Seguros", href: "/seguros" },
            { label: "Inmuebles", href: "/bienes-raices" },
            { label: "Turismo", href: "/turismo" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 text-white/70 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 pr-4 border-r border-foreground/10">
           <ThemeToggle />
        </div>

        {!user ? (
          <div className="flex items-center gap-6 pl-2">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-[0.3em] transition-colors text-white/60 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-8 py-3 bg-primary text-black text-[11px] font-bold uppercase tracking-[0.2em] rounded-none transition-all hover:translate-y-[-2px] hover:shadow-premium active:scale-95"
            >
              Registrarse
            </Link>
          </div>
        ) : (
          <div className="pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none">
                  <div className="flex flex-col items-end mr-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-1">{userName}</span>
                    <span className="text-[8px] uppercase tracking-tighter text-primary flex items-center gap-1">
                      <ShieldCheck className="w-2 h-2" /> Miembro Heritage
                    </span>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-primary/20 p-0.5 bg-black/40">
                    <AvatarImage src={userAvatar} className="rounded-full object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-premium p-2 mt-4 rounded-none border-primary/10">
                <DropdownMenuLabel className="pb-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest leading-none text-white">
                      {userName}
                    </p>
                    <p className="text-[10px] leading-none text-foreground/40 truncate">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-foreground/10" />
                <DropdownMenuItem asChild className="p-3 cursor-pointer hover:bg-white/5 transition-colors">
                  <Link href="/settings" className="flex items-center gap-3 w-full">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Panel de Control</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-foreground/10" />
                <DropdownMenuItem onClick={handleLogout} className="p-3 cursor-pointer text-red-400 hover:bg-red-500/10 transition-colors">
                  <div className="flex items-center gap-3 w-full">
                    <LogOut className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión Segura</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
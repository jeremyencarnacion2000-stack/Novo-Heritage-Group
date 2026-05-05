"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const { login, status } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Force dark theme for luxury experience
    const root = window.document.documentElement
    root.classList.add("dark")

    // Load Google SDK script dynamically to ensure it's available for direct login
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Mock login for now as we focus on Google
      alert("Por favor use Google Login para esta fase de migración.")
    } catch (error) {
      console.error("[Auth] Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { signIn } = await import("next-auth/react")
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      console.error("[Auth] Google Login Error:", error)
      alert("Error al conectar con Google")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#050505] selection:bg-primary/30">
      {/* Heritage Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:border-primary/40 transition-all">
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-primary transition-colors">Volver</span>
        </Link>
        <Logo className="h-6 w-auto opacity-80" />
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[450px]"
      >
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 block">Acceso Privado</span>
          <h1 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight mb-4">
            Bienvenido de <span className="text-primary italic">nuevo</span>
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto" />
        </div>

        <Card className="glass-architectural border-primary/10 shadow-2xl overflow-hidden relative group">
          <CardContent className="p-10">
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-primary font-black ml-1">
                    Credencial Digital
                  </Label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 ${focusedInput === 'email' ? 'text-primary' : 'text-white/20'}`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@patrimonio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 pl-12 rounded-none transition-all duration-500 font-sans tracking-tight"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">
                      Código de Acceso
                    </Label>
                    <Link href="#" className="text-[9px] uppercase tracking-widest text-white/40 hover:text-primary transition-colors">
                      ¿Olvido?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500 ${focusedInput === 'password' ? 'text-primary' : 'text-white/20'}`} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      className="h-14 bg-white/[0.03] border-white/10 text-white placeholder:text-white/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 pl-12 pr-12 rounded-none transition-all duration-500 font-sans tracking-tight"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-black hover:bg-[#D4AF37] font-black text-[12px] uppercase tracking-[0.3em] rounded-none transition-all duration-500 shadow-[0_8px_30px_rgb(230,193,90,0.1)]"
              >
                {isLoading ? "Validando..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-12 space-y-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em]">
                  <span className="bg-[#0A0A0A] px-4 text-white/20">Protocolo OAuth</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <div id="google-hidden-trigger" className="absolute opacity-0 pointer-events-none" />
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="h-14 w-full bg-white/[0.02] border-white/10 text-white hover:bg-white/[0.05] hover:border-primary/30 rounded-none transition-all duration-500 flex items-center justify-center gap-4 group"
                  >
                    <svg className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors fill-current" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Continuar con Google</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium">
                ¿Sin membresía?{" "}
                <Link href="/register" className="text-primary hover:text-white transition-colors border-b border-primary/20 hover:border-white ml-2 pb-0.5">
                  Solicitar Registro
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
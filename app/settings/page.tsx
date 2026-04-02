"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Bell,
  Shield,
  Eye,
  Lock,
  Check,
  ArrowLeft,
  Settings as SettingsIcon,
  MapPin,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

interface UserSettings {
  theme: "light" | "dark" | "system"
  notifications: boolean
  emailNotifications: boolean
  language: "es" | "en"
  privacy: "public" | "private"
  name: string
  email: string
  phone: string
  bio: string
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()
  const [focusedInput, setFocusedInput] = useState<string | null>(null)

  const [settings, setSettings] = useState<UserSettings>({
    theme: "system",
    notifications: true,
    emailNotifications: true,
    language: "es",
    privacy: "public",
    name: "Usuario Demo",
    email: "usuario@novoheritage.com",
    phone: "+1 (809) 555-0123",
    bio: "Cliente premium de Novo Heritage especializado en seguros y bienes raíces."
  })

  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem("userSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem("userSettings", JSON.stringify(settings))
    setTheme(settings.theme)
    setIsLoading(false)

    toast({
      title: "Cambios guardados",
      description: "Tu configuración ha sido actualizada correctamente.",
    })
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!mounted) return null

  const tabs = [
    { id: "profile", icon: User, label: "Perfil", description: "Gestiona tu información personal" },
    { id: "appearance", icon: SettingsIcon, label: "Apariencia", description: "Personaliza la interfaz" },
    { id: "notifications", icon: Bell, label: "Notificaciones", description: "Controla tus alertas" },
    { id: "language", icon: MapPin, label: "Idioma", description: "Preferencias de región" },
    { id: "privacy", icon: Shield, label: "Privacidad", description: "Seguridad y visibilidad" },
  ]

  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/30 relative overflow-hidden">
      {/* Premium Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-secondary/5 blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 container mx-auto py-12 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <div className="w-8 h-8 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm font-medium tracking-wide">Volver al inicio</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-2 tracking-tight">
                Configuración
              </h1>
              <p className="text-muted-foreground text-lg">
                Personaliza tu experiencia en Novo Heritage
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/5"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${activeTab === tab.id
                    ? "bg-foreground/10 text-foreground border border-foreground/10 shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
                    }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? "bg-foreground/10" : "bg-foreground/5 group-hover:bg-foreground/10"}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium block">{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"
                    />
                  )}
                </button>
              ))}

              <Separator className="my-6 bg-foreground/10" />

              <button className="w-full flex items-center gap-4 p-4 rounded-xl text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-card/50 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent pointer-events-none" />

                  <CardHeader className="border-b border-border p-8">
                    <CardTitle className="text-2xl font-medium text-foreground flex items-center gap-3">
                      {(() => {
                        const tab = tabs.find(t => t.id === activeTab)
                        return (
                          <>
                            <div className="p-2 rounded-lg bg-foreground/5 border border-border">
                              {tab && <tab.icon className="w-6 h-6 text-primary" />}
                            </div>
                            {tab?.label}
                          </>
                        )
                      })()}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      {tabs.find(t => t.id === activeTab)?.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8">
                    {activeTab === "profile" && (
                      <div className="space-y-8">
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-primary/20 border-4 border-background">
                            {settings.name.charAt(0)}
                          </div>
                          <div>
                            <Button variant="outline" className="border-border text-foreground hover:bg-foreground/5">
                              Cambiar foto
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                              JPG, GIF o PNG. Máx 1MB.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Nombre completo</Label>
                            <div className={`relative group transition-all duration-300 ${focusedInput === 'name' ? 'scale-[1.01]' : ''}`}>
                              <Input
                                value={settings.name}
                                onChange={(e) => updateSetting("name", e.target.value)}
                                onFocus={() => setFocusedInput('name')}
                                onBlur={() => setFocusedInput(null)}
                                className="bg-foreground/5 border-border text-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-0 transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Correo electrónico</Label>
                            <div className={`relative group transition-all duration-300 ${focusedInput === 'email' ? 'scale-[1.01]' : ''}`}>
                              <Input
                                value={settings.email}
                                onChange={(e) => updateSetting("email", e.target.value)}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                                className="bg-foreground/5 border-border text-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-0 transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Teléfono</Label>
                            <div className={`relative group transition-all duration-300 ${focusedInput === 'phone' ? 'scale-[1.01]' : ''}`}>
                              <Input
                                value={settings.phone}
                                onChange={(e) => updateSetting("phone", e.target.value)}
                                onFocus={() => setFocusedInput('phone')}
                                onBlur={() => setFocusedInput(null)}
                                className="bg-foreground/5 border-border text-foreground h-12 rounded-xl focus:border-primary/50 focus:ring-0 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Biografía</Label>
                          <div className={`relative group transition-all duration-300 ${focusedInput === 'bio' ? 'scale-[1.01]' : ''}`}>
                            <Textarea
                              value={settings.bio}
                              onChange={(e) => updateSetting("bio", e.target.value)}
                              onFocus={() => setFocusedInput('bio')}
                              onBlur={() => setFocusedInput(null)}
                              className="bg-foreground/5 border-border text-foreground min-h-[120px] rounded-xl focus:border-primary/50 focus:ring-0 transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "appearance" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {["light", "dark", "system"].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => updateSetting("theme", mode as any)}
                              className={`relative p-4 rounded-xl border-2 transition-all ${settings.theme === mode
                                ? "border-primary bg-foreground/5"
                                : "border-border hover:border-foreground/20 hover:bg-foreground/5"
                                }`}
                            >
                              <div className="aspect-video rounded-lg bg-background border border-border mb-4 overflow-hidden relative">
                                {mode === "light" && <div className="absolute inset-0 bg-white" />}
                                {mode === "system" && <div className="absolute inset-0 bg-gradient-to-r from-white to-zinc-950" />}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="capitalize font-medium text-foreground">
                                  {mode === "system" ? "Sistema" : mode === "light" ? "Claro" : "Oscuro"}

                                </span>
                                {settings.theme === mode && (
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "notifications" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/5 border border-border">
                          <div className="space-y-1">
                            <Label className="text-base text-foreground">Notificaciones push</Label>
                            <p className="text-sm text-muted-foreground">Recibe alertas en tiempo real en tu navegador</p>
                          </div>
                          <Switch
                            checked={settings.notifications}
                            onCheckedChange={(checked) => updateSetting("notifications", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-foreground/5 border border-border">
                          <div className="space-y-1">
                            <Label className="text-base text-foreground">Correos electrónicos</Label>
                            <p className="text-sm text-muted-foreground">Recibe resúmenes semanales y ofertas exclusivas</p>
                          </div>
                          <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "language" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Idioma de la interfaz</Label>
                          <Select
                            value={settings.language}
                            onValueChange={(value: "es" | "en") => updateSetting("language", value)}
                          >
                            <SelectTrigger className="w-full h-12 bg-foreground/5 border-border text-foreground rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                              <SelectItem value="es">🇪🇸 Español (Latinoamérica)</SelectItem>
                              <SelectItem value="en">🇺🇸 English (United States)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {activeTab === "privacy" && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Visibilidad del perfil</Label>
                          <Select
                            value={settings.privacy}
                            onValueChange={(value: "public" | "private") => updateSetting("privacy", value)}
                          >
                            <SelectTrigger className="w-full h-12 bg-foreground/5 border-border text-foreground rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border text-foreground">
                              <SelectItem value="public">🌐 Público (Visible para todos)</SelectItem>
                              <SelectItem value="private">🔒 Privado (Solo yo)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
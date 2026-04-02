"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// @ts-ignore - lucide-react types not resolving correctly
import { Search, Eye, Clock, TrendingUp, Target, BarChart3, Filter, Calendar, MapPin, DollarSign, Star, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserAction {
  id: string
  type: 'search' | 'view' | 'click' | 'purchase' | 'download'
  action: string
  details: string
  timestamp: string
  value?: number
  category?: string
  location?: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  interests: string[]
  budget: string
  experience: string
  frequency: string
  goals: string[]
  totalActions: number
  lastActivity: string
  conversionRate: number
  lifetimeValue: number
  actions: UserAction[]
}

export function UserTrackingSystem() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("7d")

  // Generar datos de ejemplo
  useEffect(() => {
    const mockProfiles: UserProfile[] = [
      {
        id: "1",
        name: "María González",
        email: "maria@email.com",
        interests: ["seguros", "propiedades"],
        budget: "medio",
        experience: "intermedio",
        frequency: "regular",
        goals: ["proteccion", "inversion"],
        totalActions: 45,
        lastActivity: new Date().toISOString(),
        conversionRate: 12.5,
        lifetimeValue: 25000,
        actions: [
          {
            id: "1",
            type: "search",
            action: "Búsqueda: seguro de auto",
            details: "Buscó seguros de auto con cobertura completa",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: "seguros",
            value: 0
          },
          {
            id: "2",
            type: "view",
            action: "Vista: apartamento en Naco",
            details: "Vio apartamento de 2 habitaciones en Naco, Santo Domingo",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            category: "propiedades",
            value: 4500000
          },
          {
            id: "3",
            type: "click",
            action: "Clic: cotizar seguro",
            details: "Hizo clic en botón de cotizar seguro de auto",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            category: "seguros",
            value: 0
          },
          {
            id: "4",
            type: "search",
            action: "Búsqueda: paquete turístico Punta Cana",
            details: "Buscó paquetes de turismo en Punta Cana",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            category: "turismo",
            value: 0
          },
          {
            id: "5",
            type: "purchase",
            action: "Compra: seguro de vida",
            details: "Compró seguro de vida por $15,000 DOP/mes",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            category: "seguros",
            value: 15000
          }
        ]
      },
      {
        id: "2",
        name: "Carlos Rodríguez",
        email: "carlos@email.com",
        interests: ["turismo", "vida"],
        budget: "alto",
        experience: "avanzado",
        frequency: "frecuente",
        goals: ["viajes", "familia"],
        totalActions: 78,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        conversionRate: 18.2,
        lifetimeValue: 45000,
        actions: [
          {
            id: "6",
            type: "search",
            action: "Búsqueda: paquete turístico Europa",
            details: "Buscó paquetes de turismo a Europa",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            category: "turismo",
            value: 0
          },
          {
            id: "7",
            type: "view",
            action: "Vista: seguro de viaje internacional",
            details: "Vio seguro de viaje internacional premium",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: "seguros",
            value: 2500
          },
          {
            id: "8",
            type: "download",
            action: "Descarga: guía de viaje",
            details: "Descargó guía de viaje a París",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            category: "turismo",
            value: 0
          }
        ]
      }
    ]

    setProfiles(mockProfiles)
  }, [])

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'search': return <Search className="w-4 h-4" />
      case 'view': return <Eye className="w-4 h-4" />
      case 'click': return <Target className="w-4 h-4" />
      case 'purchase': return <DollarSign className="w-4 h-4" />
      case 'download': return <TrendingUp className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'search': return 'text-blue-600'
      case 'view': return 'text-green-600'
      case 'click': return 'text-purple-600'
      case 'purchase': return 'text-orange-600'
      case 'download': return 'text-pink-600'
      default: return 'text-gray-600'
    }
  }

  const getBudgetColor = (budget: string) => {
    switch (budget) {
      case 'bajo': return 'bg-green-100 text-green-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'alto': return 'bg-orange-100 text-orange-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'nuevo': return 'bg-blue-100 text-blue-800'
      case 'basico': return 'bg-green-100 text-green-800'
      case 'intermedio': return 'bg-yellow-100 text-yellow-800'
      case 'avanzado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Sistema de Tracking de Usuario
          </h2>
          <p className="text-muted-foreground mt-2">
            Monitorea el comportamiento y optimiza las ventas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {profiles.reduce((acc, p) => acc + p.totalActions, 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {profiles.length > 0 ? Math.round(profiles.reduce((acc, p) => acc + p.conversionRate, 0) / profiles.length) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${profiles.reduce((acc, p) => acc + p.lifetimeValue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profiles */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Perfiles de Usuario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => (
            <Card
              key={profile.id}
              className="card-premium cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() => setSelectedProfile(profile)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                  <Badge className={cn("text-white", getBudgetColor(profile.budget))}>
                    {profile.budget}
                  </Badge>
                </div>
                <CardDescription>{profile.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-white", getExperienceColor(profile.experience))}>
                      {profile.experience}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {profile.totalActions} acciones
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>Conversión: {profile.conversionRate}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-purple-600" />
                      <span>Valor: ${profile.lifetimeValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Última actividad: {new Date(profile.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedProfile.name}</CardTitle>
                  <CardDescription>{selectedProfile.email}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedProfile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Presupuesto</h4>
                  <Badge className={cn("text-white", getBudgetColor(selectedProfile.budget))}>
                    {selectedProfile.budget}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Experiencia</h4>
                  <Badge className={cn("text-white", getExperienceColor(selectedProfile.experience))}>
                    {selectedProfile.experience}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Frecuencia</h4>
                  <Badge variant="outline">{selectedProfile.frequency}</Badge>
                </div>
              </div>

              {/* Actions Timeline */}
              <div>
                <h4 className="font-medium mb-4">Historial de Acciones</h4>
                <div className="space-y-3">
                  {selectedProfile.actions.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 p-3 rounded-none border border-border/20 hover:bg-muted/50 transition-colors">
                      <div className={cn("p-2 rounded-none bg-muted", getActionColor(action.type))}>
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{action.action}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(action.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{action.details}</p>
                        {action.value && action.value > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              ${action.value.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

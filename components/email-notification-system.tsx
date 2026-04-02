"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// @ts-ignore - lucide-react types not resolving correctly
import { Mail, Send, Clock, Percent, TrendingUp, Target, Calendar, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailCampaign {
  id: string
  type: 'discount' | 'reminder' | 'recommendation' | 'welcome'
  title: string
  subject: string
  content: string
  discount?: number
  validUntil: string
  targetAudience: string[]
  sentCount: number
  openRate: number
  clickRate: number
  status: 'draft' | 'scheduled' | 'sent' | 'paused'
}

interface UserProfile {
  interests: string[]
  budget: string
  experience: string
  frequency: string
  goals: string[]
  email: string
  searchHistory: string[]
  lastActivity: string
}

export function EmailNotificationSystem() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Generar campañas automáticas basadas en datos del usuario
  const generatePersonalizedCampaigns = (profiles: UserProfile[]) => {
    const newCampaigns: EmailCampaign[] = []

    profiles.forEach((profile, index) => {
      // Campaña de bienvenida
      if (profile.experience === 'nuevo') {
        newCampaigns.push({
          id: `welcome-${index}`,
          type: 'welcome',
          title: 'Bienvenido a Novo Heritage',
          subject: '¡Bienvenido! Tu guía personalizada te espera',
          content: `Hola! Bienvenido a Novo Heritage. Basándome en tus intereses en ${profile.interests.join(', ')}, he preparado algunas recomendaciones especiales para ti.`,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: [profile.email],
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          status: 'draft'
        })
      }

      // Campañas de descuento basadas en intereses
      profile.interests.forEach(interest => {
        const discount = Math.floor(Math.random() * 30) + 10 // 10-40% descuento
        newCampaigns.push({
          id: `discount-${interest}-${index}`,
          type: 'discount',
          title: `Descuento especial en ${interest}`,
          subject: `🔥 ${discount}% de descuento en ${interest} - Solo por tiempo limitado`,
          content: `¡Oferta especial! Obtén ${discount}% de descuento en nuestros servicios de ${interest}. Esta oferta es exclusiva para ti y expira en 48 horas.`,
          discount,
          validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: [profile.email],
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          status: 'draft'
        })
      })

      // Campañas de recordatorio basadas en frecuencia
      if (profile.frequency === 'regular' || profile.frequency === 'frecuente') {
        newCampaigns.push({
          id: `reminder-${index}`,
          type: 'reminder',
          title: 'No te pierdas nuestras últimas ofertas',
          subject: 'Nuevas oportunidades te esperan',
          content: `Hola! He notado que no has visitado nuestra plataforma recientemente. Tenemos nuevas ofertas en ${profile.interests.join(', ')} que podrían interesarte.`,
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: [profile.email],
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          status: 'draft'
        })
      }

      // Campañas de recomendación basadas en historial de búsqueda
      if (profile.searchHistory.length > 0) {
        const lastSearch = profile.searchHistory[profile.searchHistory.length - 1]
        newCampaigns.push({
          id: `recommendation-${index}`,
          type: 'recommendation',
          title: `Recomendación personalizada: ${lastSearch}`,
          subject: `He encontrado opciones perfectas para "${lastSearch}"`,
          content: `Basándome en tu búsqueda de "${lastSearch}", he seleccionado las mejores opciones que se adaptan a tu presupuesto y necesidades.`,
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          targetAudience: [profile.email],
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          status: 'draft'
        })
      }
    })

    return newCampaigns
  }

  // Simular datos de usuarios (en producción vendría de una API)
  useEffect(() => {
    const mockProfiles: UserProfile[] = [
      {
        interests: ['seguros', 'propiedades'],
        budget: 'medio',
        experience: 'intermedio',
        frequency: 'regular',
        goals: ['proteccion', 'inversion'],
        email: 'usuario1@email.com',
        searchHistory: ['seguro de auto', 'apartamento santo domingo', 'seguro de vida'],
        lastActivity: new Date().toISOString()
      },
      {
        interests: ['turismo', 'vida'],
        budget: 'alto',
        experience: 'avanzado',
        frequency: 'frecuente',
        goals: ['viajes', 'familia'],
        email: 'usuario2@email.com',
        searchHistory: ['paquete turistico punta cana', 'seguro de viaje'],
        lastActivity: new Date().toISOString()
      }
    ]

    setUserProfiles(mockProfiles)
    setCampaigns(generatePersonalizedCampaigns(mockProfiles))
  }, [])

  const sendCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status: 'sent' as const, sentCount: campaign.sentCount + 1 }
        : campaign
    ))
  }

  const scheduleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, status: 'scheduled' as const }
        : campaign
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'scheduled': return 'bg-yellow-500'
      case 'sent': return 'bg-green-500'
      case 'paused': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="w-4 h-4" />
      case 'reminder': return <Clock className="w-4 h-4" />
      case 'recommendation': return <TrendingUp className="w-4 h-4" />
      case 'welcome': return <Mail className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Sistema de Notificaciones por Correo
          </h2>
          <p className="text-muted-foreground mt-2">
            Campañas personalizadas basadas en el comportamiento del usuario
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Send className="w-4 h-4 mr-2" />
          Nueva Campaña
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campañas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Apertura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {campaigns.length > 0 ? Math.round(campaigns.reduce((acc, c) => acc + c.openRate, 0) / campaigns.length) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Clic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {campaigns.length > 0 ? Math.round(campaigns.reduce((acc, c) => acc + c.clickRate, 0) / campaigns.length) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Campañas Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="card-premium cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(campaign.type)}
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  </div>
                  <Badge className={cn("text-white", getStatusColor(campaign.status))}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription>{campaign.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>{campaign.targetAudience.length} destinatarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Válido hasta: {new Date(campaign.validUntil).toLocaleDateString()}</span>
                  </div>
                  {campaign.discount && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <Percent className="w-4 h-4" />
                      <span>{campaign.discount}% de descuento</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        sendCampaign(campaign.id)
                      }}
                      disabled={campaign.status === 'sent'}
                      className="flex-1"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        scheduleCampaign(campaign.id)
                      }}
                      disabled={campaign.status === 'sent'}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Programar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedCampaign.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCampaign(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-medium">Asunto:</Label>
                <p className="text-sm text-muted-foreground">{selectedCampaign.subject}</p>
              </div>
              <div>
                <Label className="font-medium">Contenido:</Label>
                <p className="text-sm text-muted-foreground">{selectedCampaign.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Destinatarios:</Label>
                  <p className="text-sm text-muted-foreground">{selectedCampaign.targetAudience.length}</p>
                </div>
                <div>
                  <Label className="font-medium">Estado:</Label>
                  <Badge className={cn("text-white", getStatusColor(selectedCampaign.status))}>
                    {selectedCampaign.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

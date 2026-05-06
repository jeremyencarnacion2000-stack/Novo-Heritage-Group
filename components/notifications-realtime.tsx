"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
// @ts-ignore - lucide-react types not resolving correctly
import { Bell, Check, X, Settings, Mail, MessageCircle, AlertCircle, Info, DollarSign, Calendar, User, FileText, Target, Clock, Zap, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'reminder' | 'task' | 'lead'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'ventas' | 'clientes' | 'tareas' | 'pagos' | 'recordatorios' | 'sistema'
  actionUrl?: string
  metadata?: {
    amount?: string
    clientName?: string
    dueDate?: string
    status?: string
  }
}

interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  soundEnabled: boolean
  desktopEnabled: boolean
  mobileEnabled: boolean
  categories: {
    ventas: boolean
    clientes: boolean
    tareas: boolean
    pagos: boolean
    recordatorios: boolean
    sistema: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export function NotificationsRealtime() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    soundEnabled: true,
    desktopEnabled: true,
    mobileEnabled: true,
    categories: {
      ventas: true,
      clientes: true,
      tareas: true,
      pagos: true,
      recordatorios: true,
      sistema: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })
  const [showSettings, setShowSettings] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Datos de ejemplo
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Nueva Venta Completada',
      message: 'Seguro de auto vendido a Juan Pérez por $2,400',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      read: false,
      priority: 'high',
      category: 'ventas',
      actionUrl: '/ventas/12345',
      metadata: {
        amount: '$2,400',
        clientName: 'Juan Pérez'
      }
    },
    {
      id: '2',
      type: 'warning',
      title: 'Póliza Próxima a Vencer',
      message: 'La póliza #12345 de María González vence en 7 días',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
      read: false,
      priority: 'medium',
      category: 'recordatorios',
      actionUrl: '/polizas/12345',
      metadata: {
        clientName: 'María González',
        dueDate: '15 Mar 2024'
      }
    },
    {
      id: '3',
      type: 'info',
      title: 'Nuevo Cliente Registrado',
      message: 'Carlos Rodríguez se registró en el sistema',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      read: true,
      priority: 'low',
      category: 'clientes',
      actionUrl: '/clientes/carlos-rodriguez'
    },
    {
      id: '4',
      type: 'task',
      title: 'Tarea Vencida',
      message: 'Llamar a cliente interesado - Tarea vencida hace 2 horas',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'urgent',
      category: 'tareas',
      actionUrl: '/tareas/llamar-cliente',
      metadata: {
        status: 'Vencida'
      }
    },
    {
      id: '5',
      type: 'payment',
      title: 'Pago Recibido',
      message: 'Pago de $1,200 recibido de Ana López',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'medium',
      category: 'pagos',
      actionUrl: '/pagos/recibido',
      metadata: {
        amount: '$1,200',
        clientName: 'Ana López'
      }
    },
    {
      id: '6',
      type: 'lead',
      title: 'Lead Caliente',
      message: 'Cliente interesado en seguro de hogar - Alta probabilidad',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      priority: 'high',
      category: 'ventas',
      actionUrl: '/leads/seguro-hogar',
      metadata: {
        clientName: 'Roberto Silva',
        status: 'Interesado'
      }
    }
  ]

  // Simular notificaciones en tiempo real
  useEffect(() => {
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)

    // Simular nuevas notificaciones cada 30 segundos
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as any,
        title: 'Nueva Notificación',
        message: 'Esta es una notificación simulada en tiempo real',
        timestamp: new Date(),
        read: false,
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        category: ['ventas', 'clientes', 'tareas'][Math.floor(Math.random() * 3)] as any
      }

      setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Mantener máximo 50
      setUnreadCount(prev => prev + 1)

      // Reproducir sonido si está habilitado
      if (settings.soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => { }) // Ignorar errores de autoplay
      }
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [settings.soundEnabled])

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error': return <X className="w-4 h-4 text-red-500" />
      case 'payment': return <DollarSign className="w-4 h-4 text-green-500" />
      case 'task': return <Target className="w-4 h-4 text-blue-500" />
      case 'lead': return <Zap className="w-4 h-4 text-purple-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ventas': return 'bg-green-100 text-green-800 border-green-200'
      case 'clientes': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'tareas': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'pagos': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'recordatorios': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'sistema': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora mismo'
    if (minutes < 60) return `Hace ${minutes} min`
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${days} días`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Centro de Notificaciones
          </h2>
          <p className="text-muted-foreground">
            {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Canales de Notificación */}
            <div>
              <h3 className="font-semibold mb-3">Canales de Notificación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>Notificaciones Push</span>
                  </div>
                  <Switch
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, pushEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, emailEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>SMS</span>
                  </div>
                  <Switch
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, smsEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </div>
                  <Switch
                    checked={settings.whatsappEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, whatsappEnabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h3 className="font-semibold mb-3">Categorías</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(settings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="capitalize">{category}</span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [category]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Opciones Adicionales */}
            <div>
              <h3 className="font-semibold mb-3">Opciones Adicionales</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Sonido</span>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Notificaciones de Escritorio</span>
                  </div>
                  <Switch
                    checked={settings.desktopEnabled}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, desktopEnabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg">
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                Te notificaremos cuando haya nuevas actividades
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:scale-[1.01] active:scale-[0.99]",
                !notification.read && "ring-1 ring-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-grow min-w-0">
                        <h3 className={cn(
                          "font-semibold text-foreground line-clamp-1",
                          !notification.read && "font-bold"
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getPriorityColor(notification.priority))}
                      >
                        {notification.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getCategoryColor(notification.category))}
                      >
                        {notification.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>

                    {notification.metadata && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        {notification.metadata.amount && (
                          <span className="font-medium text-green-600">
                            {notification.metadata.amount}
                          </span>
                        )}
                        {notification.metadata.clientName && (
                          <span>Cliente: {notification.metadata.clientName}</span>
                        )}
                        {notification.metadata.dueDate && (
                          <span>Vence: {notification.metadata.dueDate}</span>
                        )}
                        {notification.metadata.status && (
                          <Badge variant="outline" className="text-xs">
                            {notification.metadata.status}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs hover:bg-primary/10 transition-colors duration-200"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Marcar como leída
                        </Button>
                      )}
                      {notification.actionUrl && (
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        >
                          Ver detalles
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Audio element for notifications */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}

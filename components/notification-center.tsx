"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// @ts-ignore - lucide-react types not resolving correctly
import { Bell, X, Check, AlertCircle, Info, CheckCircle2, Star, TrendingUp, DollarSign, Calendar, Target, Mail, Phone, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'promotion' | 'reminder' | 'alert'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'sale' | 'system' | 'marketing' | 'support' | 'reminder'
  actionUrl?: string
  actionText?: string
  value?: number
  discount?: number
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [unreadCount, setUnreadCount] = useState(0)

  // Generar notificaciones de ejemplo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "promotion",
        title: "🔥 Oferta Especial - 25% de Descuento",
        message: "Aprovecha nuestro descuento especial en seguros de auto. Válido hasta el 31 de diciembre.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        priority: "high",
        category: "marketing",
        actionUrl: "/seguros",
        actionText: "Ver Oferta",
        discount: 25
      },
      {
        id: "2",
        type: "success",
        title: "✅ Cotización Completada",
        message: "Tu cotización de seguro de vida ha sido procesada. Revisa los detalles en tu perfil.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "medium",
        category: "sale",
        actionUrl: "/profile",
        actionText: "Ver Cotización",
        value: 15000
      },
      {
        id: "3",
        type: "info",
        title: "📋 Nueva Propiedad Disponible",
        message: "Se ha agregado una nueva propiedad en Naco que coincide con tus criterios de búsqueda.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "medium",
        category: "sale",
        actionUrl: "/bienes-raices",
        actionText: "Ver Propiedad",
        value: 4500000
      },
      {
        id: "4",
        type: "reminder",
        title: "⏰ Recordatorio de Pago",
        message: "Tu pago mensual de seguro vence en 3 días. Realiza el pago para mantener tu cobertura.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "high",
        category: "reminder",
        actionUrl: "/payments",
        actionText: "Pagar Ahora",
        value: 8500
      },
      {
        id: "5",
        type: "alert",
        title: "⚠️ Documento Requerido",
        message: "Necesitamos tu licencia de conducir actualizada para procesar tu seguro de auto.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "high",
        category: "support",
        actionUrl: "/documents",
        actionText: "Subir Documento"
      },
      {
        id: "6",
        type: "info",
        title: "🎉 Bienvenido a Novo Heritage",
        message: "Gracias por unirte a nosotros. Explora nuestros servicios y encuentra las mejores opciones para ti.",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        priority: "low",
        category: "system",
        actionUrl: "/welcome",
        actionText: "Comenzar"
      },
      {
        id: "7",
        type: "promotion",
        title: "✈️ Paquete de Viaje Especial",
        message: "Descubre Punta Cana con nuestro paquete todo incluido. Incluye vuelos, hotel y seguro de viaje.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        priority: "medium",
        category: "marketing",
        actionUrl: "/turismo",
        actionText: "Ver Paquete",
        value: 120000
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info': return <Info className="w-5 h-5 text-blue-600" />
      case 'promotion': return <Star className="w-5 h-5 text-purple-600" />
      case 'reminder': return <Calendar className="w-5 h-5 text-orange-600" />
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sale': return <DollarSign className="w-4 h-4" />
      case 'system': return <Info className="w-4 h-4" />
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      case 'support': return <MessageCircle className="w-4 h-4" />
      case 'reminder': return <Calendar className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id
        ? { ...notification, read: true }
        : notification
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      const newNotifications = prev.filter(n => n.id !== id)
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return newNotifications
    })
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.category === filter
  })

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`
    }
  }

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative hover:bg-primary/10 transition-all duration-300 hover:scale-110"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white animate-premium-pulse rounded-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-50 w-96 max-h-[600px] bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl rounded-none shadow-2xl border border-border/20 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground rounded-none">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs hover:bg-primary/10"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-primary/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 border-b border-border/20">
            <div className="flex gap-1">
              {[
                { key: "all", label: "Todas" },
                { key: "unread", label: "No leídas" },
                { key: "sale", label: "Ventas" },
                { key: "marketing", label: "Marketing" },
                { key: "support", label: "Soporte" }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(filterOption.key)}
                  className="text-xs h-7"
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay notificaciones</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 hover:bg-muted/50 transition-all duration-200 cursor-pointer group",
                      !notification.read && "bg-primary/5 border-l-4 border-l-primary"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={cn(
                                "font-medium text-sm truncate",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-none animate-premium-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", getPriorityColor(notification.priority))}>
                                {notification.priority}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {getCategoryIcon(notification.category)}
                                <span>{notification.category}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            {notification.value && (
                              <div className="flex items-center gap-1 mt-1">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  ${notification.value.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {notification.discount && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-purple-600" />
                                <span className="text-xs font-medium text-purple-600">
                                  {notification.discount}% descuento
                                </span>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 hover:bg-red-100 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        {notification.actionText && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs h-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle action
                            }}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

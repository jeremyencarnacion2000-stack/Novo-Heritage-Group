"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
// @ts-ignore - lucide-react types not resolving correctly
import { Clock, User, DollarSign, FileText, Phone, Mail, Calendar, Target, Info, Plus, Filter, Search, Download, Trash2, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: 'venta' | 'llamada' | 'email' | 'tarea' | 'documento' | 'reunion' | 'pago' | 'nota' | 'recordatorio'
  title: string
  description: string
  user: {
    name: string
    avatar: string
    role: string
  }
  timestamp: Date
  client?: {
    name: string
    id: string
  }
  metadata?: {
    amount?: string
    duration?: string
    status?: string
    priority?: string
    attachments?: number
    mentions?: string[]
  }
  isPrivate?: boolean
  tags?: string[]
}

interface ActivityFilter {
  type: string
  user: string
  dateRange: string
  client: string
  search: string
}

export function TimelineActividades() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [filters, setFilters] = useState<ActivityFilter>({
    type: 'all',
    user: 'all',
    dateRange: 'all',
    client: 'all',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [newActivity, setNewActivity] = useState({
    type: 'nota',
    title: '',
    description: '',
    isPrivate: false,
    tags: [] as string[]
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // Datos de ejemplo
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'venta',
      title: 'Venta de Seguro de Auto Completada',
      description: 'Se vendió póliza de seguro de auto Honda Civic 2020 a Juan Pérez por $2,400 anuales',
      user: {
        name: 'María González',
        avatar: 'MG',
        role: 'Agente de Ventas'
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      client: {
        name: 'Juan Pérez',
        id: 'client-123'
      },
      metadata: {
        amount: '$2,400',
        status: 'Completada',
        priority: 'Alta'
      },
      tags: ['venta', 'seguro', 'auto']
    },
    {
      id: '2',
      type: 'llamada',
      title: 'Llamada de Seguimiento',
      description: 'Llamada realizada para seguimiento de cotización de seguro de hogar. Cliente muy interesado.',
      user: {
        name: 'Carlos Rodríguez',
        avatar: 'CR',
        role: 'Agente de Ventas'
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      client: {
        name: 'Ana López',
        id: 'client-456'
      },
      metadata: {
        duration: '15 min',
        status: 'Completada',
        priority: 'Media'
      },
      tags: ['llamada', 'seguimiento', 'hogar']
    },
    {
      id: '3',
      type: 'email',
      title: 'Email de Cotización Enviado',
      description: 'Se envió cotización detallada de seguro de vida por $1,200 anuales',
      user: {
        name: 'Sistema Automático',
        avatar: 'SA',
        role: 'Sistema'
      },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      client: {
        name: 'Roberto Silva',
        id: 'client-789'
      },
      metadata: {
        amount: '$1,200',
        status: 'Enviado'
      },
      tags: ['email', 'cotización', 'vida']
    },
    {
      id: '4',
      type: 'tarea',
      title: 'Tarea Completada: Revisión de Documentos',
      description: 'Se completó la revisión de documentos para la póliza de seguro de hogar',
      user: {
        name: 'Laura Martínez',
        avatar: 'LM',
        role: 'Supervisor'
      },
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      client: {
        name: 'Pedro García',
        id: 'client-101'
      },
      metadata: {
        status: 'Completada',
        priority: 'Alta',
        attachments: 3
      },
      tags: ['tarea', 'documentos', 'hogar']
    },
    {
      id: '5',
      type: 'reunion',
      title: 'Reunión con Cliente',
      description: 'Reunión presencial para revisar opciones de seguros empresariales',
      user: {
        name: 'Miguel Torres',
        avatar: 'MT',
        role: 'Gerente de Ventas'
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      client: {
        name: 'Empresa ABC',
        id: 'client-202'
      },
      metadata: {
        duration: '45 min',
        status: 'Completada',
        priority: 'Alta'
      },
      tags: ['reunión', 'empresarial', 'presencial']
    },
    {
      id: '6',
      type: 'pago',
      title: 'Pago Recibido',
      description: 'Se recibió pago de $3,600 por póliza de seguro de hogar',
      user: {
        name: 'Sistema Automático',
        avatar: 'SA',
        role: 'Sistema'
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      client: {
        name: 'Carmen Ruiz',
        id: 'client-303'
      },
      metadata: {
        amount: '$3,600',
        status: 'Confirmado'
      },
      tags: ['pago', 'hogar', 'confirmado']
    },
    {
      id: '7',
      type: 'nota',
      title: 'Nota Interna: Cliente VIP',
      description: 'Cliente con historial de pagos puntuales. Considerar descuentos especiales para renovación.',
      user: {
        name: 'Sofia Herrera',
        avatar: 'SH',
        role: 'Analista'
      },
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      client: {
        name: 'Alejandro Vega',
        id: 'client-404'
      },
      metadata: {
        priority: 'Media',
        mentions: ['@maria.gonzalez', '@carlos.rodriguez']
      },
      isPrivate: true,
      tags: ['nota', 'vip', 'descuento']
    }
  ]

  useEffect(() => {
    setActivities(mockActivities)
    setFilteredActivities(mockActivities)
  }, [])

  // Filtrar actividades
  useEffect(() => {
    let filtered = activities

    if (filters.type !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.type)
    }

    if (filters.user !== 'all') {
      filtered = filtered.filter(activity => activity.user.name === filters.user)
    }

    if (filters.client !== 'all') {
      filtered = filtered.filter(activity =>
        activity.client?.name.toLowerCase().includes(filters.client.toLowerCase())
      )
    }

    if (filters.search) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      )
    }

    // Filtrar por rango de fechas
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(activity => activity.timestamp >= filterDate)
    }

    setFilteredActivities(filtered)
  }, [activities, filters])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'venta': return <DollarSign className="w-4 h-4 text-green-500" />
      case 'llamada': return <Phone className="w-4 h-4 text-blue-500" />
      case 'email': return <Mail className="w-4 h-4 text-purple-500" />
      case 'tarea': return <Target className="w-4 h-4 text-orange-500" />
      case 'documento': return <FileText className="w-4 h-4 text-gray-500" />
      case 'reunion': return <Calendar className="w-4 h-4 text-indigo-500" />
      case 'pago': return <DollarSign className="w-4 h-4 text-green-500" />
      case 'nota': return <FileText className="w-4 h-4 text-yellow-500" />
      case 'recordatorio': return <Clock className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'venta': return 'bg-green-100 text-green-800 border-green-200'
      case 'llamada': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'tarea': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'documento': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'reunion': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'pago': return 'bg-green-100 text-green-800 border-green-200'
      case 'nota': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'recordatorio': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200'
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
    if (days < 7) return `Hace ${days} días`
    return date.toLocaleDateString()
  }

  const handleAddActivity = () => {
    if (!newActivity.title.trim()) return

    const activity: Activity = {
      id: Date.now().toString(),
      type: newActivity.type as any,
      title: newActivity.title,
      description: newActivity.description,
      user: {
        name: 'Usuario Actual',
        avatar: 'UA',
        role: 'Agente'
      },
      timestamp: new Date(),
      isPrivate: newActivity.isPrivate,
      tags: newActivity.tags
    }

    setActivities(prev => [activity, ...prev])
    setNewActivity({ type: 'nota', title: '', description: '', isPrivate: false, tags: [] })
    setShowAddForm(false)
  }

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user.name)))
  const uniqueClients = Array.from(new Set(activities.map(a => a.client?.name).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Timeline de Actividades
          </h2>
          <p className="text-muted-foreground">
            Historial completo de interacciones y actividades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Actividad
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-none bg-background"
                >
                  <option value="all">Todos</option>
                  <option value="venta">Venta</option>
                  <option value="llamada">Llamada</option>
                  <option value="email">Email</option>
                  <option value="tarea">Tarea</option>
                  <option value="documento">Documento</option>
                  <option value="reunion">Reunión</option>
                  <option value="pago">Pago</option>
                  <option value="nota">Nota</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Usuario</label>
                <select
                  value={filters.user}
                  onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                  className="w-full p-2 border rounded-none bg-background"
                >
                  <option value="all">Todos</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cliente</label>
                <select
                  value={filters.client}
                  onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                  className="w-full p-2 border rounded-none bg-background"
                >
                  <option value="all">Todos</option>
                  {uniqueClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full p-2 border rounded-none bg-background"
                >
                  <option value="all">Todos</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar actividades..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 rounded-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Activity Form */}
      {showAddForm && (
        <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg rounded-none">
          <CardHeader>
            <CardTitle>Agregar Nueva Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-none bg-background"
                >
                  <option value="nota">Nota</option>
                  <option value="llamada">Llamada</option>
                  <option value="email">Email</option>
                  <option value="tarea">Tarea</option>
                  <option value="reunion">Reunión</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Título</label>
                <Input
                  placeholder="Título de la actividad..."
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  className="rounded-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descripción</label>
              <Textarea
                placeholder="Descripción detallada de la actividad..."
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="rounded-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newActivity.isPrivate}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded-none"
                />
                <span className="text-sm">Nota privada</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddActivity} disabled={!newActivity.title.trim()} className="rounded-none">
                Agregar Actividad
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="rounded-none">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg rounded-none">
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No hay actividades</h3>
              <p className="text-muted-foreground">
                No se encontraron actividades con los filtros aplicados
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity, index) => (
            <Card
              key={activity.id}
              className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] rounded-none"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-none flex items-center justify-center border-2",
                      "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20"
                    )}>
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-primary/20 to-transparent mt-2" />
                    )}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {activity.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getActivityColor(activity.type))}
                          >
                            {activity.type}
                          </Badge>
                          {activity.isPrivate && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Privada
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                        {activity.user.avatar}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {activity.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.role}
                      </span>
                    </div>

                    {/* Client Info */}
                    {activity.client && (
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Cliente: <span className="font-medium text-foreground">{activity.client.name}</span>
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        {activity.metadata.amount && (
                          <span className="font-medium text-green-600">
                            {activity.metadata.amount}
                          </span>
                        )}
                        {activity.metadata.duration && (
                          <span>Duración: {activity.metadata.duration}</span>
                        )}
                        {activity.metadata.status && (
                          <Badge variant="outline" className="text-xs">
                            {activity.metadata.status}
                          </Badge>
                        )}
                        {activity.metadata.priority && (
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getPriorityColor(activity.metadata.priority))}
                          >
                            {activity.metadata.priority}
                          </Badge>
                        )}
                        {activity.metadata.attachments && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {activity.metadata.attachments} archivo{activity.metadata.attachments !== 1 ? 's' : ''}
                          </span>
                        )}
                        {activity.metadata.mentions && activity.metadata.mentions.length > 0 && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {activity.metadata.mentions.length} mención{activity.metadata.mentions.length !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {activity.tags && activity.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {activity.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

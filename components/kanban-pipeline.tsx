"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// @ts-ignore - lucide-react types not resolving correctly
import { Plus, User, Calendar, DollarSign, Target, AlertCircle, CheckCircle2, Clock, TrendingUp, Filter, Search, Settings, Eye, EyeOff, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PipelineItem {
  id: string
  title: string
  description: string
  client: {
    name: string
    company?: string
    avatar: string
  }
  value: number
  probability: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: {
    name: string
    avatar: string
  }
  dueDate: Date
  tags: string[]
  lastActivity: Date
  status: string
}

interface PipelineColumn {
  id: string
  title: string
  color: string
  items: PipelineItem[]
  totalValue: number
  probability: number
}

export function KanbanPipeline() {
  const [columns, setColumns] = useState<PipelineColumn[]>([])
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'grid'>('kanban')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    assignedTo: 'all',
    priority: 'all',
    valueRange: 'all',
    search: ''
  })

  // Datos de ejemplo
  const mockColumns: PipelineColumn[] = [
    {
      id: 'leads',
      title: 'Leads',
      color: 'bg-blue-500',
      totalValue: 125000,
      probability: 20,
      items: [
        {
          id: '1',
          title: 'Seguro Empresarial - ABC Corp',
          description: 'Cotización para seguro de responsabilidad civil empresarial',
          client: {
            name: 'Carlos Rodríguez',
            company: 'ABC Corp',
            avatar: 'CR'
          },
          value: 25000,
          probability: 30,
          priority: 'high',
          assignedTo: {
            name: 'María González',
            avatar: 'MG'
          },
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          tags: ['empresarial', 'responsabilidad'],
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'leads'
        },
        {
          id: '2',
          title: 'Seguro de Hogar - Villa Premium',
          description: 'Seguro para villa de lujo en Cap Cana',
          client: {
            name: 'Ana López',
            company: 'Villa Premium',
            avatar: 'AL'
          },
          value: 15000,
          probability: 40,
          priority: 'medium',
          assignedTo: {
            name: 'Pedro García',
            avatar: 'PG'
          },
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          tags: ['hogar', 'lujo', 'cap-cana'],
          lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'leads'
        }
      ]
    },
    {
      id: 'contacted',
      title: 'Contactados',
      color: 'bg-yellow-500',
      totalValue: 85000,
      probability: 40,
      items: [
        {
          id: '3',
          title: 'Seguro de Auto - Flota Empresarial',
          description: 'Seguro para flota de 15 vehículos corporativos',
          client: {
            name: 'Roberto Silva',
            company: 'Transportes del Caribe',
            avatar: 'RS'
          },
          value: 35000,
          probability: 60,
          priority: 'high',
          assignedTo: {
            name: 'Laura Martínez',
            avatar: 'LM'
          },
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          tags: ['auto', 'flota', 'empresarial'],
          lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'contacted'
        }
      ]
    },
    {
      id: 'quoted',
      title: 'Cotizados',
      color: 'bg-orange-500',
      totalValue: 120000,
      probability: 60,
      items: [
        {
          id: '4',
          title: 'Paquete Turístico - Grupo Corporativo',
          description: 'Viaje de incentivos para 25 ejecutivos',
          client: {
            name: 'Carmen Ruiz',
            company: 'Inversiones del Caribe',
            avatar: 'CR'
          },
          value: 45000,
          probability: 70,
          priority: 'medium',
          assignedTo: {
            name: 'Miguel Torres',
            avatar: 'MT'
          },
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          tags: ['turismo', 'corporativo', 'incentivos'],
          lastActivity: new Date(Date.now() - 30 * 60 * 1000),
          status: 'quoted'
        }
      ]
    },
    {
      id: 'negotiation',
      title: 'Negociación',
      color: 'bg-purple-500',
      totalValue: 75000,
      probability: 80,
      items: [
        {
          id: '5',
          title: 'Seguro de Vida - Ejecutivo Senior',
          description: 'Póliza de vida para ejecutivo con cobertura de $500K',
          client: {
            name: 'Alejandro Vega',
            company: 'Banco Nacional',
            avatar: 'AV'
          },
          value: 30000,
          probability: 85,
          priority: 'urgent',
          assignedTo: {
            name: 'Sofia Herrera',
            avatar: 'SH'
          },
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          tags: ['vida', 'ejecutivo', 'alta-suma'],
          lastActivity: new Date(Date.now() - 15 * 60 * 1000),
          status: 'negotiation'
        }
      ]
    },
    {
      id: 'closed-won',
      title: 'Ganados',
      color: 'bg-green-500',
      totalValue: 200000,
      probability: 100,
      items: [
        {
          id: '6',
          title: 'Seguro de Hogar - Residencia Principal',
          description: 'Póliza completa para residencia en Santo Domingo',
          client: {
            name: 'Patricia Morales',
            company: 'Morales & Asociados',
            avatar: 'PM'
          },
          value: 12000,
          probability: 100,
          priority: 'low',
          assignedTo: {
            name: 'Carlos López',
            avatar: 'CL'
          },
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          tags: ['hogar', 'residencia', 'completado'],
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: 'closed-won'
        }
      ]
    }
  ]

  useEffect(() => {
    setColumns(mockColumns)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-3 h-3 text-red-500" />
      case 'high': return <TrendingUp className="w-3 h-3 text-orange-500" />
      case 'medium': return <Clock className="w-3 h-3 text-yellow-500" />
      case 'low': return <CheckCircle2 className="w-3 h-3 text-green-500" />
      default: return <Target className="w-3 h-3 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
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

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return 'Vencido'
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Mañana'
    return `En ${days} días`
  }

  const getDueDateColor = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return 'text-red-600 bg-red-100'
    if (days <= 1) return 'text-orange-600 bg-orange-100'
    if (days <= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const totalValue = columns.reduce((sum, col) => sum + col.totalValue, 0)
  const totalItems = columns.reduce((sum, col) => sum + col.items.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Pipeline de Ventas
          </h2>
          <p className="text-muted-foreground">
            {totalItems} oportunidades • {formatCurrency(totalValue)} valor total
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
          <div className="flex items-center border rounded-none">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="rounded-none font-bold"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none font-bold"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg rounded-none">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Asignado a</label>
                <select
                  value={filters.assignedTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
                   className="w-full p-2 border rounded-none bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="maria">María González</option>
                  <option value="pedro">Pedro García</option>
                  <option value="laura">Laura Martínez</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prioridad</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                   className="w-full p-2 border rounded-none bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">Todas</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rango de Valor</label>
                <select
                  value={filters.valueRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, valueRange: e.target.value }))}
                   className="w-full p-2 border rounded-none bg-background focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="0-10000">$0 - $10K</option>
                  <option value="10000-50000">$10K - $50K</option>
                  <option value="50000+">$50K+</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar oportunidades..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border rounded-none bg-background focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pipeline View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {columns.map((column) => (
            <Card key={column.id} className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg rounded-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-none", column.color)} />
                    <CardTitle className="text-sm font-semibold">{column.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {column.items.length}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(column.totalValue)} • {column.probability}% probabilidad
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.items.map((item) => (
                  <Card key={item.id} className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm border border-border/30 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-none">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                            {item.client.avatar}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{item.client.name}</p>
                            {item.client.company && (
                              <p className="text-xs text-muted-foreground truncate">{item.client.company}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(item.value)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {item.probability}%
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getPriorityColor(item.priority))}
                          >
                            {getPriorityIcon(item.priority)}
                            <span className="ml-1 capitalize">{item.priority}</span>
                          </Badge>
                          <span className={cn("text-xs px-2 py-1 rounded-none", getDueDateColor(item.dueDate))}>
                            {formatDueDate(item.dueDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {item.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{item.tags.length - 2}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatTimeAgo(item.lastActivity)}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                              {item.assignedTo.avatar}
                            </div>
                            <span className="truncate">{item.assignedTo.name}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="ghost"
                  className="w-full h-12 border-2 border-dashed border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Oportunidad
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg rounded-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/20">
                  <tr>
                    <th className="text-left p-4 font-semibold">Oportunidad</th>
                    <th className="text-left p-4 font-semibold">Cliente</th>
                    <th className="text-left p-4 font-semibold">Valor</th>
                    <th className="text-left p-4 font-semibold">Probabilidad</th>
                    <th className="text-left p-4 font-semibold">Asignado</th>
                    <th className="text-left p-4 font-semibold">Vencimiento</th>
                    <th className="text-left p-4 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.flatMap(col => col.items).map((item) => (
                    <tr key={item.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors duration-200">
                      <td className="p-4">
                        <div>
                          <h4 className="font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                            {item.client.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.client.name}</p>
                            {item.client.company && (
                              <p className="text-sm text-muted-foreground">{item.client.company}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-green-600">{formatCurrency(item.value)}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {item.probability}%
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                            {item.assignedTo.avatar}
                          </div>
                          <span className="text-sm">{item.assignedTo.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn("text-xs px-2 py-1 rounded-none", getDueDateColor(item.dueDate))}>
                          {formatDueDate(item.dueDate)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getPriorityColor(item.priority))}
                        >
                          {getPriorityIcon(item.priority)}
                          <span className="ml-1 capitalize">{item.priority}</span>
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {columns.flatMap(col => col.items).map((item) => (
            <Card key={item.id} className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-none">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-foreground line-clamp-2">{item.title}</h4>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                      {item.client.avatar}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.client.name}</p>
                      {item.client.company && (
                        <p className="text-xs text-muted-foreground truncate">{item.client.company}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">{formatCurrency(item.value)}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.probability}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getPriorityColor(item.priority))}
                    >
                      {getPriorityIcon(item.priority)}
                      <span className="ml-1 capitalize">{item.priority}</span>
                    </Badge>
                    <span className={cn("text-xs px-2 py-1 rounded-none", getDueDateColor(item.dueDate))}>
                      {formatDueDate(item.dueDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{item.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTimeAgo(item.lastActivity)}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-none bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-semibold">
                        {item.assignedTo.avatar}
                      </div>
                      <span className="truncate">{item.assignedTo.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

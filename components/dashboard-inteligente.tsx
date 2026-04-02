"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// @ts-ignore - lucide-react types not resolving correctly
import { TrendingUp, TrendingDown, Users, DollarSign, FileText, Calendar, Target, Activity, ArrowUpRight, ArrowDownRight, RefreshCw, Download, Filter, Settings, Shield, Home, Plane } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPIData {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
  trend: number[]
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
  }[]
}

export function DashboardInteligente() {
  const [kpis, setKpis] = useState<KPIData[]>([
    {
      id: 'seguros',
      title: 'Pólizas Activas',
      value: '3',
      change: 0,
      changeType: 'neutral',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-blue-500',
      trend: [1, 2, 2, 3, 3, 3, 3]
    },
    {
      id: 'propiedades',
      title: 'Propiedades Guardadas',
      value: '12',
      change: 20,
      changeType: 'increase',
      icon: <Home className="w-5 h-5" />,
      color: 'text-amber-500',
      trend: [5, 8, 10, 12, 12, 12, 12]
    },
    {
      id: 'viajes',
      title: 'Viajes Programados',
      value: '1',
      change: 100,
      changeType: 'increase',
      icon: <Plane className="w-5 h-5" />,
      color: 'text-purple-500',
      trend: [0, 0, 0, 1, 1, 1, 1]
    },
    {
      id: 'patrimonio',
      title: 'Patrimonio Estimado',
      value: '$1.2M',
      change: 5.2,
      changeType: 'increase',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-500',
      trend: [1.1, 1.15, 1.18, 1.2, 1.2, 1.2, 1.2]
    }
  ])

  const [recentActivities, setRecentActivities] = useState([
    {
      id: '1',
      type: 'seguro',
      message: 'Póliza de Auto renovada exitosamente',
      amount: '$2,400',
      time: 'Hace 2 días',
      status: 'completed'
    },
    {
      id: '2',
      type: 'propiedad',
      message: 'Nueva propiedad guardada: Villa en Punta Cana',
      amount: null,
      time: 'Hace 3 horas',
      status: 'new'
    },
    {
      id: '3',
      type: 'viaje',
      message: 'Reserva confirmada: Tour Samaná VIP',
      amount: '$450',
      time: 'Hace 5 horas',
      status: 'completed'
    },
    {
      id: '4',
      type: 'cita',
      message: 'Cita programada: Visita Apartamento Piantini',
      amount: null,
      time: 'Mañana, 10:00 AM',
      status: 'pending'
    }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simular actualización en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => prev.map(kpi => ({
        ...kpi,
        value: kpi.id === 'ventas' ? `$${(Math.random() * 100000 + 100000).toFixed(0)}` :
          kpi.id === 'clientes' ? `${Math.floor(Math.random() * 20 + 40)}` :
            kpi.id === 'conversion' ? `${(Math.random() * 10 + 20).toFixed(1)}%` :
              `${Math.floor(Math.random() * 20 + 80)}%`,
        change: Math.random() * 20 - 10,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease'
      })))
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'seguro': return <Shield className="w-4 h-4 text-blue-500" />
      case 'propiedad': return <Home className="w-4 h-4 text-amber-500" />
      case 'viaje': return <Plane className="w-4 h-4 text-purple-500" />
      case 'cita': return <Calendar className="w-4 h-4 text-green-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Dashboard Inteligente
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoreo en tiempo real de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10", kpi.color)}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                {kpi.value}
              </div>
              <div className="flex items-center gap-2">
                {kpi.changeType === 'increase' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : kpi.changeType === 'decrease' ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  kpi.changeType === 'increase' ? "text-green-500" :
                    kpi.changeType === 'decrease' ? "text-red-500" : "text-muted-foreground"
                )}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  vs mes anterior
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Tendencias de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                <p>Gráfico de tendencias en desarrollo</p>
                <p className="text-sm">Próximamente: Gráficos interactivos con Chart.js</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm text-foreground font-medium line-clamp-2">
                    {activity.message}
                  </p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      {activity.amount}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getActivityStatusColor(activity.status))}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-primary hover:bg-primary/10">
              Ver todas las actividades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-2xl border border-border/20 shadow-lg">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 transition-all duration-300 hover:scale-105">
              <Shield className="w-6 h-6" />
              <span className="text-sm">Nueva Póliza</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 transition-all duration-300 hover:scale-105">
              <Home className="w-6 h-6" />
              <span className="text-sm">Buscar Propiedad</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 transition-all duration-300 hover:scale-105">
              <Plane className="w-6 h-6" />
              <span className="text-sm">Planear Viaje</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 transition-all duration-300 hover:scale-105">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Agendar Cita</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

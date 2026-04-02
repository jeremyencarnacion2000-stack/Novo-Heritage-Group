"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// @ts-ignore - lucide-react types not resolving correctly
import { TrendingUp, Users, DollarSign, Activity, Download, Filter } from "lucide-react"

interface AnalyticsData {
  date: string
  conversions: number
  revenue: number
  users: number
  engagement: number
}

interface MetricCard {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  color: string
}

const mockData: AnalyticsData[] = [
  { date: "Lun", conversions: 45, revenue: 2400, users: 240, engagement: 65 },
  { date: "Mar", conversions: 52, revenue: 2210, users: 221, engagement: 72 },
  { date: "Mié", conversions: 48, revenue: 2290, users: 229, engagement: 68 },
  { date: "Jue", conversions: 61, revenue: 2000, users: 200, engagement: 75 },
  { date: "Vie", conversions: 55, revenue: 2181, users: 218, engagement: 70 },
  { date: "Sáb", conversions: 67, revenue: 2500, users: 250, engagement: 82 },
  { date: "Dom", conversions: 72, revenue: 2100, users: 210, engagement: 78 },
]

const categoryData = [
  { name: "Seguros", value: 35, color: "#1E5BA8" },
  { name: "Bienes Raíces", value: 45, color: "#E8B923" },
  { name: "Turismo", value: 20, color: "#E8923F" },
]

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week")
  const [selectedMetric, setSelectedMetric] = useState<"conversions" | "revenue" | "users" | "engagement">("conversions")

  const metrics: MetricCard[] = useMemo(
    () => [
      {
        title: "Conversiones",
        value: "400",
        change: 12.5,
        icon: <TrendingUp className="w-5 h-5" />,
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Usuarios Activos",
        value: "1,668",
        change: 8.2,
        icon: <Users className="w-5 h-5" />,
        color: "from-purple-500 to-purple-600",
      },
      {
        title: "Ingresos",
        value: "$12,500",
        change: 23.1,
        icon: <DollarSign className="w-5 h-5" />,
        color: "from-green-500 to-green-600",
      },
      {
        title: "Engagement",
        value: "72%",
        change: 5.4,
        icon: <Activity className="w-5 h-5" />,
        color: "from-orange-500 to-orange-600",
      },
    ],
    []
  )

  const handleExport = () => {
    const csv = [
      ["Fecha", "Conversiones", "Ingresos", "Usuarios", "Engagement"],
      ...mockData.map((d) => [d.date, d.conversions, d.revenue, d.users, d.engagement]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="w-full space-y-6 p-6 bg-gradient-to-br from-background to-background/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Análisis en tiempo real de tu negocio</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            onClick={() => setTimeRange("week")}
            size="sm"
          >
            Semana
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
            size="sm"
          >
            Mes
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            onClick={() => setTimeRange("year")}
            size="sm"
          >
            Año
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{metric.title}</p>
                <p className="text-2xl font-serif font-light text-foreground mt-2">{metric.value}</p>
                <p className={`text-xs mt-2 ${metric.change > 0 ? "text-green-500" : "text-red-500"}`}>
                  {metric.change > 0 ? "↑" : "↓"} {Math.abs(metric.change)}% vs período anterior
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} text-white group-hover:scale-110 transition-transform`}>
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 p-6 bg-card/50 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-light text-foreground">Tendencias</h2>
            <div className="flex gap-2">
              {(["conversions", "revenue", "users", "engagement"] as const).map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  onClick={() => setSelectedMetric(metric)}
                  size="sm"
                  className="capitalize"
                >
                  {metric === "conversions" && "Conversiones"}
                  {metric === "revenue" && "Ingresos"}
                  {metric === "users" && "Usuarios"}
                  {metric === "engagement" && "Engagement"}
                </Button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E5BA8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1E5BA8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" />
              <YAxis stroke="rgba(0,0,0,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="#1E5BA8"
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 bg-card/50 border-border/50">
          <h2 className="text-lg font-serif font-light text-foreground mb-4">Distribución por Categoría</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6 bg-card/50 border-border/50">
        <h2 className="text-lg font-serif font-light text-foreground mb-4">Funnel de Conversión</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { stage: "Visitantes", value: 1000, fill: "#1E5BA8" },
              { stage: "Leads", value: 750, fill: "#4A9FD8" },
              { stage: "Clientes", value: 400, fill: "#E8B923" },
              { stage: "Repeat", value: 200, fill: "#E8923F" },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="stage" stroke="rgba(0,0,0,0.5)" />
            <YAxis stroke="rgba(0,0,0,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#1E5BA8" radius={[8, 8, 0, 0]}>
              {[
                { stage: "Visitantes", value: 1000, fill: "#1E5BA8" },
                { stage: "Leads", value: 750, fill: "#4A9FD8" },
                { stage: "Clientes", value: 400, fill: "#E8B923" },
                { stage: "Repeat", value: 200, fill: "#E8923F" },
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

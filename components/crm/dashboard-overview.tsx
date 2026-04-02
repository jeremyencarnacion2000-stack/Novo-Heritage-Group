"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FiUsers as Users, FiHome as Building2, FiDollarSign as DollarSign, FiTrendingUp as TrendingUp, FiActivity as Activity } from "react-icons/fi"

export function DashboardOverview() {
    const stats = [
        {
            title: "Total Usuarios",
            value: "1,234",
            change: "+12%",
            icon: Users,
            trend: "up"
        },
        {
            title: "Propiedades Activas",
            value: "45",
            change: "+3",
            icon: Building2,
            trend: "up"
        },
        {
            title: "Ingresos Mensuales",
            value: "$125,000",
            change: "+8.5%",
            icon: DollarSign,
            trend: "up"
        },
        {
            title: "Leads Nuevos",
            value: "89",
            change: "+24%",
            icon: TrendingUp,
            trend: "up"
        }
    ]

    const recentActivity = [
        {
            user: "Juan Pérez",
            action: "Registró una nueva propiedad",
            target: "Villa en Punta Cana",
            time: "Hace 2 horas"
        },
        {
            user: "María Rodríguez",
            action: "Actualizó estado de lead",
            target: "Carlos Gómez - Interesado en Seguros",
            time: "Hace 4 horas"
        },
        {
            user: "Sistema",
            action: "Generó reporte mensual",
            target: "Reporte de Ventas - Diciembre",
            time: "Hace 5 horas"
        },
        {
            user: "Ana Martínez",
            action: "Agendó visita",
            target: "Apartamento en Naco",
            time: "Hace 1 día"
        }
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-500 font-medium">{stat.change}</span> vs mes anterior
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentActivity.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                        <Activity className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.user}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.action}: <span className="font-medium text-foreground">{item.target}</span>
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {item.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Placeholder */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                                <p className="font-medium text-sm">Agregar Nueva Propiedad</p>
                            </div>
                            <div className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                                <p className="font-medium text-sm">Registrar Nuevo Usuario</p>
                            </div>
                            <div className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                                <p className="font-medium text-sm">Generar Reporte</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

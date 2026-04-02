"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FiMoreHorizontal, FiPlus, FiPhone, FiMail } from "react-icons/fi"
import { ScrollArea } from "@/components/ui/scroll-area"

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed'

interface Lead {
    id: string
    name: string
    budget: string
    interest: string
    status: LeadStatus
    lastContact: string
}

const initialLeads: Lead[] = [
    { id: '1', name: 'Carlos Ruiz', budget: '$250k - $300k', interest: 'Apartamento Centro', status: 'new', lastContact: '2h' },
    { id: '2', name: 'Ana Lopez', budget: '$500k+', interest: 'Villa Lujo', status: 'contacted', lastContact: '1d' },
    { id: '3', name: 'Empresa XYZ', budget: '$1M+', interest: 'Terreno Comercial', status: 'qualified', lastContact: '3d' },
    { id: '4', name: 'John Smith', budget: '$400k', interest: 'Penthouse', status: 'proposal', lastContact: '5h' },
    { id: '5', name: 'Maria Garcia', budget: '$150k', interest: 'Estudio', status: 'closed', lastContact: '1w' },
    { id: '6', name: 'Roberto Diaz', budget: '$300k', interest: 'Casa Familiar', status: 'new', lastContact: '10m' },
]

const columns: { id: LeadStatus; title: string; color: string }[] = [
    { id: 'new', title: 'Nuevos', color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contactados', color: 'bg-yellow-500' },
    { id: 'qualified', title: 'Calificados', color: 'bg-purple-500' },
    { id: 'proposal', title: 'Propuesta', color: 'bg-orange-500' },
    { id: 'closed', title: 'Cerrados', color: 'bg-green-500' },
]

export function LeadsPipeline() {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)

    const getLeadsByStatus = (status: LeadStatus) => leads.filter(lead => lead.status === status)

    return (
        <div className="h-[calc(100vh-12rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pipeline de Ventas</h2>
                    <p className="text-muted-foreground">Gestiona el flujo de tus oportunidades de negocio.</p>
                </div>
                <Button>
                    <FiPlus className="mr-2 h-4 w-4" /> Nuevo Lead
                </Button>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[1200px] h-full">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-1 min-w-[280px] flex flex-col bg-muted/30 rounded-lg border">
                            <div className="p-3 border-b flex items-center justify-between bg-muted/50 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                    <span className="font-medium text-sm">{column.title}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {getLeadsByStatus(column.id).length}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <FiMoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 p-3">
                                <div className="space-y-3">
                                    {getLeadsByStatus(column.id).map((lead) => (
                                        <Card key={lead.id} className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                                            <CardContent className="p-3 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`} />
                                                            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium leading-none">{lead.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">{lead.lastContact}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-primary">{lead.interest}</p>
                                                    <p className="text-xs text-muted-foreground">Presupuesto: {lead.budget}</p>
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 border-t">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" title="Llamar">
                                                        <FiPhone className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Email">
                                                        <FiMail className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

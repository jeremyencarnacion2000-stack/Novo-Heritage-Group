"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FiSearch as Search, FiMessageSquare as MessageSquare, FiMoreHorizontal as MoreHorizontal, FiCheckCircle as CheckCircle, FiClock as Clock } from "react-icons/fi"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LeadsManager() {
    const [searchTerm, setSearchTerm] = useState("")

    // Mock data
    const leads = [
        {
            id: "LEAD-001",
            name: "Carlos Gómez",
            email: "carlos.g@gmail.com",
            interest: "Seguro de Auto",
            status: "new",
            date: "2024-01-15"
        },
        {
            id: "LEAD-002",
            name: "Ana López",
            email: "ana.lopez@yahoo.com",
            interest: "Compra - Villa Punta Cana",
            status: "contacted",
            date: "2024-01-14"
        },
        {
            id: "LEAD-003",
            name: "Roberto Díaz",
            email: "roberto.d@hotmail.com",
            interest: "Paquete Turístico París",
            status: "qualified",
            date: "2024-01-12"
        },
        {
            id: "LEAD-004",
            name: "Empresa XYZ",
            email: "contacto@xyz.com",
            interest: "Seguro Corporativo",
            status: "proposal",
            date: "2024-01-10"
        },
        {
            id: "LEAD-005",
            name: "Laura M.",
            email: "laura.m@gmail.com",
            interest: "Alquiler Naco",
            status: "closed",
            date: "2024-01-05"
        }
    ]

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.interest.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return <Badge className="bg-blue-500">Nuevo</Badge>
            case 'contacted':
                return <Badge className="bg-yellow-500">Contactado</Badge>
            case 'qualified':
                return <Badge className="bg-purple-500">Calificado</Badge>
            case 'proposal':
                return <Badge className="bg-orange-500">Propuesta</Badge>
            case 'closed':
                return <Badge className="bg-green-500">Cerrado</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Leads</h2>
                <div className="flex gap-2">
                    <Button variant="outline">Exportar CSV</Button>
                </div>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Interés</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{lead.name}</span>
                                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{lead.interest}</TableCell>
                                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{lead.date}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                <MessageSquare className="mr-2 h-4 w-4" /> Contactar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Marcar Contactado
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Clock className="mr-2 h-4 w-4" /> Ver Historial
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

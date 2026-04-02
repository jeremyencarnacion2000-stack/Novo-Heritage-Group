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
import { FiSearch as Search, FiPlus as Plus, FiMoreHorizontal as MoreHorizontal, FiEdit as Edit, FiTrash as Trash } from "react-icons/fi"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PropertiesManager() {
    const [searchTerm, setSearchTerm] = useState("")

    // Mock data
    const properties = [
        {
            id: "PROP-001",
            title: "Villa Moderna en Punta Cana",
            location: "Punta Cana, La Altagracia",
            price: 450000,
            status: "active",
            type: "Venta"
        },
        {
            id: "PROP-002",
            title: "Apartamento de Lujo en Naco",
            location: "Naco, Santo Domingo",
            price: 280000,
            status: "active",
            type: "Venta"
        },
        {
            id: "PROP-003",
            title: "Penthouse con Vista al Mar",
            location: "Juan Dolio, San Pedro",
            price: 550000,
            status: "pending",
            type: "Venta"
        },
        {
            id: "PROP-004",
            title: "Local Comercial Piantini",
            location: "Piantini, Santo Domingo",
            price: 3500,
            status: "active",
            type: "Alquiler"
        },
        {
            id: "PROP-005",
            title: "Terreno en Samaná",
            location: "Las Terrenas, Samaná",
            price: 120000,
            status: "sold",
            type: "Venta"
        }
    ]

    const filteredProperties = properties.filter(prop =>
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
            case 'pending':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>
            case 'sold':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Vendido</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Propiedades</h2>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Propiedad
                </Button>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar propiedades..."
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
                            <TableHead>ID</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Ubicación</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProperties.map((property) => (
                            <TableRow key={property.id}>
                                <TableCell className="font-medium">{property.id}</TableCell>
                                <TableCell>{property.title}</TableCell>
                                <TableCell>{property.location}</TableCell>
                                <TableCell>{property.type}</TableCell>
                                <TableCell>
                                    {property.type === 'Alquiler'
                                        ? `$${property.price.toLocaleString()}/mes`
                                        : `$${property.price.toLocaleString()}`}
                                </TableCell>
                                <TableCell>{getStatusBadge(property.status)}</TableCell>
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
                                                <Edit className="mr-2 h-4 w-4" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash className="mr-2 h-4 w-4" /> Eliminar
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

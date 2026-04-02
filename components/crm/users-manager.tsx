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
import { FiSearch as Search, FiUserPlus as UserPlus, FiMoreHorizontal as MoreHorizontal, FiShield as Shield, FiMail as Mail, FiCheck as Check, FiX as X } from "react-icons/fi"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'agent' | 'user'
    status: 'active' | 'pending' | 'offline'
    lastActive: string
}

export function UsersManager() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)

    // Initial mock data with requested admins
    const [users, setUsers] = useState<User[]>([
        {
            id: "ADM-001",
            name: "L. Heritage",
            email: "l.heritage@gmail.com",
            role: "admin",
            status: "active",
            lastActive: "Ahora"
        },
        {
            id: "ADM-002",
            name: "Angel Heritage",
            email: "angel.heritage@gmail.com",
            role: "admin",
            status: "active",
            lastActive: "Hace 5 min"
        },
        {
            id: "USR-001",
            name: "Admin User",
            email: "admin@novoheritage.com",
            role: "admin",
            status: "active",
            lastActive: "Hace 1 hora"
        },
        {
            id: "USR-002",
            name: "Juan Agente",
            email: "juan.agente@novoheritage.com",
            role: "agent",
            status: "active",
            lastActive: "Hace 1 hora"
        },
        {
            id: "USR-003",
            name: "Cliente VIP",
            email: "cliente.vip@gmail.com",
            role: "user",
            status: "active",
            lastActive: "Hace 2 días"
        },
        {
            id: "USR-004",
            name: "María Ventas",
            email: "maria.ventas@novoheritage.com",
            role: "agent",
            status: "offline",
            lastActive: "Hace 5 horas"
        },
    ])

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "user" as User['role']
    })

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddUser = () => {
        if (!newUser.name || !newUser.email) {
            toast.error("Por favor completa todos los campos")
            return
        }

        const user: User = {
            id: `USR-${Math.floor(Math.random() * 1000)}`,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: 'pending',
            lastActive: 'Nunca'
        }

        setUsers([...users, user])
        setIsAddUserOpen(false)
        setNewUser({ name: "", email: "", role: "user" })
        toast.success("Usuario creado exitosamente")
    }

    const handleRoleChange = (userId: string, newRole: User['role']) => {
        setUsers(users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        ))
        toast.success("Rol actualizado correctamente")
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-purple-500 hover:bg-purple-600">Administrador</Badge>
            case 'agent':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Agente</Badge>
            default:
                return <Badge variant="secondary">Usuario</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Nuevo Usuario
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                            <DialogDescription>
                                Agrega un nuevo usuario al sistema. Se le enviará un correo de invitación.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nombre
                                </Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Rol
                                </Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value: User['role']) => setNewUser({ ...newUser, role: value })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Usuario</SelectItem>
                                        <SelectItem value="agent">Agente</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAddUser}>Crear Usuario</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center py-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuarios..."
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
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Última Actividad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`/avatars/${user.id}.png`} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-500' :
                                            user.status === 'offline' ? 'bg-gray-400' : 'bg-yellow-500'
                                            }`} />
                                        <span className="capitalize text-sm">{user.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">{user.lastActive}</TableCell>
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

                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <Shield className="mr-2 h-4 w-4" /> Cambiar Rol
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuRadioGroup value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as User['role'])}>
                                                        <DropdownMenuRadioItem value="admin">Administrador</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="agent">Agente</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="user">Usuario</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>

                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" /> Enviar Email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                Bloquear Acceso
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

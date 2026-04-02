"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { FiClock, FiMapPin, FiPlus, FiVideo, FiEdit, FiTrash2 } from "react-icons/fi"

interface Appointment {
    id: number
    title: string
    client: string
    time: string
    type: "presencial" | "virtual"
    location: string
    date: Date
    notes?: string
}

export function CalendarView() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

    const [appointments, setAppointments] = useState<Appointment[]>([
        {
            id: 1,
            title: "Visita a Villa Paraíso",
            client: "Carlos Ruiz",
            time: "10:00",
            type: "presencial",
            location: "Punta Cana, Sector 4",
            date: new Date()
        },
        {
            id: 2,
            title: "Reunión de Estrategia",
            client: "Equipo Interno",
            time: "14:00",
            type: "virtual",
            location: "Google Meet",
            date: new Date()
        },
        {
            id: 3,
            title: "Firma de Contrato",
            client: "Ana Lopez",
            time: "16:30",
            type: "presencial",
            location: "Oficina Principal",
            date: new Date(new Date().setDate(new Date().getDate() + 1))
        }
    ])

    const [formData, setFormData] = useState({
        title: "",
        client: "",
        time: "",
        type: "presencial" as "presencial" | "virtual",
        location: "",
        notes: ""
    })

    const resetForm = () => {
        setFormData({
            title: "",
            client: "",
            time: "",
            type: "presencial",
            location: "",
            notes: ""
        })
        setEditingAppointment(null)
    }

    const handleOpenDialog = (appointment?: Appointment) => {
        if (appointment) {
            setEditingAppointment(appointment)
            setFormData({
                title: appointment.title,
                client: appointment.client,
                time: appointment.time,
                type: appointment.type,
                location: appointment.location,
                notes: appointment.notes || ""
            })
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            toast.error("El título es requerido")
            return false
        }
        if (!formData.client.trim()) {
            toast.error("El cliente es requerido")
            return false
        }
        if (!formData.time) {
            toast.error("La hora es requerida")
            return false
        }
        if (!formData.location.trim()) {
            toast.error("La ubicación es requerida")
            return false
        }
        return true
    }

    const handleSubmit = () => {
        if (!validateForm()) return
        if (!date) {
            toast.error("Selecciona una fecha")
            return
        }

        if (editingAppointment) {
            // Update existing appointment
            setAppointments(prev => prev.map(apt =>
                apt.id === editingAppointment.id
                    ? { ...apt, ...formData, date }
                    : apt
            ))
            toast.success("Cita actualizada correctamente")
        } else {
            // Create new appointment
            const newAppointment: Appointment = {
                id: Date.now(),
                ...formData,
                date
            }
            setAppointments(prev => [...prev, newAppointment])
            toast.success("Cita creada correctamente")
        }

        setIsDialogOpen(false)
        resetForm()
    }

    const handleDelete = (id: number) => {
        setAppointments(prev => prev.filter(apt => apt.id !== id))
        toast.success("Cita eliminada")
    }

    const selectedDateAppointments = appointments.filter(apt =>
        date && apt.date.toDateString() === date.toDateString()
    )

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":")
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? "PM" : "AM"
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Calendario & Agenda</h2>
                    <p className="text-muted-foreground">Organiza tus citas, visitas y reuniones.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <FiPlus className="mr-2 h-4 w-4" /> Nueva Cita
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingAppointment ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
                            <DialogDescription>
                                {editingAppointment ? "Modifica los detalles de la cita." : "Completa los detalles para programar una nueva cita."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    placeholder="Ej: Visita a propiedad"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="client">Cliente *</Label>
                                    <Input
                                        id="client"
                                        placeholder="Nombre del cliente"
                                        value={formData.client}
                                        onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Hora *</Label>
                                    <Select
                                        value={formData.time}
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, time: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                                                "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
                                                "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"].map(time => (
                                                    <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(v: "presencial" | "virtual") => setFormData(prev => ({ ...prev, type: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="presencial">Presencial</SelectItem>
                                            <SelectItem value="virtual">Virtual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Ubicación *</Label>
                                    <Input
                                        id="location"
                                        placeholder={formData.type === "virtual" ? "Link de la reunión" : "Dirección"}
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notas</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Notas adicionales..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSubmit}>
                                {editingAppointment ? "Guardar Cambios" : "Crear Cita"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Card className="md:col-span-4 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Calendario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow-sm"
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-8 lg:col-span-9">
                    <CardHeader>
                        <CardTitle>Agenda del Día</CardTitle>
                        <CardDescription>
                            {date?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedDateAppointments.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary">
                                            <span className="text-sm font-bold">{formatTime(apt.time).split(' ')[0]}</span>
                                            <span className="text-xs">{formatTime(apt.time).split(' ')[1]}</span>
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">{apt.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={apt.type === 'virtual' ? 'secondary' : 'outline'}>
                                                        {apt.type === 'virtual' ? 'Virtual' : 'Presencial'}
                                                    </Badge>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(apt)}>
                                                            <FiEdit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(apt.id)}>
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.client}`} />
                                                    <AvatarFallback>{apt.client.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{apt.client}</span>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                                <span className="flex items-center gap-1">
                                                    <FiClock className="h-3 w-3" /> {formatTime(apt.time)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {apt.type === 'virtual' ? <FiVideo className="h-3 w-3" /> : <FiMapPin className="h-3 w-3" />}
                                                    {apt.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <p>No hay citas programadas para este día.</p>
                                <Button variant="link" className="mt-2" onClick={() => handleOpenDialog()}>Programar una cita</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

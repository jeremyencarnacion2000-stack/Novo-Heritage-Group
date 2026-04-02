"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FiCalendar, FiClock, FiUser, FiMapPin, FiPhone, FiMail, FiCheck } from "react-icons/fi"
import { cn } from "@/lib/utils"

interface BookingFormProps {
    type: "appointment" | "trip" | "hotel" | "insurance"
    initialData?: Partial<{
        name: string
        email: string
        phone: string
        hotel: string
        destination: string
        guests: string
        travelers: string
        checkIn: Date
        checkOut: Date
    }>
    onSuccess?: () => void
    onCancel?: () => void
}

export function BookingForms({ type, initialData, onSuccess, onCancel }: BookingFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [date, setDate] = useState<Date | undefined>(initialData?.checkIn)
    const [endDate, setEndDate] = useState<Date | undefined>(initialData?.checkOut)

    // Form states
    const [formData, setFormData] = useState({
        // Common fields
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        notes: "",
        // Appointment specific
        time: "",
        propertyId: "",
        agentId: "",
        // Trip specific
        destination: initialData?.destination || "",
        travelers: initialData?.travelers || "1",
        packageType: "",
        // Hotel specific
        hotel: initialData?.hotel || "",
        rooms: "1",
        guests: initialData?.guests || "1",
        roomType: "",
        hotelImage: "",
        hotelRating: "",
        hotelDescription: "",
        // Insurance specific
        insuranceType: "",
        coverageAmount: "",
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const validateForm = (): boolean => {
        const errors: string[] = []

        if (!formData.name.trim()) errors.push("Nombre es requerido")
        if (!formData.email.trim()) errors.push("Email es requerido")
        if (!formData.email.includes("@")) errors.push("Email inválido")
        if (!formData.phone.trim()) errors.push("Teléfono es requerido")

        // Date is not strictly required for insurance initial contact
        if (type !== "insurance" && !date) errors.push("Fecha es requerida")

        if (type === "appointment") {
            if (!formData.time) errors.push("Hora es requerida")
        }

        if (type === "trip") {
            if (!formData.destination.trim()) errors.push("Destino es requerido")
            if (!endDate) errors.push("Fecha de regreso es requerida")
        }

        if (type === "hotel") {
            if (!formData.hotel.trim()) errors.push("Hotel es requerido")
            if (!endDate) errors.push("Fecha de checkout es requerida")
        }

        if (type === "insurance") {
            if (!formData.insuranceType) errors.push("Tipo de seguro es requerido")
        }

        if (errors.length > 0) {
            errors.forEach(err => toast.error(err))
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        try {
            // Map component type to internal subdivisions for proper routing
            const divisionMap: Record<string, string> = {
                appointment: "bienes_raices",
                trip: "turismo",
                hotel: "turismo",
                insurance: "seguros"
            };

            const payload = {
                division: divisionMap[type] || "contacto_general",
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.notes || "Solicitud generada vía Cotizador interactivo",
                source: `formulario_${type}`,
                propertyId: formData.propertyId || null,
                details: formData // Include all dynamic bits for flexible payloads
            };

            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("API Error");

            const typeLabels = {
                appointment: "Cita",
                trip: "Viaje",
                hotel: `Reservación de Hotel: ${formData.hotel}`,
                insurance: "Solicitud de Seguro"
            }

            toast.success(`${typeLabels[type]} enviada exitosamente`, {
                description: `Un asesor se pondrá en contacto contigo pronto en ${formData.email}`
            })

            // Reset form
            setFormData({
                name: "", email: "", phone: "", notes: "",
                time: "", propertyId: "", agentId: "",
                destination: "", travelers: "1", packageType: "",
                hotel: "", rooms: "1", guests: "1", roomType: "",
                hotelImage: "", hotelRating: "", hotelDescription: "",
                insuranceType: "", coverageAmount: "",
            })
            setDate(undefined)
            setEndDate(undefined)

            onSuccess?.()
        } catch (error) {
            toast.error("Error al procesar tu solicitud", {
               description: "Por favor revisa tu conexión e inténtalo de nuevo."
            })
        } finally {
            setIsLoading(false)
        }
    }

    const renderAppointmentForm = () => (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Fecha de la Cita</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Select value={formData.time} onValueChange={(v) => handleInputChange("time", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar hora" />
                        </SelectTrigger>
                        <SelectContent>
                            {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="property">Propiedad de Interés</Label>
                <Select value={formData.propertyId} onValueChange={(v) => handleInputChange("propertyId", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="prop1">Casa en Polanco - $15,000,000 MXN</SelectItem>
                        <SelectItem value="prop2">Departamento Santa Fe - $8,500,000 MXN</SelectItem>
                        <SelectItem value="prop3">Penthouse Reforma - $25,000,000 MXN</SelectItem>
                        <SelectItem value="prop4">Villa en Acapulco - $12,000,000 MXN</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    )

    const renderTripForm = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                {initialData?.destination ? (
                    <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="destination"
                            value={formData.destination}
                            onChange={(e) => handleInputChange("destination", e.target.value)}
                            className="pl-10 h-12 rounded-none bg-muted/50"
                        />
                    </div>
                ) : (
                    <Select value={formData.destination} onValueChange={(v) => handleInputChange("destination", v)}>
                        <SelectTrigger className="h-12 rounded-none">
                            <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="punta-cana">Punta Cana, RD</SelectItem>
                            <SelectItem value="samana">Samaná, RD</SelectItem>
                            <SelectItem value="santo-domingo">Santo Domingo, RD</SelectItem>
                            <SelectItem value="puerto-plata">Puerto Plata, RD</SelectItem>
                            <SelectItem value="la-romana">La Romana, RD</SelectItem>
                            <SelectItem value="jarabacoa">Jarabacoa, RD</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Fecha de Salida</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : "Seleccionar"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label>Fecha de Regreso</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="travelers">Número de Viajeros</Label>
                    <Select value={formData.travelers} onValueChange={(v) => handleInputChange("travelers", v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "persona" : "personas"}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="packageType">Tipo de Paquete</Label>
                    <Select value={formData.packageType} onValueChange={(v) => handleInputChange("packageType", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="standard">Estándar</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="luxury">Lujo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )

    const renderHotelForm = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="hotel">Hotel</Label>
                {initialData?.hotel ? (
                    <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="hotel"
                            value={formData.hotel}
                            onChange={(e) => handleInputChange("hotel", e.target.value)}
                            className="pl-10 h-12 rounded-none bg-muted/50"
                        />
                    </div>
                ) : (
                    <Select value={formData.hotel} onValueChange={(v) => handleInputChange("hotel", v)}>
                        <SelectTrigger className="h-12 rounded-none">
                            <SelectValue placeholder="Seleccionar hotel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="hard-rock">Hard Rock Hotel & Casino, Punta Cana</SelectItem>
                            <SelectItem value="casa-campo">Casa de Campo Resort & Villas</SelectItem>
                            <SelectItem value="eden-roc">Eden Roc Cap Cana</SelectItem>
                            <SelectItem value="amanera">Amanera Resort Samaná</SelectItem>
                            <SelectItem value="catalonia">Catalonia Santo Domingo</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Check-in</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : "Seleccionar"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="space-y-2">
                    <Label>Check-out</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                            >
                                <FiCalendar className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rooms">Habitaciones</Label>
                    <Select value={formData.rooms} onValueChange={(v) => handleInputChange("rooms", v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guests">Huéspedes</Label>
                    <Select value={formData.guests} onValueChange={(v) => handleInputChange("guests", v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="roomType">Tipo</Label>
                    <Select value={formData.roomType} onValueChange={(v) => handleInputChange("roomType", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="standard">Estándar</SelectItem>
                            <SelectItem value="deluxe">Deluxe</SelectItem>
                            <SelectItem value="suite">Suite</SelectItem>
                            <SelectItem value="presidential">Presidencial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    )

    const renderInsuranceForm = () => (
        <>
            <div className="space-y-2">
                <Label htmlFor="insuranceType">Tipo de Seguro</Label>
                <Select value={formData.insuranceType} onValueChange={(v) => handleInputChange("insuranceType", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo de seguro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="auto">Seguro de Auto</SelectItem>
                        <SelectItem value="home">Seguro de Hogar</SelectItem>
                        <SelectItem value="life">Seguro de Vida</SelectItem>
                        <SelectItem value="health">Seguro de Gastos Médicos</SelectItem>
                        <SelectItem value="business">Seguro Empresarial</SelectItem>
                        <SelectItem value="travel">Seguro de Viaje</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="coverageAmount">Monto de Cobertura Estimado (Opcional)</Label>
                <Input
                    id="coverageAmount"
                    placeholder="Ej. $1,000,000"
                    value={formData.coverageAmount}
                    onChange={(e) => handleInputChange("coverageAmount", e.target.value)}
                />
            </div>
        </>
    )

    const titles = {
        appointment: "Reservar Cita",
        trip: "Reservar Viaje",
        hotel: "Reservar Hotel",
        insurance: "Solicitar Cotización de Seguro"
    }

    const descriptions = {
        appointment: "Agenda una visita a la propiedad de tu interés",
        trip: "Planifica tu próxima aventura con nosotros",
        hotel: "Encuentra el alojamiento perfecto para tu estadía",
        insurance: "Déjanos tus datos para enviarte una propuesta personalizada"
    }

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <FiCalendar className="h-6 w-6 text-primary" />
                    {titles[type]}
                </CardTitle>
                <CardDescription>{descriptions[type]}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 px-0">
                    {/* Common fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo *</Label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Tu nombre"
                                    className="pl-10 h-12 rounded-none"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono *</Label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    placeholder="+1 809 123 4567"
                                    className="pl-10 h-12 rounded-none"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="pl-10 h-12 rounded-none"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type-specific fields */}
                    {type === "appointment" && renderAppointmentForm()}
                    {type === "trip" && renderTripForm()}
                    {type === "hotel" && renderHotelForm()}
                    {type === "insurance" && renderInsuranceForm()}

                    {/* Notes - common */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas Adicionales</Label>
                        <Textarea
                            id="notes"
                            placeholder="Cuéntanos más sobre tu solicitud..."
                            className="rounded-none"
                            value={formData.notes}
                            onChange={(e) => handleInputChange("notes", e.target.value)}
                            rows={3}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between px-0 pb-0 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 rounded-none">
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading} className={cn("h-12 px-10 rounded-none font-bold", !onCancel ? "w-full" : "")}>
                        {isLoading ? (
                            <>Procesando...</>
                        ) : (
                            <>
                                <FiCheck className="mr-2 h-5 w-5" />
                                {type === "insurance" ? "Enviar Solicitud" : "Confirmar Reservación"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

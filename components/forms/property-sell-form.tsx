"use client"

import { useState } from "react"
// @ts-ignore
import { Home, Key, MapPin, Camera, Building2, User, Phone, Mail, Check, UploadCloud } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function PropertySellForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        serviceType: "",
        propertyType: "",
        address: "",
        features: "",
        price: "",
    })

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.phone || !formData.serviceType || !formData.propertyType) {
            toast.error("Por favor complete todos los campos obligatorios.")
            return
        }

        setIsLoading(true)
        try {
            const payload = {
                division: "bienes_raices",
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: "Solicitud de Captación de Propiedad",
                source: "formulario_vender_alquilar",
                details: {
                    Servicio_Solicitado: formData.serviceType,
                    Tipo_Propiedad: formData.propertyType,
                    Direccion: formData.address,
                    Caracteristicas: formData.features,
                    Precio_Esperado: formData.price
                }
            }

            const res = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("API Error")

            toast.success("Propiedad enviada a evaluación", {
                description: "Nuestro equipo se pondrá en contacto pronto."
            })

            setFormData({
                name: "", email: "", phone: "", serviceType: "", propertyType: "", address: "", features: "", price: ""
            })
        } catch (error) {
            toast.error("Error al procesar", {
                description: "Inténtelo de nuevo más tarde."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full relative shadow-premium border border-primary/20 bg-background/95 backdrop-blur-md overflow-hidden rounded-none">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
            
            <CardHeader className="text-center p-10 pb-6 border-b border-primary/10">
                <div className="mx-auto w-16 h-16 bg-primary/5 border border-primary/20 flex items-center justify-center mb-6">
                    <Key className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-serif text-foreground mb-4">
                    Comercialice su <span className="italic text-primary">Inmueble</span>
                </CardTitle>
                <CardDescription className="text-sm font-light tracking-wide max-w-xl mx-auto">
                    Confíe la venta o alquiler de su propiedad a nuestra red de agentes premium. Garantizamos discreción comercial y exposición al público ideal.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-10 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Operation Type */}
                    <div className="space-y-3 col-span-1 md:col-span-2 lg:col-span-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">¿Qué desea hacer? *</Label>
                        <Select value={formData.serviceType} onValueChange={(v) => handleInputChange("serviceType", v)}>
                            <SelectTrigger className="h-14 rounded-none border-primary/20 bg-background focus:ring-1 focus:ring-primary/50 text-sm">
                                <SelectValue placeholder="Vender o Alquilar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Vender">Vender mi propiedad</SelectItem>
                                <SelectItem value="Alquilar">Alquilar mi propiedad</SelectItem>
                                <SelectItem value="Ambas">Administración completa (Alquilar & Mantener)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Property Type */}
                    <div className="space-y-3 col-span-1 md:col-span-2 lg:col-span-1">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Tipo de Inmueble *</Label>
                        <Select value={formData.propertyType} onValueChange={(v) => handleInputChange("propertyType", v)}>
                            <SelectTrigger className="h-14 rounded-none border-primary/20 bg-background focus:ring-1 focus:ring-primary/50 text-sm">
                                <SelectValue placeholder="Categoría Inmobiliaria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Villa">Villa / Residencia Exclusiva</SelectItem>
                                <SelectItem value="Apartamento">Apartamento / Condominio</SelectItem>
                                <SelectItem value="Penthouse">Penthouse</SelectItem>
                                <SelectItem value="Solar">Solar / Terreno Comercial</SelectItem>
                                <SelectItem value="Local">Local Comercial / Torre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 col-span-1 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Dirección y Zona *</Label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            <Input 
                                placeholder="Ej. Piantini, Cap Cana, Casa de Campo..." 
                                className="h-14 pl-12 rounded-none border-primary/20 bg-background"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 col-span-1 border-t border-primary/10 pt-6 mt-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Propietario *</Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            <Input 
                                placeholder="Nombre completo" 
                                className="h-14 pl-12 rounded-none border-primary/20 bg-background"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 col-span-1 border-t border-primary/10 pt-6 mt-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Teléfono *</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            <Input 
                                placeholder="+1 (809) 000-0000" 
                                className="h-14 pl-12 rounded-none border-primary/20 bg-background"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 col-span-1 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Correo Electrónico *</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                            <Input 
                                type="email"
                                placeholder="tu@email.com" 
                                className="h-14 pl-12 rounded-none border-primary/20 bg-background"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 col-span-1 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-primary/70">Detalles Adicionales & Precio</Label>
                        <Textarea 
                            placeholder="Mencione área (m2), cantidad de habitaciones y expectativa de precio." 
                            className="min-h-[120px] rounded-none border-primary/20 bg-background p-4"
                            value={formData.features}
                            onChange={(e) => handleInputChange("features", e.target.value)}
                        />
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-16 rounded-none bg-primary text-black font-bold uppercase tracking-[0.3em] hover:bg-primary/90 transition-all text-xs"
                >
                    {isLoading ? "Procesando Solicitud..." : "Proponer Inmueble"}
                </Button>
            </form>
        </Card>
    )
}

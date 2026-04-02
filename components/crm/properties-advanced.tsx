"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { FiSave, FiImage, FiMapPin, FiHome, FiList, FiX, FiPlus } from "react-icons/fi"

interface PropertyFormData {
    // General
    title: string
    price: string
    type: string
    status: string
    description: string
    // Location
    address: string
    city: string
    state: string
    zip: string
    lat: string
    lng: string
    // Features
    bedrooms: string
    bathrooms: string
    area: string
    parking: string
    amenities: string[]
    // Media
    images: string[]
    videoUrl: string
}

const initialFormData: PropertyFormData = {
    title: "",
    price: "",
    type: "",
    status: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    lat: "",
    lng: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    parking: "",
    amenities: [],
    images: [],
    videoUrl: ""
}

const amenitiesList = [
    "Piscina", "Gimnasio", "Seguridad 24/7", "Vista al Mar",
    "Jardín", "Ascensor", "Terraza", "Aire Acondicionado", "Amueblado"
]

export function PropertiesAdvanced() {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const updateField = (field: keyof PropertyFormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }))
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Required field validation
        if (!formData.title.trim()) newErrors.title = "Título es requerido"
        if (!formData.price.trim()) newErrors.price = "Precio es requerido"
        if (!formData.type) newErrors.type = "Tipo es requerido"
        if (!formData.status) newErrors.status = "Estado es requerido"
        if (!formData.address.trim()) newErrors.address = "Dirección es requerida"
        if (!formData.city.trim()) newErrors.city = "Ciudad es requerida"

        // Numeric validation
        if (formData.price && isNaN(Number(formData.price))) {
            newErrors.price = "Precio debe ser un número válido"
        }
        if (formData.bedrooms && isNaN(Number(formData.bedrooms))) {
            newErrors.bedrooms = "Debe ser un número"
        }
        if (formData.bathrooms && isNaN(Number(formData.bathrooms))) {
            newErrors.bathrooms = "Debe ser un número"
        }
        if (formData.area && isNaN(Number(formData.area))) {
            newErrors.area = "Debe ser un número"
        }

        setErrors(newErrors)

        if (Object.keys(newErrors).length > 0) {
            const errorMessages = Object.values(newErrors)
            errorMessages.forEach(err => toast.error(err))
            return false
        }
        return true
    }

    const handleSave = async () => {
        if (!validateForm()) return

        setIsLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        console.log("Saving property:", formData)

        toast.success("Propiedad guardada exitosamente", {
            description: `"${formData.title}" ha sido registrada.`
        })

        setIsLoading(false)
    }

    const handleReset = () => {
        setFormData(initialFormData)
        setErrors({})
        toast.info("Formulario reiniciado")
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión Avanzada de Propiedades</h2>
                    <p className="text-muted-foreground">Agrega o edita propiedades con detalles completos.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        <FiX className="mr-2 h-4 w-4" /> Limpiar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? "Guardando..." : <><FiSave className="mr-2 h-4 w-4" /> Guardar Propiedad</>}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="general"><FiList className="mr-2 h-4 w-4" /> General</TabsTrigger>
                    <TabsTrigger value="location"><FiMapPin className="mr-2 h-4 w-4" /> Ubicación</TabsTrigger>
                    <TabsTrigger value="features"><FiHome className="mr-2 h-4 w-4" /> Detalles</TabsTrigger>
                    <TabsTrigger value="media"><FiImage className="mr-2 h-4 w-4" /> Multimedia</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                                <CardDescription>Datos básicos de la propiedad.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Título de la Propiedad *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Ej: Villa de Lujo en Punta Cana"
                                            value={formData.title}
                                            onChange={(e) => updateField("title", e.target.value)}
                                            className={errors.title ? "border-red-500" : ""}
                                        />
                                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio (USD) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={(e) => updateField("price", e.target.value)}
                                            className={errors.price ? "border-red-500" : ""}
                                        />
                                        {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Tipo de Propiedad *</Label>
                                        <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                                            <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="house">Casa / Villa</SelectItem>
                                                <SelectItem value="apartment">Apartamento</SelectItem>
                                                <SelectItem value="land">Terreno</SelectItem>
                                                <SelectItem value="commercial">Comercial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Estado *</Label>
                                        <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                                            <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sale">En Venta</SelectItem>
                                                <SelectItem value="rent">En Renta</SelectItem>
                                                <SelectItem value="sold">Vendido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descripción detallada de la propiedad..."
                                        className="min-h-[150px]"
                                        value={formData.description}
                                        onChange={(e) => updateField("description", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="location">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ubicación</CardTitle>
                                <CardDescription>Dirección y coordenadas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección Completa *</Label>
                                    <Input
                                        id="address"
                                        placeholder="Calle, Número, Sector"
                                        value={formData.address}
                                        onChange={(e) => updateField("address", e.target.value)}
                                        className={errors.address ? "border-red-500" : ""}
                                    />
                                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad *</Label>
                                        <Input
                                            id="city"
                                            placeholder="Ej: Punta Cana"
                                            value={formData.city}
                                            onChange={(e) => updateField("city", e.target.value)}
                                            className={errors.city ? "border-red-500" : ""}
                                        />
                                        {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">Provincia / Estado</Label>
                                        <Input
                                            id="state"
                                            placeholder="Ej: La Altagracia"
                                            value={formData.state}
                                            onChange={(e) => updateField("state", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zip">Código Postal</Label>
                                        <Input
                                            id="zip"
                                            placeholder="00000"
                                            value={formData.zip}
                                            onChange={(e) => updateField("zip", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lat">Latitud</Label>
                                        <Input
                                            id="lat"
                                            placeholder="18.xxxx"
                                            value={formData.lat}
                                            onChange={(e) => updateField("lat", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lng">Longitud</Label>
                                        <Input
                                            id="lng"
                                            placeholder="-68.xxxx"
                                            value={formData.lng}
                                            onChange={(e) => updateField("lng", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="h-[200px] bg-muted rounded-md flex items-center justify-center text-muted-foreground border-2 border-dashed">
                                    Mapa Interactivo (Integración Google Maps - Mock)
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features">
                        <Card>
                            <CardHeader>
                                <CardTitle>Características y Amenidades</CardTitle>
                                <CardDescription>Detalles específicos de la propiedad.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bedrooms">Habitaciones</Label>
                                        <Input
                                            id="bedrooms"
                                            type="number"
                                            min="0"
                                            value={formData.bedrooms}
                                            onChange={(e) => updateField("bedrooms", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bathrooms">Baños</Label>
                                        <Input
                                            id="bathrooms"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={formData.bathrooms}
                                            onChange={(e) => updateField("bathrooms", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="area">Área (m²)</Label>
                                        <Input
                                            id="area"
                                            type="number"
                                            min="0"
                                            value={formData.area}
                                            onChange={(e) => updateField("area", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parking">Parqueos</Label>
                                        <Input
                                            id="parking"
                                            type="number"
                                            min="0"
                                            value={formData.parking}
                                            onChange={(e) => updateField("parking", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Amenidades ({formData.amenities.length} seleccionadas)</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {amenitiesList.map((item) => (
                                            <div key={item} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={item}
                                                    checked={formData.amenities.includes(item)}
                                                    onCheckedChange={() => toggleAmenity(item)}
                                                />
                                                <Label htmlFor={item} className="font-normal cursor-pointer">{item}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="media">
                        <Card>
                            <CardHeader>
                                <CardTitle>Galería Multimedia</CardTitle>
                                <CardDescription>Fotos y videos de la propiedad.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                                    onClick={() => toast.info("Funcionalidad de carga de imágenes en desarrollo")}
                                >
                                    <FiImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-sm font-medium">Arrastra y suelta imágenes aquí</p>
                                    <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar archivos</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>URL de Video (YouTube/Vimeo)</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={formData.videoUrl}
                                        onChange={(e) => updateField("videoUrl", e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="aspect-square bg-muted rounded-md relative group overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                                Imagen {i}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button variant="destructive" size="sm" onClick={() => toast.info("Imagen eliminada (mock)")}>Eliminar</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

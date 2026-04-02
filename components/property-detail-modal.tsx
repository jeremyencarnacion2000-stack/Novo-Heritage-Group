import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Bed, Bath, Maximize, Calendar as CalendarIcon, Phone, Heart, Share2, User, Calculator, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UpsellRecommendations } from "@/components/upsell-recommendations"

export interface Property {
  id: string
  title: string
  address: string
  location?: string
  status: string
  price: string | number
  bedrooms: number
  bathrooms: number
  sqft: number
  area?: number
  yearBuilt: number
  description: string
  features: string[]
  image?: string
  images?: string[]
  agent: {
    name: string
    phone: string
    avatar?: string
  }
}

interface PropertyDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Property | null
}

export default function PropertyDetailModal({ open, onOpenChange, property }: PropertyDetailModalProps) {
  if (!property) return null

  const { toast } = useToast()
  const [showContact, setShowContact] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [submitting, setSubmitting] = React.useState(false)
  const [date, setDate] = React.useState<Date>()
  const [showSchedule, setShowSchedule] = React.useState(false)
  const [roiData, setRoiData] = React.useState({
    investment: typeof property.price === "number" ? property.price : parseFloat(String(property.price).replace(/[^0-9.]/g, "")) || 250000,
    monthlyRent: 1500,
    appreciation: 5,
    years: 5
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast({ title: "Falta información", description: "Nombre y correo son obligatorios" })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: "bienes_raices",
          propertyId: property.id,
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          source: "property_detail_modal",
        }),
      })
      if (res.ok) {
        toast({ title: "Solicitud enviada", description: "Un asesor te contactará pronto." })
        setShowContact(false)
        setForm({ name: "", email: "", phone: "", message: "" })
      } else {
        toast({ title: "Error al enviar", description: "Intenta nuevamente más tarde." })
      }
    } catch (err) {
      toast({ title: "Error de red", description: "Revisa tu conexión e inténtalo otra vez." })
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor = (property.status?.toLowerCase() || "") === "available" ? "bg-green-600" : "bg-gray-600"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-7xl h-[90vh] p-0 bg-background border-border/50 overflow-hidden">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {property.title}
          </SheetTitle>
          <div className="text-xs text-muted-foreground mt-1">Bienes Raíces · {property.title}</div>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{property.address || property.location}</span>
            <Badge className={`${statusColor} text-white ml-2`}>
              {property.status || "Sin estado"}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} Bathrooms</span>
            </div>
            {(property.sqft ?? property.area) != null && (
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>
                  {(property.sqft ?? property.area)?.toLocaleString()} {property.sqft ? "sq ft" : "m²"}
                </span>
              </div>
            )}
            {property.yearBuilt != null && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Built in {property.yearBuilt}</span>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            {(() => {
              const gallery = property.images ?? (property.image ? [property.image] : [])
              const main = gallery[0] ?? "/placeholder.jpg"
              const thumbs = gallery.slice(1, 5)
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="aspect-video bg-muted rounded-none overflow-hidden shadow-lg group">
                    <img src={main} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {thumbs.length > 0 ? (
                      thumbs.map((src, i) => (
                        <div key={i} className="aspect-video bg-muted rounded-none overflow-hidden shadow-md group">
                          <img src={src} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                      ))
                    ) : (
                      [1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-video bg-muted rounded-none overflow-hidden shadow-md group">
                          <img src="/placeholder.jpg" alt={`Placeholder ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Tabs de información */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="roi">Calculadora ROI</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Property Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description || "Sin descripción disponible para esta propiedad."}
                </p>
              </TabsContent>

              <TabsContent value="features" className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Property Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(property.features ?? []).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-none" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {(property.features ?? []).length === 0 && (
                    <li className="text-sm text-muted-foreground">Sin especificaciones disponibles</li>
                  )}
                </ul>
              </TabsContent>

              <TabsContent value="location" className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                <div className="aspect-video bg-muted rounded-none flex items-center justify-center">
                  <span className="text-muted-foreground">Map View</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {property.address || property.location}
                </p>
              </TabsContent>

              <TabsContent value="roi" className="mt-4">
                <div className="space-y-6 bg-accent/5 p-6 rounded-none border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Calculadora de Retorno de Inversión</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Inversión Total (USD)</Label>
                        <Input
                          type="number"
                          value={roiData.investment}
                          onChange={(e) => setRoiData({ ...roiData, investment: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Renta Mensual Estimada (USD)</Label>
                        <Input
                          type="number"
                          value={roiData.monthlyRent}
                          onChange={(e) => setRoiData({ ...roiData, monthlyRent: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-background rounded-none border border-border/50 shadow-sm">
                      <div className="text-sm text-muted-foreground">Retorno Anual Estimado</div>
                      <div className="text-3xl font-bold text-primary">
                        {((roiData.monthlyRent * 12 / roiData.investment) * 100).toFixed(2)}%
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Ingreso Anual:</span>
                          <span className="font-semibold">${(roiData.monthlyRent * 12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Plusvalía Est. (5%):</span>
                          <span className="font-semibold">${(roiData.investment * 0.05).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground italic">
                    * Estos cálculos son estimaciones basadas en los valores proporcionados y no garantizan rendimientos futuros.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-8 border-t border-border/50">
              <UpsellRecommendations />
            </div>
          </div>

          {/* Sidebar derecho */}
          <div className="space-y-6">
            {/* Precio y acciones */}
            <Card className="p-6">
              <div className="text-3xl font-bold text-foreground mb-4">
                {typeof property.price === "number" ? `$${property.price.toLocaleString()}` : property.price}
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90" onClick={() => setShowContact((v) => !v)}>
                  {showContact ? "Cerrar Formulario" : "Solicitar información"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/5"
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {showSchedule ? "Cerrar Agenda" : "Programar Visita"}
                </Button>

                {showSchedule && (
                  <div className="p-4 bg-accent/5 rounded-none border border-border/50 space-y-4">
                    <Label>Selecciona una fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      className="w-full bg-primary"
                      disabled={!date}
                      onClick={() => {
                        toast({ title: "Visita programada", description: `Te esperamos el ${format(date!, "PPP")}` })
                        setShowSchedule(false)
                      }}
                    >
                      Confirmar Fecha
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {showContact && (
                  <form className="space-y-3 pt-3 border-t" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email">Correo</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 809..." />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Cuéntanos qué te interesa" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Enviando..." : "Enviar solicitud"}
                    </Button>
                  </form>
                )}
              </div>
            </Card>

            {/* Tarjeta del agente */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Listing Agent</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-none bg-muted flex items-center justify-center">
                  {property.agent?.avatar ? (
                    <img src={property.agent?.avatar} alt={property.agent?.name || "Agente Novo Heritage"} className="w-full h-full rounded-none object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{property.agent?.name || "Agente Novo Heritage"}</p>
                  <p className="text-sm text-muted-foreground">Listing Agent</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{property.agent?.phone || "N/D"}</span>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <Phone className="h-4 w-4 mr-2" />
                Call Agent
              </Button>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

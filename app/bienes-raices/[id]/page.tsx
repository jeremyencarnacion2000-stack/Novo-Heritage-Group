import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Bed, Bath, Maximize, Calendar } from "lucide-react"
import { headers } from "next/headers"
import { PropertyContactForm } from "@/components/property-contact-form"

async function getProperty(id: string) {
  const hdrs = headers()
  const host = hdrs.get('host')
  const proto = hdrs.get('x-forwarded-proto') ?? 'http'
  const base = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')
  const res = await fetch(`${base}/api/properties/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Property not found")
  return res.json()
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'N/D'
  return `$${value.toLocaleString()}`
}

function RoiBlock({
  price,
  metrics,
  roi,
}: {
  price?: number
  metrics?: {
    estimatedRentMonthly?: number
    hoaFeeMonthly?: number
    taxesAnnual?: number
    maintenanceAnnual?: number
    occupancyRate?: number
  }
  roi?: number
}) {
  const p = price ?? 0
  const rentMonthly = metrics?.estimatedRentMonthly
  const hoaMonthly = metrics?.hoaFeeMonthly
  const taxesAnnual = metrics?.taxesAnnual
  const maintenanceAnnual = metrics?.maintenanceAnnual
  const occupancyRate = metrics?.occupancyRate
  const closingCosts = p * 0.03

  const annualRentGross = rentMonthly && occupancyRate ? rentMonthly * 12 * occupancyRate : (rentMonthly ? rentMonthly * 12 : p * 0.06)
  const annualHOA = hoaMonthly ? hoaMonthly * 12 : 0
  const annualMaint = typeof maintenanceAnnual === 'number' ? maintenanceAnnual : p * 0.01
  const annualTaxes = taxesAnnual ?? 0
  const netAnnual = annualRentGross - annualHOA - annualMaint - annualTaxes
  const roiCalc = typeof roi === 'number' ? roi : (p > 0 ? (netAnnual / (p + closingCosts)) * 100 : 0)
  return (
    <Card className="p-6 space-y-2">
      <h3 className="text-lg font-semibold">ROI estimado</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Precio</p>
          <p className="font-medium">{formatCurrency(p)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Renta mensual</p>
          <p className="font-medium">{formatCurrency(Math.round((rentMonthly ?? annualRentGross / 12) || 0))}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Renta anual</p>
          <p className="font-medium">{formatCurrency(Math.round(annualRentGross))}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Mantenimiento anual</p>
          <p className="font-medium">{formatCurrency(Math.round(annualMaint))}</p>
        </div>
        {hoaMonthly && (
          <div>
            <p className="text-muted-foreground">HOA anual</p>
            <p className="font-medium">{formatCurrency(Math.round(annualHOA))}</p>
          </div>
        )}
        {typeof taxesAnnual === 'number' && (
          <div>
            <p className="text-muted-foreground">Impuestos anuales</p>
            <p className="font-medium">{formatCurrency(Math.round(annualTaxes))}</p>
          </div>
        )}
      </div>
      <div className="pt-2 border-t">
        <p className="text-sm">ROI neto aprox: <span className="font-semibold">{roiCalc.toFixed(1)}%</span></p>
        <p className="text-xs text-muted-foreground mt-1">Cálculo orientativo. Variará según mercado, ocupación y costos reales.</p>
      </div>
    </Card>
  )
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)

  const gallery: string[] = property.images ?? (property.image ? [property.image] : [])
  const main = gallery[0] ?? "/placeholder.jpg"
  const thumbs = gallery.slice(1, 5)

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm text-white/60 mb-3">
          <a href="/" className="hover:text-white">Inicio</a>
          <span className="mx-2">/</span>
          <a href="/bienes-raices" className="hover:text-white">Bienes Raíces</a>
          <span className="mx-2">/</span>
          <span>{property.title}</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold text-white">{property.title}</h1>
          <Badge className="bg-primary text-primary-foreground">{property.status ?? 'Sin estado'}</Badge>
        </div>
        <div className="flex items-center gap-2 text-white/70 mb-6">
          <MapPin className="w-4 h-4" />
          <span>{property.address || property.location}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 aspect-video bg-muted rounded-lg overflow-hidden">
                <img src={main} alt={property.title} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {thumbs.length > 0 ? (
                  thumbs.map((src: string, i: number) => (
                    <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img src={src} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img src="/placeholder.jpg" alt={`Placeholder ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-2"><Bed className="w-4 h-4" /><span>{property.bedrooms}</span></div>
              <div className="flex items-center gap-2"><Bath className="w-4 h-4" /><span>{property.bathrooms}</span></div>
              {(property.area ?? property.sqft) && (
                <div className="flex items-center gap-2"><Maximize className="w-4 h-4" /><span>{(property.area ?? property.sqft)}{property.sqft ? ' sq ft' : ' m²'}</span></div>
              )}
              {property.yearBuilt && (
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{property.yearBuilt}</span></div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="features">Características</TabsTrigger>
                <TabsTrigger value="location">Ubicación</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <p className="text-white/80 leading-relaxed">{property.description || 'Sin descripción disponible.'}</p>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(property.features ?? []).map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-white/80">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                  {(property.features ?? []).length === 0 && (
                    <li className="text-sm text-white/60">Sin especificaciones disponibles</li>
                  )}
                </ul>
              </TabsContent>
              <TabsContent value="location" className="mt-4">
                <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center text-white/60">Mapa</div>
                <p className="text-sm text-white/60 mt-2">{property.address || property.location}</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {formatCurrency(property.price)}
              </div>
              <div className="mt-4">
                <PropertyContactForm propertyId={property.id} />
              </div>
            </Card>

            <RoiBlock price={property.price} metrics={property.metrics} roi={property.roi} />
          </div>
        </div>
      </div>
    </div>
  )
}

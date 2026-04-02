"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookingForms } from "@/components/booking-forms"
import { TrivagoSearch } from "@/components/trivago-search"
// @ts-ignore
import { MapPin, Clock, Users, Star, ArrowLeft, Check, Calendar, Shield, Coffee, Wifi, Car, Plane } from "lucide-react"

interface TourismPackage {
    id: string
    title: string
    destination: string
    price: number
    image: string
    duration: string
    travelers: string
    rating: number
    reviews: number
    description: string
    included: string[]
    itinerary: { day: number; title: string; desc: string }[]
    gallery: string[]
}

export function TurismoDetailPage({ id }: { id: string }) {
    const [pkg, setPkg] = useState<TourismPackage | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)

        // Mock data fetch
        const mockPackages: Record<string, TourismPackage> = {
            "1": {
                id: "1",
                title: "Punta Cana: Lujo Todo Incluido",
                destination: "Punta Cana, RD",
                price: 2500,
                image: "/luxury-travel-destination-beach-resort.jpg",
                duration: "7 Días",
                travelers: "2 Personas",
                rating: 4.9,
                reviews: 1240,
                description: "Disfruta de las mejores playas del Caribe en un resort de clase mundial. Todo incluido, desde cenas gourmet hasta deportes acuáticos y entretenimiento nocturno.",
                included: ["Vuelos internacionales", "Traslados privados", "Resort 5 estrellas", "Todo incluido", "Seguro de viaje"],
                itinerary: [
                    { day: 1, title: "Llegada al Paraíso", desc: "Bienvenida VIP y traslado a tu resort." },
                    { day: 2, title: "Día de Playa", desc: "Relájate en las arenas blancas de Bávaro." },
                    { day: 3, title: "Isla Saona", desc: "Excursión de día completo a la paradisíaca Isla Saona." }
                ],
                gallery: ["/luxury-travel-destination-beach-resort.jpg", "/luxury_modern_villa_renaissance.png", "/premium-luxury-villa-real-estate-hero.png"]
            },
            "2": {
                id: "2",
                title: "Samaná: Naturaleza y Relax",
                destination: "Samaná, RD",
                price: 1800,
                image: "/premium-luxury-villa-real-estate-hero.png",
                duration: "5 Días",
                travelers: "2-4 Personas",
                rating: 4.8,
                reviews: 890,
                description: "Descubre la belleza virgen de Samaná. Avistamiento de ballenas (en temporada), cascadas impresionantes y playas escondidas.",
                included: ["Vuelos internos", "Guía local experto", "Eco-Lodge de lujo", "Desayunos y cenas", "Excursiones incluidas"],
                itinerary: [
                    { day: 1, title: "Hacia el Nordeste", desc: "Traslado escénico hacia la península de Samaná." },
                    { day: 2, title: "Salto del Limón", desc: "Caminata o cabalgata hacia la famosa cascada." }
                ],
                gallery: ["/premium-luxury-villa-real-estate-hero.png", "/luxury_modern_villa_renaissance.png", "/luxury-travel-destination-beach-resort.jpg"]
            }
        }

        setPkg(mockPackages[id] || mockPackages["1"])

        return () => window.removeEventListener("scroll", handleScroll)
    }, [id])

    if (!pkg) return null

    return (
        <div className="min-h-screen bg-background">
            <Header isScrolled={isScrolled} />
            <MobileHeader isMobileMenuOpen={false} setIsMobileMenuOpen={() => { }} handleMobileNavClick={() => { }} />

            <main className="pt-24 pb-32">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb & Back */}
                    <Link href="/turismo" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Destinos
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Gallery Section */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative aspect-[4/3] rounded-none overflow-hidden shadow-2xl"
                            >
                                <Image
                                    src={pkg.gallery[activeImage]}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover transition-all duration-700"
                                />
                            </motion.div>
                            <div className="grid grid-cols-3 gap-4">
                                {pkg.gallery.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`relative aspect-square rounded-none overflow-hidden border-2 transition-all ${activeImage === idx ? "border-primary scale-95" : "border-transparent opacity-60 hover:opacity-100"}`}
                                    >
                                        <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex flex-col">
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1 rounded-none uppercase tracking-widest text-[10px] font-bold">
                                        {pkg.destination}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-bold">{pkg.rating}</span>
                                        <span className="text-xs text-muted-foreground">({pkg.reviews} reseñas)</span>
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-medium text-premium-serif text-foreground mb-6 leading-tight">
                                    {pkg.title}
                                </h1>
                                <div className="flex flex-wrap gap-6 text-muted-foreground mb-8">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{pkg.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <span className="text-sm">{pkg.travelers}</span>
                                    </div>
                                </div>
                                <p className="text-lg text-muted-foreground leading-relaxed font-light mb-8">
                                    {pkg.description}
                                </p>
                            </div>

                            <Card className="bg-accent/5 border-border/50 rounded-none p-8 mb-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold block mb-1">Precio por persona</span>
                                        <span className="text-4xl font-light text-foreground">${pkg.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="lg" className="h-14 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-bold transition-all active:scale-95">
                                                    Reservar Ahora
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl bg-background rounded-none p-8 shadow-2xl border border-border/50">
                                                <DialogTitle className="sr-only">Reservar Viaje</DialogTitle>
                                                <DialogDescription className="sr-only">Formulario de reservación rápida para destinos exclusivos.</DialogDescription>
                                                <BookingForms type="trip" />
                                            </DialogContent>
                                        </Dialog>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="h-14 px-10 border-border text-foreground hover:bg-foreground/5 rounded-none font-bold transition-all active:scale-95 group"
                                            onClick={() => {
                                                const baseUrl = "https://www.trivago.com.do/es/srl"
                                                const params = new URLSearchParams({ search_query: pkg.destination })
                                                window.open(`${baseUrl}?${params.toString()}`, "_blank")
                                            }}
                                        >
                                            Ver en Trivago
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Shield className="w-4 h-4 text-primary" />
                                        Cancelación gratuita
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Fechas flexibles
                                    </div>
                                </div>
                            </Card>

                            <Tabs defaultValue="included" className="w-full">
                                <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-8">
                                    <TabsTrigger value="included" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 text-sm font-medium transition-all">
                                        Qué incluye
                                    </TabsTrigger>
                                    <TabsTrigger value="itinerary" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4 text-sm font-medium transition-all">
                                        Itinerario
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="included" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pkg.included.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-muted-foreground">
                                                <div className="w-5 h-5 rounded-none bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </div>
                                                <span className="text-sm">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="itinerary" className="space-y-8">
                                    {pkg.itinerary.map((step) => (
                                        <div key={step.day} className="flex gap-6">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-none bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                                    {step.day}
                                                </div>
                                                {step.day !== pkg.itinerary.length && <div className="w-px h-full bg-border my-2" />}
                                            </div>
                                            <div className="pb-8">
                                                <h4 className="text-xl font-medium text-foreground mb-2">{step.title}</h4>
                                                <p className="text-muted-foreground font-light leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

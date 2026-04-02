"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Maximize, Car, Zap, Share2, Heart, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function PropertyDetailPage() {
    const params = useParams()
    const [property, setProperty] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeImage, setActiveImage] = useState(0)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)

        if (params.id) {
            fetch(`/api/properties`)
                .then(res => res.json())
                .then(data => {
                    const found = data.find((p: any) => p.id === params.id)
                    setProperty(found)
                    setLoading(false)
                })
        }

        return () => window.removeEventListener("scroll", handleScroll)
    }, [params.id])

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin" /></div>
    if (!property) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-light tracking-wide">Propiedad no encontrada</div>

    const images = property.images || [property.image || "/placeholder.jpg"]

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
            <Header isScrolled={isScrolled} />

            <main className="pt-32 pb-24">
                <div className="container max-w-7xl mx-auto px-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-foreground/40 mb-12">
                        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
                        <span>/</span>
                        <Link href="/bienes-raices" className="hover:text-primary transition-colors">Bienes Raíces</Link>
                        <span>/</span>
                        <Link href="/bienes-raices/coleccion" className="hover:text-primary transition-colors">Colección</Link>
                        <span>/</span>
                        <span className="text-foreground">{property.title}</span>
                    </nav>

                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Gallery Section */}
                        <div className="space-y-6">
                            <div className="relative aspect-[4/3] rounded-none overflow-hidden bg-primary/5 border border-primary/10 group">
                                <Image
                                    src={images[activeImage]}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-none bg-background/80 backdrop-blur-md border-primary/20 hover:bg-primary hover:text-black transition-colors"
                                        onClick={() => setActiveImage(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="rounded-none bg-background/80 backdrop-blur-md border-primary/20 hover:bg-primary hover:text-black transition-colors"
                                        onClick={() => setActiveImage(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`relative aspect-square rounded-none overflow-hidden cursor-pointer border transition-all ${activeImage === idx ? "border-primary" : "border-primary/20 opacity-60 hover:opacity-100"}`}
                                        onClick={() => setActiveImage(idx)}
                                    >
                                        <Image src={img} alt={`${property.title} ${idx}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-none text-[10px] uppercase tracking-widest px-3 py-1">
                                        {property.type}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="rounded-none border-primary/20 bg-transparent hover:bg-primary/5 hover:text-primary">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="rounded-none border-primary/20 bg-transparent hover:bg-primary/5 hover:text-primary">
                                            <Heart className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-light font-serif mb-4 leading-tight">{property.title}</h1>
                                <div className="flex items-center gap-2 text-foreground/60 font-light tracking-wide">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{property.location}</span>
                                </div>
                            </div>

                            <div className="text-4xl font-light tracking-wide">
                                ${property.price.toLocaleString()}
                            </div>

                            <div className="h-px bg-primary/20 w-full" />

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Superficie</span>
                                    <div className="flex items-center gap-2">
                                        <Maximize className="w-4 h-4 text-primary" />
                                        <span className="font-light">{property.area} m²</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Referencia</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-light">{property.reference || "N/D"}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Dormitorios</span>
                                    <div className="flex items-center gap-2">
                                        <Bed className="w-4 h-4 text-primary" />
                                        <span className="font-light">{property.bedrooms}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Baños</span>
                                    <div className="flex items-center gap-2">
                                        <Bath className="w-4 h-4 text-primary" />
                                        <span className="font-light">{property.bathrooms}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Garaje</span>
                                    <div className="flex items-center gap-2">
                                        <Car className="w-4 h-4 text-primary" />
                                        <span className="font-light">{property.garage || 0}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">PEB</span>
                                    <div className="flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-none font-bold tracking-widest px-2">{property.peb || "B"}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-primary/20 w-full" />

                            <div className="space-y-4">
                                <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-foreground/80">Descripción</h3>
                                <p className="text-foreground/60 font-light leading-relaxed">
                                    {property.description || "Esta propiedad exclusiva ofrece un diseño contemporáneo con acabados de la más alta calidad. Ubicada en una de las zonas más privilegiadas, garantiza privacidad, seguridad y un estilo de vida inigualable."}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button className="flex-1 h-14 bg-primary text-black hover:scale-[1.02] shadow-premium transition-all rounded-none font-bold text-[10px] tracking-[0.3em] uppercase">
                                    Contactar Agente
                                </Button>
                                <Button variant="outline" className="flex-1 h-14 border border-primary/20 bg-transparent hover:bg-primary/5 rounded-none font-bold text-[10px] tracking-[0.3em] uppercase transition-all">
                                    Agendar Visita
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

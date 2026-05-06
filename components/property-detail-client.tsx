"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Maximize, Car, Zap, Share2, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RealEstateQuoteForm } from "@/components/forms/real-estate-quote-form"

interface PropertyDetailClientProps {
    propertyId: string
    initialProperty?: any
}

export function PropertyDetailClient({ propertyId, initialProperty }: PropertyDetailClientProps) {
    const { toast } = useToast()
    const [property, setProperty] = useState<any>(initialProperty || null)
    const [loading, setLoading] = useState(!initialProperty)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeImage, setActiveImage] = useState(0)
    const [isLiked, setIsLiked] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)

        if (propertyId && !initialProperty) {
            fetch(`/api/properties`)
                .then(res => res.json())
                .then(data => {
                    const found = data.find((p: any) => p.id === propertyId)
                    setProperty(found)
                    setLoading(false)
                    
                    const favs = JSON.parse(localStorage.getItem('novo_favorites') || '[]')
                    if(found && favs.includes(found.id)) {
                        setIsLiked(true)
                    }
                })
                .catch(() => setLoading(false))
        } else if (initialProperty) {
            const favs = JSON.parse(localStorage.getItem('novo_favorites') || '[]')
            if(initialProperty && favs.includes(initialProperty.id)) {
                setIsLiked(true)
            }
        }

        return () => window.removeEventListener("scroll", handleScroll)
    }, [propertyId, initialProperty])

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-none animate-spin" /></div>
    if (!property) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-light tracking-wide">Propiedad no encontrada</div>

    const images = property.images || [property.image || "/placeholder.jpg"]
    
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Novo Heritage - ${property.title}`,
                    text: property.description || `Mira esta propiedad premium: ${property.title}`,
                    url: window.location.href,
                })
            } else {
                await navigator.clipboard.writeText(window.location.href)
                toast({ title: "Enlace copiado", description: "El enlace se ha copiado al portapapeles." })
            }
        } catch (e) {}
    }

    const toggleLike = () => {
        if (!property) return
        const favs = JSON.parse(localStorage.getItem('novo_favorites') || '[]')
        if (isLiked) {
            const nextFavs = favs.filter((id: string) => id !== property.id)
            localStorage.setItem('novo_favorites', JSON.stringify(nextFavs))
            setIsLiked(false)
            toast({ title: "Removido", description: "Propiedad removida de tus favoritos." })
        } else {
            favs.push(property.id)
            localStorage.setItem('novo_favorites', JSON.stringify(favs))
            setIsLiked(true)
            toast({ title: "Guardado", description: "Propiedad guardada en favoritos." })
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
            <Header isScrolled={isScrolled} />

            <main className="pt-32 pb-24">
                <div className="container max-w-7xl mx-auto px-4">
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
                        <div className="space-y-6">
                            <div className="relative aspect-[4/3] rounded-none overflow-hidden bg-primary/5 border border-primary/10 group">
                                <Image
                                    src={images[activeImage]}
                                    alt={property.title}
                                    fill
                                    priority
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

                        <div className="space-y-10">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-none text-[10px] uppercase tracking-widest px-3 py-1">
                                        {property.type}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="rounded-none border-primary/20 bg-transparent hover:bg-primary/5 hover:text-primary transition-colors" onClick={handleShare}>
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className={cn("rounded-none border-primary/20 bg-transparent transition-colors", isLiked ? "text-primary border-primary bg-primary/10" : "hover:bg-primary/5 hover:text-primary")} onClick={toggleLike}>
                                            <Heart className={cn("w-4 h-4", isLiked ? "fill-primary" : "")} />
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
                                ${property.price.toLocaleString('en-US')}
                            </div>

                            <div className="h-px bg-primary/20 w-full" />

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
                                <p className="text-foreground/60 font-light leading-relaxed whitespace-pre-wrap">
                                    {property.description}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <Button 
                                    onClick={() => window.open(`https://wa.me/18492200224?text=Hola,%20estoy%20interesado%20en%20recibir%20m%C3%A1s%20detalles%20sobre%20la%20propiedad%20${encodeURIComponent(property.title)}%20(${property.reference || property.id}).`, '_blank')}
                                    className="flex-1 h-14 bg-primary text-black hover:scale-[1.02] shadow-premium transition-all rounded-none font-bold text-[10px] tracking-[0.3em] uppercase"
                                >
                                    Contactar Agente
                                </Button>
                                
                                <Dialog modal={true}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="flex-1 h-14 border border-primary/20 bg-transparent hover:bg-primary/5 rounded-none font-bold text-[10px] tracking-[0.3em] uppercase transition-all">
                                            Agendar Visita
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[92vh] z-[99999] outline-none">
                                        <DialogTitle className="sr-only">Agendar Visita Fìsica</DialogTitle>
                                        <DialogDescription className="sr-only">Formulario para agendar visita a la propiedad</DialogDescription>
                                        <div className="bg-background rounded-none p-10 md:p-20 shadow-2xl border border-primary/20 relative">
                                            <RealEstateQuoteForm defaultType="inversion" />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

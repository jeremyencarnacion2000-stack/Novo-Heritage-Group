"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Bed, Bath, Maximize, Heart, ArrowRight, Car, Zap } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Link from "next/link"

export default function ColeccionPage() {
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isScrolled, setIsScrolled] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
    const [searchQuery, setSearchQuery] = useState("")
    const [transactionType, setTransactionType] = useState("all")
    const [currency, setCurrency] = useState("US")
    const [propertyType, setPropertyType] = useState("all")
    const [city, setCity] = useState("all")
    const [sector, setSector] = useState("all")
    const [bedrooms, setBedrooms] = useState("any")
    const [bathrooms, setBathrooms] = useState("any")
    const [parking, setParking] = useState("any")
    const [propertyCode, setPropertyCode] = useState("")
    const [amenities, setAmenities] = useState<string[]>([])

    const propertiesPerPage = 6

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50)
        window.addEventListener("scroll", handleScroll)

        fetch("/api/properties")
            .then(res => res.json())
            .then(data => {
                setProperties(data)
                setLoading(false)
            })

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const filteredProperties = properties.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
        const matchesType = propertyType === "all" || p.type?.toLowerCase() === propertyType.toLowerCase()
        const matchesTransaction = transactionType === "all" || p.transactionType === transactionType
        const matchesCity = city === "all" || p.city?.toLowerCase().includes(city.toLowerCase())
        const matchesSector = sector === "all" || p.sector?.toLowerCase().includes(sector.toLowerCase())
        const matchesBedrooms = bedrooms === "any" || p.bedrooms >= parseInt(bedrooms)
        const matchesBathrooms = bathrooms === "any" || p.bathrooms >= parseInt(bathrooms)
        const matchesParking = parking === "any" || (p.parking && p.parking >= parseInt(parking))
        const matchesCode = propertyCode === "" || p.id.toLowerCase().includes(propertyCode.toLowerCase())
        const matchesAmenities = amenities.length === 0 || amenities.every(a => p.amenities?.some((feat: string) => feat.toLowerCase().includes(a.toLowerCase())))

        return matchesSearch && matchesPrice && matchesType && matchesTransaction &&
            matchesCity && matchesSector && matchesBedrooms && matchesBathrooms &&
            matchesParking && matchesCode && matchesAmenities
    })

    const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)
    const indexOfLastProperty = currentPage * propertiesPerPage
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
    const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header isScrolled={isScrolled} />

            <main className="pt-32 pb-24 px-4">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Sidebar Filters */}
                        <aside className="w-full md:w-80 space-y-8 bg-card p-6 rounded-2xl border border-border h-fit">
                            {/* Venta/Alquiler Toggle */}
                            <div className="flex p-1 bg-foreground/5 rounded-lg">
                                <button
                                    onClick={() => setTransactionType("venta")}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${transactionType === "venta" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Venta
                                </button>
                                <button
                                    onClick={() => setTransactionType("alquiler")}
                                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${transactionType === "alquiler" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Alquiler
                                </button>
                            </div>

                            {/* Dropdowns */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tipo de Inmueble:</label>
                                    <Select value={propertyType} onValueChange={setPropertyType}>
                                        <SelectTrigger className="h-12 bg-foreground/5 border-border rounded-xl">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="casa">Casas</SelectItem>
                                            <SelectItem value="apartamento">Apartamentos</SelectItem>
                                            <SelectItem value="villa">Villas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Ciudad:</label>
                                    <Select value={city} onValueChange={setCity}>
                                        <SelectTrigger className="h-12 bg-foreground/5 border-border rounded-xl">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="santo domingo">Santo Domingo</SelectItem>
                                            <SelectItem value="punta cana">Punta Cana</SelectItem>
                                            <SelectItem value="la romana">La Romana</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sector:</label>
                                    <Select value={sector} onValueChange={setSector}>
                                        <SelectTrigger className="h-12 bg-foreground/5 border-border rounded-xl">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="piantini">Piantini</SelectItem>
                                            <SelectItem value="naco">Naco</SelectItem>
                                            <SelectItem value="bella vista">Bella Vista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Price Range & Currency */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Rango de precio:</label>
                                    <div className="flex bg-foreground/5 p-0.5 rounded-md">
                                        <button
                                            onClick={() => setCurrency("RD")}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all ${currency === "RD" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                                        >
                                            RD
                                        </button>
                                        <button
                                            onClick={() => setCurrency("US")}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all ${currency === "US" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                                        >
                                            US
                                        </button>
                                    </div>
                                </div>
                                <Slider
                                    defaultValue={[0, 10000000]}
                                    max={10000000}
                                    step={100000}
                                    onValueChange={(val) => setPriceRange(val as [number, number])}
                                    className="py-4"
                                />
                                <div className="text-center text-sm font-medium">
                                    {currency}$ {priceRange[0].toLocaleString()} hasta {currency}$ {priceRange[1].toLocaleString()} +
                                </div>
                            </div>

                            {/* Button Groups */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Habitaciones:</label>
                                    <ToggleGroup type="single" value={bedrooms} onValueChange={(v) => v && setBedrooms(v)} className="justify-between">
                                        {["1", "2", "3", "4", "5"].map(n => (
                                            <ToggleGroupItem key={n} value={n} className="flex-1 h-10 border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                                {n}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Baños:</label>
                                    <ToggleGroup type="single" value={bathrooms} onValueChange={(v) => v && setBathrooms(v)} className="justify-between">
                                        {["1", "2", "3", "4", "5"].map(n => (
                                            <ToggleGroupItem key={n} value={n} className="flex-1 h-10 border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                                {n}+
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Parqueos:</label>
                                    <ToggleGroup type="single" value={parking} onValueChange={(v) => v && setParking(v)} className="justify-between">
                                        {["1", "2", "3", "4", "5"].map(n => (
                                            <ToggleGroupItem key={n} value={n} className="flex-1 h-10 border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                                                {n}+
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>
                            </div>

                            {/* Quick Search by Code */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Búsqueda rápida:</label>
                                <Input
                                    placeholder="Buscar por código..."
                                    className="h-12 bg-foreground/5 border-border rounded-xl"
                                    value={propertyCode}
                                    onChange={(e) => setPropertyCode(e.target.value)}
                                />
                            </div>

                            {/* Advanced Search Checkboxes */}
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Búsqueda Avanzada:</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: "piscina", label: "Piscina" },
                                        { id: "terraza-comun", label: "Terraza Común" },
                                        { id: "terraza-exclusiva", label: "Terraza Exclusiva" },
                                        { id: "gimnasio", label: "Gimnasio" },
                                        { id: "linea-blanca", label: "Línea Blanca" },
                                        { id: "virtual-tour", label: "Virtual Tour" },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={item.id}
                                                checked={amenities.includes(item.id)}
                                                onCheckedChange={() => toggleAmenity(item.id)}
                                            />
                                            <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {item.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setSearchQuery("")
                                    setPriceRange([0, 10000000])
                                    setPropertyType("all")
                                    setCity("all")
                                    setSector("all")
                                    setBedrooms("any")
                                    setBathrooms("any")
                                    setParking("any")
                                    setPropertyCode("")
                                    setAmenities([])
                                }}
                                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold uppercase tracking-widest text-xs"
                            >
                                Limpiar Filtros
                            </Button>
                        </aside>

                        {/* Property Grid */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-12">
                                <h1 className="text-4xl font-medium text-premium-serif">Colección Completa</h1>
                                <p className="text-muted-foreground text-sm">{filteredProperties.length} propiedades encontradas</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        Array(4).fill(0).map((_, i) => (
                                            <div key={i} className="aspect-[4/5] bg-foreground/5 rounded-[32px] animate-pulse" />
                                        ))
                                    ) : (
                                        currentProperties.map((property, idx) => (
                                            <motion.div
                                                key={property.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                            >
                                                <Link href={`/bienes-raices/propiedad/${property.id}`}>
                                                    <div className="group relative aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer">
                                                        <Image
                                                            src={property.image || "/placeholder.jpg"}
                                                            alt={property.title}
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                                        <div className="absolute top-6 right-6">
                                                            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                                                                <Heart className="w-4 h-4 text-white" />
                                                            </button>
                                                        </div>

                                                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                                                            <Badge className="w-fit mb-3 bg-white/10 backdrop-blur-md border-white/20 text-white text-[10px] uppercase tracking-widest">
                                                                {property.type}
                                                            </Badge>
                                                            <h3 className="text-2xl font-medium text-white mb-2">{property.title}</h3>
                                                            <p className="text-white/70 text-sm mb-4">{property.location}</p>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xl font-light text-white">${property.price.toLocaleString()}</span>
                                                                <ArrowRight className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex justify-center items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="rounded-full border-border"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-full ${currentPage === page ? "bg-foreground text-background" : "border-border"}`}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="rounded-full border-border"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

"use client"

import React, { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Bed, Bath, Maximize } from "lucide-react"
import Link from "next/link"

interface Property {
    id: string
    title: string
    location: string
    price: number
    image: string
    bedrooms: number
    bathrooms: number
    area: number
    subtitle?: string
    transactionType?: string
}

interface PropertyCarouselProps {
    properties: Property[]
}

export function PropertyCarousel({ properties }: PropertyCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
        skipSnaps: false,
        dragFree: true,
    })

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <div className="relative group">
            <div className="overflow-hidden rounded-none" ref={emblaRef}>
                <div className="flex -ml-6">
                    {properties.map((property) => (
                        <div key={property.id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-6 min-w-0">
                            <Link href={`/bienes-raices/propiedad/${property.id}`}>
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="relative aspect-[4/5] rounded-none overflow-hidden group/card cursor-pointer"
                                >
                                    <Image
                                        src={property.image || "/placeholder.jpg"}
                                        alt={property.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-500" />

                                    <div className="absolute top-6 left-6 z-10">
                                        <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white text-[10px] uppercase tracking-widest px-3 py-1">
                                            {property.subtitle || "Premium"}
                                        </Badge>
                                    </div>

                                    <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                                        <h3 className="text-2xl font-medium text-white mb-2">{property.title}</h3>
                                        <p className="text-white/70 text-sm mb-4">{property.location}</p>

                                        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/40 font-bold mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Bed className="w-3 h-3" />
                                                <span>{property.bedrooms} Dorm</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Bath className="w-3 h-3" />
                                                <span>{property.bathrooms} Baños</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Maximize className="w-3 h-3" />
                                                <span>{property.area} m²</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-light text-white">${property.price.toLocaleString('en-US')}</span>
                                                {property.transactionType && (
                                                    <span className="text-xs text-white/70">{property.transactionType}</span>
                                                )}
                                            </div>
                                            <div className="w-10 h-10 rounded-none bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 transform translate-x-4 group-hover/card:translate-x-0">
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute -top-16 right-0 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollPrev}
                    className="w-12 h-12 rounded-none border-border bg-background/50 backdrop-blur-md hover:bg-primary hover:text-primary-foreground transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={scrollNext}
                    className="w-12 h-12 rounded-none border-border bg-background/50 backdrop-blur-md hover:bg-primary hover:text-primary-foreground transition-all"
                >
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}

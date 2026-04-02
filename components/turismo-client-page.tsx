"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
// @ts-ignore - lucide-react types
import { Users, Clock, Star, MapPin, Heart, Search, Calendar, SlidersHorizontal, ArrowRight, CheckCircle2, Plane, Shield } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import { Footer } from "@/components/footer"
import Chatbot from "@/components/chatbot"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TravelQuoteForm } from "@/components/forms/travel-quote-form"
import { TrivagoSearch } from "@/components/trivago-search"
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PremiumHeading, PremiumText } from "@/components/premium-typography"

export default function TurismoClientPage() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [destination, setDestination] = useState<string>("")
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [origin, setOrigin] = useState<string>("Santo Domingo")
  const [guests, setGuests] = useState<string>("2")
  const [travelClass, setTravelClass] = useState<string>("economy")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})
  const [hotels, setHotels] = useState<any[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)

  // Advanced Filters State
  const [hotelStars, setHotelStars] = useState<number[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [guestRating, setGuestRating] = useState<number>(0)

  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 1000], [0, 300])

  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    
    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchHotels = async () => {
    setIsLoadingHotels(true)
    try {
      const params = new URLSearchParams()
      if (destination) params.append('destination', destination)
      params.append('minPrice', priceRange[0].toString())
      params.append('maxPrice', priceRange[1].toString())
      if (guestRating > 0) params.append('rating', guestRating.toString())
      if (hotelStars.length > 0) params.append('stars', hotelStars.join(','))
      const response = await fetch(`/api/turismo/hotels?${params.toString()}`)
      const data = await response.json()
      setHotels(data)
    } catch (error) {
      console.error("Error fetching hotels:", error)
    } finally {
      setIsLoadingHotels(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [destination, priceRange, hotelStars, guestRating])

  const packages = [
    {
      id: "pkg-punta-cana",
      title: "Punta Cana: Lujo Todo Incluido",
      destination: "Punta Cana, RD",
      duration: "7 días",
      price: 2500,
      rating: 4.9,
      reviews: 1240,
      travelers: "2 personas",
      includes: ["Resort 5★", "Vuelos incluidos", "Todo incluido", "Traslados VIP"],
      image: "/luxury-travel-destination-beach-resort.jpg",
      featured: true,
      type: "travel" as const,
    },
    {
      id: "pkg-samana",
      title: "Samaná: Naturaleza y Relax",
      destination: "Samaná, RD",
      duration: "5 días",
      price: 1800,
      rating: 4.8,
      reviews: 890,
      travelers: "2-4 personas",
      includes: ["Eco-Lodge de lujo", "Desayunos y cenas", "Excursiones", "Guía local"],
      image: "/premium-luxury-villa-real-estate-hero.png",
      featured: false,
      type: "travel" as const,
    },
    {
      id: "pkg-santo-domingo",
      title: "Santo Domingo: Historia y Cultura",
      destination: "Santo Domingo, RD",
      duration: "3 días",
      price: 950,
      rating: 4.7,
      reviews: 450,
      travelers: "1-2 personas",
      includes: ["Hotel Colonial", "Tour Histórico", "Cenas Gourmet", "Traslados"],
      image: "/luxury_modern_villa_renaissance.png",
      featured: false,
      type: "travel" as const,
    },
  ]

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen w-full relative bg-background text-foreground selection:bg-primary/30 overflow-x-hidden font-sans">
      <Header isScrolled={isScrolled} isIntroFinished={true} />
      <MobileHeader
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => { }}
        handleMobileNavClick={() => { }}
        isIntroFinished={true}
      />

      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-none bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-none bg-primary/5 blur-[120px]" />
      </div>

      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <Image
            src="/luxury-travel-destination-beach-resort.jpg"
            alt="Punta Cana Luxury"
            fill
            className="object-cover opacity-40 grayscale-[0.2]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background" />
        </motion.div>

        <div className="container layout-guide-visual relative z-10 text-center max-w-7xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-block px-4 py-1.5 mb-8 border border-primary/20 glass-premium rounded-none">
              <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-foreground/60">Legacy Travel</span>
            </div>

            <PremiumHeading as="h1" className="mb-10 leading-[0.9]">
              Viajes que<br />
              <span className="italic font-extralight text-primary">crean leyendas</span>
            </PremiumHeading>

            <PremiumText className="text-base md:text-lg text-foreground/50 mb-16 max-w-2xl mx-auto font-light tracking-wide px-4">
              Cada viaje es una obra maestra. Curamos experiencias que trascienden el turismo convencional para convertir sus vacaciones en un hito de vida.
            </PremiumText>

            <div className="flex flex-col sm:flex-row gap-8 justify-center mt-12 mb-20 px-4">
              <button 
                className="group relative flex items-center justify-between gap-12 px-15 py-7 bg-primary text-black transition-all duration-700 hover:scale-[1.05] shadow-premium overflow-hidden border border-primary/20"
                onClick={() => scrollToSection('destinos')}
              >
                <span className="text-sm font-bold uppercase tracking-[0.4em]">Explorar Destinos</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button className="px-15 py-7 border border-primary/20 glass-premium text-sm font-bold uppercase tracking-[0.4em] hover:bg-primary/5 transition-all duration-700 rounded-none">
                    Solicitar Itinerario VIP
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[95vh] z-[1001]">
                  <DialogTitle className="sr-only">Solicitar Itinerario VIP</DialogTitle>
                  <DialogDescription className="sr-only">Formulario para solicitar un itinerario de viaje VIP</DialogDescription>
                  <div className="bg-background rounded-none p-10 md:p-20 shadow-2xl border border-primary/20 relative">
                    <TravelQuoteForm 
                      initialData={{
                        origin,
                        destination,
                        checkIn,
                        checkOut,
                        guests,
                        travelClass
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.5, duration: 1.5 }}
           className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] font-semibold text-foreground/40">Continuar</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary/40 to-transparent" />
        </motion.div>
      </section>

      {/* Search Bar Section */}
      <section id="destinos" className="relative -mt-16 z-20 px-4 mb-32 overflow-hidden">
        <div className="container layout-guide-visual max-w-7xl mx-auto">
          <div className="grid grid-cols-12">
            <div id="destinos" className="scroll-mt-32 col-span-12">
              <TrivagoSearch 
                className="max-w-5xl mx-auto" 
                onSearch={(data: any) => {
                  setDestination(data.destination)
                  setOrigin(data.origin)
                  setCheckIn(data.checkIn)
                  setCheckOut(data.checkOut)
                  setGuests(data.guests)
                  setTravelClass(data.travelClass)
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section id="paquetes" className="section-airy relative px-4 bg-background overflow-hidden">
        <div className="container layout-guide-visual max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <PremiumHeading as="h2" className="mb-8">
              Experiencias <span className="italic text-primary">Curadas</span>
            </PremiumHeading>
            <div className="w-32 h-[1px] bg-primary/40 mx-auto mb-10" />
            <PremiumText className="max-w-2xl mx-auto text-foreground/50 font-light">
              Selección exclusiva de itinerarios diseñados para el viajero que exige perfección en cada detalle.
            </PremiumText>
          </motion.div>

          <div className="grid grid-cols-12 gap-10 text-left">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="col-span-12 md:col-span-6 lg:col-span-4 group h-full"
              >
                <div className="h-full flex flex-col bg-background border border-primary/10 hover:border-primary/40 transition-all duration-700 shadow-premium overflow-hidden rounded-none relative">
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    Oferta Exclusiva
                  </div>
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent p-8 flex flex-col justify-end" />
                  </div>

                  {/* Content */}
                  <div className="p-10 flex-1 flex flex-col relative bg-background">
                    <div className="premium-label text-primary mb-3">Legacy Collection</div>
                    <h3 className="text-3xl font-serif text-foreground mb-6 leading-tight">{pkg.title}</h3>
                    
                    <div className="flex items-center gap-6 mb-8 text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary" /> {pkg.destination}</span>
                       <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-primary" /> {pkg.duration}</span>
                    </div>

                    <div className="space-y-4 mb-10 flex-1 border-t border-primary/5 pt-8">
                      {pkg.includes.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-foreground/60 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-primary/10">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-foreground/30 mb-1">Inversión Viaje</div>
                        <div className="text-3xl font-serif text-foreground font-light">${pkg.price.toLocaleString()}</div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="btn-premium px-8 py-4 text-[10px]">
                            Reservar <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none overflow-y-auto max-h-[95vh] z-[1001]">
                          <DialogTitle className="sr-only">Personalizar Reserva: {pkg.title}</DialogTitle>
                          <DialogDescription className="sr-only">Complete los detalles para su viaje a {pkg.destination}</DialogDescription>
                          <div className="bg-background rounded-none p-10 md:p-20 shadow-2xl border border-primary/20 relative">
                            <TravelQuoteForm 
                              defaultType="resort"
                              initialData={{
                                destination: pkg.destination,
                                origin,
                                checkIn,
                                checkOut,
                                guests,
                                travelClass,
                                datos: {
                                  paquete: pkg.title,
                                  presupuesto_paquete: pkg.price
                                }
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-airy relative px-4 bg-primary/[0.01] border-y border-primary/5 overflow-hidden">
        <div className="container layout-guide-visual max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="col-span-12 lg:col-span-6 space-y-12">
              <PremiumHeading as="h2" className="leading-[0.9]">
                Privilegios <br/><span className="italic text-primary">Exclusivos</span>
              </PremiumHeading>
              
              <div className="grid grid-cols-1 gap-12">
                <div className="flex items-start gap-8 group">
                   <div className="flex-shrink-0 w-16 h-16 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 rounded-none">
                      <Plane className="w-8 h-8" />
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-serif">Conectividad Total</h4>
                      <PremiumText className="text-foreground/40 font-light leading-relaxed">Gestión de vuelos privados, accesos Fast-Track y traslados en flota de lujo a cualquier punto de la isla.</PremiumText>
                   </div>
                </div>
                <div className="flex items-start gap-8 group">
                   <div className="flex-shrink-0 w-16 h-16 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-500 rounded-none">
                      <Shield className="w-8 h-8" />
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-2xl font-serif">Seguridad Patrimonial</h4>
                      <PremiumText className="text-foreground/40 font-light leading-relaxed">Blindaje completo para su tranquilidad durante su estancia, con protocolos de seguridad de alto perfil si lo requiere.</PremiumText>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-12 lg:col-span-6">
              <div className="relative aspect-square">
                <Image
                  src="/luxury_modern_villa_renaissance.png"
                  alt="Exclusive Villa"
                  fill
                  className="object-cover border border-primary/10 grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/20 backdrop-blur-2xl border border-primary/20 flex items-center justify-center p-8 text-center hidden md:flex rounded-none">
                   <p className="text-[10px] uppercase tracking-[0.4em] font-black text-black">Mastering the art of travel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amazing Hotel Deals Section */}
      <section id="ofertas-hotel" className="py-24 px-4 bg-background">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16 border-b border-primary/10 pb-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-light font-serif text-foreground leading-[1.1]">Curaduría de <br/><span className="italic text-primary">Ofertas</span></h2>
            </div>
            <Link href="/turismo/ofertas" className="text-[10px] uppercase tracking-[0.4em] font-bold text-foreground/40 hover:text-primary transition-all flex items-center gap-4 group">
              Explorar Catálogo <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoadingHotels ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-[450px] bg-background border border-primary/5 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-shimmer" />
                   <div className="h-64 bg-primary/5 m-4 mb-8" />
                   <div className="px-6 space-y-4">
                      <div className="h-4 w-2/3 bg-primary/5" />
                      <div className="h-8 w-full bg-primary/5" />
                      <div className="h-4 w-1/3 bg-primary/5 pt-10" />
                   </div>
                </div>
              ))
            ) : hotels.length > 0 ? (
              hotels.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-background border border-primary/10 hover:border-primary/40 transition-all duration-700 overflow-hidden group rounded-none shadow-premium relative h-full flex flex-col"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={hotel.image} alt={hotel.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <button className="absolute top-6 right-6 p-3 bg-background/80 backdrop-blur-md rounded-none border border-primary/10 text-foreground hover:bg-primary hover:text-black transition-all shadow-xl">
                      <Heart className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-6 left-8 right-8">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary blur-none">{hotel.rating} Estrellas</span>
                        <span className="text-[9px] text-foreground/40 uppercase tracking-widest font-bold">{hotel.ratingText} ({hotel.reviews} reviews)</span>
                      </div>
                      <h3 className="font-serif text-2xl text-foreground leading-tight group-hover:text-primary transition-colors">{hotel.name}</h3>
                    </div>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col bg-background relative z-10">
                    <div className="flex items-center gap-3 text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-primary" />
                      {hotel.location}
                    </div>
                    
                    <div className="flex-1 space-y-3 border-t border-primary/5 pt-6">
                       <p className="text-[10px] text-foreground/30 leading-relaxed font-light line-clamp-2">
                          Experiencia inmersiva en el corazón de {hotel.location.split(',')[0]}. Lujo redefinido por Novo Heritage.
                       </p>
                    </div>

                    <div className="flex items-end justify-between pt-6 border-t border-primary/10">
                      <div>
                        <p className="text-[9px] text-foreground/30 uppercase tracking-[0.2em] font-bold mb-1">Portfolio {hotel.provider}</p>
                        <p className="text-3xl font-serif text-foreground font-light">${hotel.price}</p>
                        <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Noche VIP</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="btn-premium px-8 py-4 text-[10px]">
                            Reservar
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0 bg-transparent border-none overflow-y-auto max-h-[95vh] z-[10001]">
                          <DialogTitle className="sr-only">Reservar {hotel.name}</DialogTitle>
                          <DialogDescription className="sr-only">Formulario para reservar estadía en {hotel.name}</DialogDescription>
                          <div className="bg-background rounded-none p-10 md:p-16 border border-primary/20 relative shadow-2xl">
                            <TravelQuoteForm 
                              defaultType="resort"
                              initialData={{
                                destination: hotel.location,
                                origin,
                                checkIn,
                                checkOut,
                                guests,
                                travelClass,
                                datos: {
                                  hotel: hotel.name,
                                  oferta: hotel.id
                                }
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-premium rounded-none">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tighter">Viajes y Boletos <span className="text-primary italic font-light">Disponibles</span></h2>
                <p className="text-foreground/50 max-w-2xl mx-auto font-light mb-8">
                  Explora nuestra selección exclusiva de paquetes todo incluido, vuelos privados y boletos para los destinos más codiciados del Caribe.
                </p>
                <button 
                  className="text-xs font-bold uppercase tracking-[0.3em] text-primary hover:underline"
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    setHotelStars([]);
                    setGuestRating(0);
                  }}
                >
                  Limpiar Refinamientos
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="reservas" className="py-32 px-4 bg-background relative overflow-hidden">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-8xl font-light font-serif text-foreground mb-8 leading-tight">
              Excelencia en<br/><span className="italic text-primary">Cada Millas</span>
            </h2>
            <div className="w-32 h-[1px] bg-primary/40 mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Plane,
                title: "Vuelos Charter",
                description: "Vuelos privados y comerciales a cualquier destino del mundo.",
              },
              {
                icon: Shield,
                title: "Seguro de Viaje",
                description: "Protección integral VIP para tu tranquilidad absoluta.",
              },
              {
                icon: Star,
                title: "Concierge 24/7",
                description: "Asistencia personalizada para reservas y experiencias.",
              },
              {
                icon: Users,
                title: "Eventos Private",
                description: "Planificación de bodas, aniversarios y retiros corporativos.",
              },
            ].map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-10 glass-premium border-primary/5 hover:border-primary/20 transition-all duration-700 group rounded-none"
              >
                <div className="w-16 h-16 bg-primary/5 border border-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors duration-500 rounded-none">
                  <service.icon className="w-8 h-8 text-primary group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-2xl font-serif text-foreground mb-4">{service.title}</h3>
                <p className="text-foreground/50 font-light text-sm leading-relaxed tracking-wide">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </div>
  )
}

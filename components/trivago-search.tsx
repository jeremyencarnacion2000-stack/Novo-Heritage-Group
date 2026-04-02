"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { 
    DestinationSuggestions, 
    GuestRoomsCounter 
} from "./travel-search-popovers"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, MapPin, Calendar as CalendarIcon, Users } from "lucide-react"
import { FiGlobe, FiMapPin, FiCalendar, FiUser } from "react-icons/fi"
import { cn } from "@/lib/utils"

interface TrivagoSearchProps {
    className?: string
    defaultDestination?: string
    onSearch?: (data: {
        origin: string;
        destination: string;
        checkIn: string;
        checkOut: string;
        guests: string;
        adults: number;
        children: number;
        rooms: number;
        travelClass: string;
    }) => void
}

export function TrivagoSearch({ className, defaultDestination = "Punta Cana", onSearch }: TrivagoSearchProps) {
    const [origin, setOrigin] = useState("Santo Domingo")
    const [destination, setDestination] = useState(defaultDestination)
    const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
        from: new Date(2024, 4, 10),
        to: new Date(2024, 4, 17)
    })
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [rooms, setRooms] = useState(1)
    const [travelClass, setTravelClass] = useState("economy")

    // UI State
    const [isDestOpen, setIsDestOpen] = useState(false)
    const [isOriginOpen, setIsOriginOpen] = useState(false)
    const [isDatesOpen, setIsDatesOpen] = useState(false)
    const [isGuestsOpen, setIsGuestsOpen] = useState(false)

    const handleSearch = () => {
        if (onSearch) {
            onSearch({
                origin,
                destination,
                checkIn: format(dateRange.from, "yyyy-MM-dd"),
                checkOut: format(dateRange.to, "yyyy-MM-dd"),
                guests: (adults + children).toString(),
                adults,
                children,
                rooms,
                travelClass
            })
            return
        }
        
        const baseUrl = "https://www.trivago.com.do/es/srl"
        const params = new URLSearchParams({
            "aDateRange[from]": format(dateRange.from, "yyyy-MM-dd"),
            "aDateRange[to]": format(dateRange.to, "yyyy-MM-dd"),
            "iPathId": "0", 
            "q": destination,
            "iRoomType": "7",
            "aRooms[0][adults]": adults.toString(),
            "aRooms[0][children][]": Array(children).fill("0").join(","),
        })
        window.open(`${baseUrl}?${params.toString()}`, "_blank")
    }

    const partnerLogos = [
        { name: "Booking.com" },
        { name: "Hoteles.com" },
        { name: "Agoda" },
        { name: "Vrbo" },
        { name: "All" },
        { name: "Trip.com" },
        { name: "Viajes El Corte Inglés" },
    ]

    return (
        <div className={`space-y-12 ${className}`}>
            <div className="relative max-w-6xl mx-auto">
                <div className={cn("relative z-50", className)}>
                    <div className="bg-background shadow-2xl overflow-hidden border border-border/50 flex flex-col md:flex-row items-stretch p-1 lg:p-2 gap-1 lg:gap-2">
                        
                        {/* ORIGIN SECTION */}
                        <div className="flex-1 min-w-[140px] relative group hover:bg-muted/50 transition-colors">
                            <Popover open={isOriginOpen} onOpenChange={setIsOriginOpen}>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-full flex flex-col items-start px-4 py-3 text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">Origen</span>
                                        <div className="flex items-center gap-2 w-full">
                                            <FiGlobe className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-sm font-bold truncate">{origin || "Ciudad de origen"}</span>
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="start">
                                    <DestinationSuggestions onSelect={(city) => { setOrigin(city); setIsOriginOpen(false); }} />
                                </PopoverContent>
                            </Popover>
                            <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-border/40" />
                        </div>

                        {/* DESTINATION SECTION */}
                        <div className="flex-1 min-w-[200px] relative group hover:bg-muted/50 transition-colors">
                            <Popover open={isDestOpen} onOpenChange={setIsDestOpen}>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-full flex flex-col items-start px-4 py-3 text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">Destino</span>
                                        <div className="flex items-center gap-2 w-full">
                                            <FiMapPin className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-sm font-bold truncate">{destination || "A dónde vamos?"}</span>
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="start">
                                    <DestinationSuggestions onSelect={(city) => { setDestination(city); setIsDestOpen(false); }} />
                                </PopoverContent>
                            </Popover>
                            <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-border/40" />
                        </div>

                        {/* DATES SECTION */}
                        <div className="flex-[1.5] min-w-[220px] relative group hover:bg-muted/50 transition-colors">
                            <Popover open={isDatesOpen} onOpenChange={setIsDatesOpen}>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-full flex flex-col items-start px-4 py-3 text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">Entrada / Salida</span>
                                        <div className="flex items-center gap-2 w-full">
                                            <FiCalendar className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-sm font-bold whitespace-nowrap">
                                                {format(dateRange.from, "dd MMM", { locale: es })} - {format(dateRange.to, "dd MMM", { locale: es })}
                                            </span>
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="p-4 bg-background">
                                        <div className="flex gap-4 mb-4">
                                            <Button variant="outline" size="sm" className="rounded-full text-[10px] h-7">Fechas</Button>
                                            <Button variant="ghost" size="sm" className="rounded-full text-[10px] h-7">Meses</Button>
                                        </div>
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange.from}
                                            selected={{ from: dateRange.from, to: dateRange.to }}
                                            onSelect={(range: any) => {
                                                if (range?.from && range?.to) {
                                                    setDateRange({ from: range.from, to: range.to });
                                                } else if (range?.from) {
                                                    setDateRange(prev => ({ ...prev, from: range.from }));
                                                }
                                            }}
                                            numberOfMonths={2}
                                            className="border-none"
                                        />
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {["Tonight", "Tomorrow night", "This weekend", "Next weekend"].map(opt => (
                                                <Button key={opt} variant="outline" size="sm" className="h-8 rounded-full text-[11px] px-3 font-medium">
                                                    {opt}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-border/40" />
                        </div>

                        {/* GUESTS SECTION */}
                        <div className="flex-1 min-w-[200px] relative group hover:bg-muted/50 transition-colors">
                            <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-full flex flex-col items-start px-4 py-3 text-left">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">Pasajeros / Hab.</span>
                                        <div className="flex items-center gap-2 w-full">
                                            <FiUser className="h-4 w-4 text-primary shrink-0" />
                                            <span className="text-sm font-bold">
                                                {adults + children} Pasajeros, {rooms} Hab.
                                            </span>
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="end">
                                    <GuestRoomsCounter 
                                        adults={adults} setAdults={setAdults}
                                        childrenData={children} setChildrenData={setChildren}
                                        rooms={rooms} setRooms={setRooms}
                                        onApply={() => setIsGuestsOpen(false)}
                                    />
                                </PopoverContent>
                            </Popover>
                            <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-border/40" />
                        </div>

                        {/* CLASS SECTION */}
                        <div className="flex-1 min-w-[140px] relative">
                            <div className="flex flex-col items-start px-4 py-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1">Clase</span>
                                <Select value={travelClass} onValueChange={setTravelClass}>
                                    <SelectTrigger className="border-none bg-transparent p-0 h-auto focus:ring-0 text-sm font-bold shadow-none hover:bg-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="economy">Económica</SelectItem>
                                        <SelectItem value="premium-economy">Premium Económica</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="first">First Class</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* SEARCH BUTTON */}
                        <Button 
                            onClick={handleSearch}
                            className="h-14 md:h-auto md:w-24 rounded-none bg-primary hover:bg-primary/90 text-white flex flex-col items-center justify-center p-4 md:p-0 shrink-0 transition-transform active:scale-95"
                        >
                            <Search className="h-6 w-6" />
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Buscar</span>
                        </Button>
                    </div>
                </div>

                {/* Smart Search Floating Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute -right-4 -bottom-32 hidden lg:flex bg-background rounded-none shadow-2xl border border-border/50 p-6 max-w-xs z-20"
                >
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-none bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🤵</span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-sm text-foreground">Haz que tu búsqueda sea más inteligente</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Cuéntanos tus preferencias de viaje para que podamos personalizar tu experiencia.</p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full rounded-none font-bold text-xs py-1 h-8">
                                Empezar ahora
                            </Button>
                        </div>
                        <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                            <span className="text-lg">×</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Partner Logos */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {partnerLogos.map((logo) => (
                    <div key={logo.name} className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight text-foreground">{logo.name}</span>
                    </div>
                ))}
                <span className="text-xs text-muted-foreground font-medium italic">Y cientos más</span>
            </div>
        </div>
    )
}

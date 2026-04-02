"use client"

import * as React from "react"
import { FiMapPin, FiCalendar, FiUser, FiPlus, FiMinus, FiHome, FiStar } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// --- DESTINATION SUGGESTIONS ---
interface DestinationSuggestionsProps {
    onSelect: (city: string) => void
}

export function DestinationSuggestions({ onSelect }: DestinationSuggestionsProps) {
    const recentSearches = [
        { city: "Punta Cana", country: "República Dominicana" },
        { city: "Madrid", country: "España" },
    ]
    const popularDestinations = [
        { city: "Samaná", country: "República Dominicana" },
        { city: "Cartagena", country: "Colombia" },
        { city: "Cancún", country: "México" },
    ]

    return (
        <div className="w-[300px] md:w-[400px] p-4 bg-background">
            <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Búsquedas Recientes</h4>
                <div className="space-y-1">
                    {recentSearches.map((item) => (
                        <button
                            key={item.city}
                            onClick={() => onSelect(item.city)}
                            className="flex items-center w-full p-2.5 hover:bg-muted transition-colors text-left group"
                        >
                            <FiClock className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            <div>
                                <p className="text-sm font-semibold">{item.city}</p>
                                <p className="text-[10px] text-muted-foreground">{item.country}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Destinos Populares</h4>
                <div className="space-y-1">
                    {popularDestinations.map((item) => (
                        <button
                            key={item.city}
                            onClick={() => onSelect(item.city)}
                            className="flex items-center w-full p-2.5 hover:bg-muted transition-colors text-left group"
                        >
                            <FiMapPin className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            <div>
                                <p className="text-sm font-semibold">{item.city}</p>
                                <p className="text-[10px] text-muted-foreground">{item.country}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
                <div className="bg-primary/5 p-3 flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-full">
                        <FiStar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-primary italic">BETA</p>
                        <p className="text-[11px] text-muted-foreground font-medium">¡Describe tu hotel ideal y te lo encontramos!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- GUEST & ROOMS COUNTER ---
interface GuestRoomsCounterProps {
    adults: number
    setAdults: (val: number) => void
    childrenData: number
    setChildrenData: (val: number) => void
    rooms: number
    setRooms: (val: number) => void
    onApply: () => void
}

export function GuestRoomsCounter({
    adults, setAdults,
    childrenData, setChildrenData,
    rooms, setRooms,
    onApply
}: GuestRoomsCounterProps) {
    
    const CounterRow = ({ label, value, setter, min = 0, max = 10 }: { label: string, value: number, setter: (v: number) => void, min?: number, max?: number }) => (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm font-bold text-foreground">{label}</span>
            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setter(Math.max(min, value - 1))}
                    disabled={value <= min}
                >
                    <FiMinus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-bold w-4 text-center">{value}</span>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => setter(Math.min(max, value + 1))}
                    disabled={value >= max}
                >
                    <FiPlus className="h-3 w-3" />
                </Button>
            </div>
        </div>
    )

    return (
        <div className="w-[280px] p-6 bg-background space-y-2">
            <CounterRow label="Adultos" value={adults} setter={setAdults} min={1} />
            <Separator className="opacity-50" />
            <CounterRow label="Niños" value={childrenData} setter={setChildrenData} />
            <Separator className="opacity-50" />
            <CounterRow label="Habitaciones" value={rooms} setter={setRooms} min={1} />
            
            <div className="pt-4 flex items-center gap-2 mb-4">
                <input type="checkbox" id="petFriendly" className="rounded-sm border-primary/20" />
                <Label htmlFor="petFriendly" className="text-[12px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Viajo con mascotas
                </Label>
            </div>

            <Button onClick={onApply} className="w-full h-11 font-bold rounded-none">
                Aplicar
            </Button>
        </div>
    )
}

function FiClock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

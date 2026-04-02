"use client"

import { useState, useEffect, useRef } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// @ts-ignore - lucide-react types not resolving correctly
import {
  Search,
  FileText,
  CreditCard,
  Home,
  Hash,
  Building2 as Building,
  Car,
  Shield,
  Star
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  icon: React.ReactNode
  action: () => void
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "Documentos de propiedad",
    description: "Accede a documentos legales y contratos",
    category: "Documentos",
    icon: <FileText className="h-4 w-4" />,
    action: () => console.log("Navigate to documents")
  },
  {
    id: "2",
    title: "Pagos pendientes",
    description: "Revisa tus pagos y configuraciones de facturación",
    category: "Finanzas",
    icon: <CreditCard className="h-4 w-4" />,
    action: () => console.log("Navigate to payments")
  },
  {
    id: "3",
    title: "Bienes raíces",
    description: "Explora propiedades disponibles para compra o renta",
    category: "Propiedades",
    icon: <Home className="h-4 w-4" />,
    action: () => console.log("Navigate to real estate")
  },
  {
    id: "4",
    title: "ID de propiedad #12345",
    description: "Detalles de la propiedad con ID #12345",
    category: "Propiedades",
    icon: <Hash className="h-4 w-4" />,
    action: () => console.log("Navigate to property #12345")
  },
  {
    id: "5",
    title: "Edificios comerciales",
    description: "Explora edificios comerciales disponibles",
    category: "Propiedades",
    icon: <Building className="h-4 w-4" />,
    action: () => console.log("Navigate to commercial buildings")
  },
  {
    id: "6",
    title: "Seguros de auto",
    description: "Consulta tus pólizas de seguro automotriz",
    category: "Seguros",
    icon: <Car className="h-4 w-4" />,
    action: () => console.log("Navigate to car insurance")
  },
  {
    id: "7",
    title: "Cotización de seguros",
    description: "Obtén una nueva cotización de seguros",
    category: "Seguros",
    icon: <Shield className="h-4 w-4" />,
    action: () => console.log("Navigate to insurance quotes")
  },
  {
    id: "8",
    title: "Reseñas de clientes",
    description: "Lee reseñas verificadas de nuestros clientes",
    category: "Comunidad",
    icon: <Star className="h-4 w-4" />,
    action: () => console.log("Navigate to customer reviews")
  }
]

export function SpotlightSearch() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const filteredResults = searchResults.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setSearch("")
    result.action()
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center">
          <Search className="mr-2 h-4 w-4" />
          Buscar...
        </span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0">
          <DialogTitle className="sr-only">Búsqueda rápida</DialogTitle>
          <DialogDescription className="sr-only">Busca documentos, propiedades, seguros y más en toda la plataforma.</DialogDescription>
          <Command shouldFilter={false} loop>
            <CommandInput
              ref={inputRef}
              placeholder="Buscar en toda la plataforma..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup heading="Resultados de búsqueda">
                {filteredResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 rounded-sm bg-muted p-1">
                        {result.icon}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span>{result.title}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {result.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
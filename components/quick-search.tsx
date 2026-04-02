"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// @ts-ignore - lucide-react types not resolving correctly
import { Search, Shield, Home, Plane } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

export function QuickSearch() {
  return (
    <section id="quick-search" className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-serif mb-4 animate-fade-in-up text-foreground">Busca lo que necesitas</h2>
          <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Seguros, Bienes Raíces y Turismo en un solo lugar.</p>
        </div>
        <Tabs defaultValue="bienes-raices" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-4 bg-transparent p-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <TabsTrigger value="seguros" className="flex items-center justify-center gap-2 p-4 rounded-none border-2 border-border bg-card text-foreground transition-all duration-300 data-[state=active]:bg-spotify-green data-[state=active]:border-spotify-green data-[state=active]:text-black">
              <Shield className="w-6 h-6" />
              <span className="text-lg font-semibold">Seguros</span>
            </TabsTrigger>
            <TabsTrigger value="bienes-raices" className="flex items-center justify-center gap-2 p-4 rounded-none border-2 border-border bg-card text-foreground transition-all duration-300 data-[state=active]:bg-spotify-green data-[state=active]:border-spotify-green data-[state=active]:text-black">
              <Home className="w-6 h-6" />
              <span className="text-lg font-semibold">Bienes Raíces</span>
            </TabsTrigger>
            <TabsTrigger value="turismo" className="flex items-center justify-center gap-2 p-4 rounded-none border-2 border-border bg-card text-foreground transition-all duration-300 data-[state=active]:bg-spotify-green data-[state=active]:border-spotify-green data-[state=active]:text-black">
              <Plane className="w-6 h-6" />
              <span className="text-lg font-semibold">Turismo</span>
            </TabsTrigger>
          </TabsList>
          <div className="mt-8">
            <TabsContent value="seguros">
              <Card className="bg-transparent border-none shadow-none animate-fade-in-up">
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Busca tu seguro ideal..." className="pl-12 h-14 text-lg rounded-none bg-foreground/5 text-foreground border-border focus:ring-spotify-green" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="bienes-raices">
              <Card className="bg-transparent border-none shadow-none animate-fade-in-up">
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Busca tu propiedad soñada..." className="pl-12 h-14 text-lg rounded-none bg-foreground/5 text-foreground border-border focus:ring-spotify-green" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="turismo">
              <Card className="bg-transparent border-none shadow-none animate-fade-in-up">
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Busca tu próximo destino..." className="pl-12 h-14 text-lg rounded-none bg-foreground/5 text-foreground border-border focus:ring-spotify-green" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </section>
  )
}

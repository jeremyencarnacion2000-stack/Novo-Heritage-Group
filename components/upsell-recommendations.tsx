"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// @ts-ignore - lucide-react types not resolving correctly
import { Star, TrendingUp, Gift, Shield, Search, Package } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  icon: any
  rating: number
  reviews: number
  badge?: string
  type: "upsell" | "cross-sell" | "bundle"
}

const recommendedProducts: Product[] = [
  {
    id: "1",
    name: "Seguro Integral Premium",
    description: "Cobertura completa para tu propiedad",
    price: 99,
    originalPrice: 149,
    icon: Shield,
    rating: 4.9,
    reviews: 234,
    badge: "Más Popular",
    type: "upsell",
  },
  {
    id: "2",
    name: "Inspección Profesional",
    description: "Evaluación completa de la propiedad",
    price: 299,
    icon: Search,
    rating: 4.8,
    reviews: 156,
    badge: "Recomendado",
    type: "cross-sell",
  },
  {
    id: "3",
    name: "Bundle: Seguro + Inspección",
    description: "Ahorra 30% comprando juntos",
    price: 349,
    originalPrice: 498,
    icon: Package,
    rating: 4.9,
    reviews: 89,
    badge: "Mejor Valor",
    type: "bundle",
  },
]

export function UpsellRecommendations() {
  return (
    <div className="w-full space-y-8 py-10">
      {/* Header */}
      <div className="space-y-3 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <h3 className="text-2xl font-serif font-light text-white">Complementa tu Compra</h3>
        </div>
        <p className="text-base text-muted-foreground max-w-md">
          Optimiza tu inversión con estos servicios adicionales recomendados por expertos.
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedProducts.map((product, index) => (
          <Card
            key={product.id}
            className={`relative p-8 bg-white/5 border-white/10 hover:border-primary/50 transition-all duration-500 animate-scale-in hover:-translate-y-2 group ${product.type === "bundle" ? "ring-2 ring-primary/40 md:scale-105 z-10" : ""
              }`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {/* Badge */}
            {product.badge && (
              <div className="absolute -top-3 right-6 animate-bounce-in">
                <span className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-none shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)]">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="w-16 h-16 rounded-none bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <product.icon className="w-8 h-8 text-primary" />
            </div>

            {/* Name */}
            <h4 className="text-xl font-serif font-light text-white mb-2">{product.name}</h4>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 transition-all duration-300 ${i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-white/20"
                      }`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/40 font-medium">{product.rating} ({product.reviews})</span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-white/30 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-xs text-green-400 font-bold mt-1 uppercase tracking-wider">
                  Ahorra ${product.originalPrice - product.price}
                </p>
              )}
            </div>

            {/* CTA Button */}
            <Button
              className={`w-full h-14 rounded-none font-bold transition-all duration-300 ${product.type === "bundle"
                ? "bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_15px_35px_rgba(var(--primary-rgb),0.4)]"
                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                }`}
            >
              {product.type === "bundle" ? (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Agregar Bundle
                </>
              ) : (
                "Agregar servicio"
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Trust Message */}
      <div className="p-6 bg-primary/5 border border-primary/10 rounded-none flex items-center gap-4 animate-slide-in-up">
        <div className="w-12 h-12 rounded-none bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm sm:text-base text-white font-medium">
            Garantía de satisfacción Novo Heritage
          </p>
          <p className="text-xs sm:text-sm text-white/50">
            Si no estás satisfecho en 30 días, te devolvemos tu inversión sin preguntas.
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente para mostrar en el carrito
export function CartUpsell() {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="font-semibold text-foreground">¿Quieres mejorar tu compra?</h3>
      <div className="space-y-3">
        {recommendedProducts.slice(0, 2).map((product, index) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-none animate-scale-in hover:bg-muted/70 transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-primary/10 flex items-center justify-center animate-float">
                <product.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">${product.price}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="hover:scale-105 transition-transform duration-300">
              Agregar
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
// @ts-ignore - lucide-react types not resolving correctly
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/hooks/use-cart"
import { PaymentGateway } from "@/components/payment-gateway"

export function ShoppingCartButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const { items, removeItem, updateQuantity } = useCart()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-muted/80">
          <ShoppingCart className="w-4 h-4" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary/80 text-primary-foreground text-xs rounded-none flex items-center justify-center font-medium">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif font-light">
            {showPayment ? "Finalizar Compra" : "Carrito de compras"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {showPayment ? (
            <div className="space-y-6">
              <PaymentGateway />
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowPayment(false)}
              >
                ← Volver al carrito
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground">Agrega productos para comenzar tu compra</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-none">
                    {item.image && (
                      <div className="w-20 h-20 rounded-none overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">${item.price.toLocaleString()} MXN</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-none border border-border hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-none border border-border hover:bg-muted flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total and Checkout */}
              <div className="border-t border-border pt-6 space-y-6">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium text-muted-foreground">Subtotal</span>
                  <span className="font-serif font-light text-2xl text-white">${total.toLocaleString()} MXN</span>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full h-14 rounded-none text-lg font-bold bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_15px_40px_rgba(var(--primary-rgb),0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300"
                    size="lg"
                    onClick={() => setShowPayment(true)}
                  >
                    Proceder al pago seguro
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-none bg-white/5 border border-white/10">
                      <div className="w-2 h-2 rounded-none bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">SSL Secure</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-none bg-white/5 border border-white/10">
                      <div className="w-2 h-2 rounded-none bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Garantía 30d</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-none text-sm text-muted-foreground hover:text-white transition-colors"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  ← Continuar explorando servicios
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

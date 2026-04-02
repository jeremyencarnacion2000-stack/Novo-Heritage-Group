"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
// @ts-ignore - lucide-react types not resolving correctly
import { CreditCard, Lock, Check, AlertCircle, Zap } from "lucide-react"
import { toast } from "sonner"

interface PaymentPlan {
  id: string
  name: string
  price: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const paymentPlans: PaymentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    features: [
      "Acceso básico a seguros",
      "5 propiedades guardadas",
      "Soporte por email",
      "Reportes mensuales",
    ],
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    features: [
      "Acceso completo a todas las categorías",
      "50 propiedades guardadas",
      "Soporte prioritario",
      "Reportes semanales",
      "Análisis avanzado",
      "API access",
    ],
    popular: true,
    icon: <CreditCard className="w-6 h-6" />,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    features: [
      "Acceso ilimitado",
      "Propiedades ilimitadas",
      "Soporte 24/7 dedicado",
      "Reportes en tiempo real",
      "Análisis predictivo",
      "API ilimitada",
      "Integraciones personalizadas",
    ],
    icon: <Lock className="w-6 h-6" />,
  },
]

interface PaymentFormData {
  cardNumber: string
  cardHolder: string
  expiryDate: string
  cvv: string
}

export function PaymentGateway() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  })

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setShowPaymentForm(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim()
    } else if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d{0,2})/, "$1/$2")
    } else if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    toast.success("¡Pago procesado exitosamente!")
    setShowPaymentForm(false)
    setSelectedPlan(null)
    setFormData({
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvv: "",
    })
  }

  const selectedPlanData = paymentPlans.find((p) => p.id === selectedPlan)

  return (
    <div className="w-full space-y-8">
      {!showPaymentForm ? (
        <>
          {/* Header */}
          <div className="text-center space-y-2 mb-12">
            <h1 className="text-4xl font-serif font-light text-foreground">Planes de Suscripción</h1>
            <p className="text-lg text-muted-foreground">Elige el plan perfecto para tus necesidades</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-8 transition-all duration-300 ${plan.popular
                    ? "border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 scale-105 shadow-lg"
                    : "bg-card/50 border-border/50 hover:border-primary/30"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1 rounded-none text-xs font-medium">
                      Más Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-none bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-light text-foreground">{plan.name}</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-serif font-light text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full ${plan.popular
                      ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                >
                  Seleccionar Plan
                </Button>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-serif font-light text-foreground">Preguntas Frecuentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "¿Puedo cambiar de plan en cualquier momento?",
                  a: "Sí, puedes cambiar o cancelar tu suscripción en cualquier momento sin penalización.",
                },
                {
                  q: "¿Hay período de prueba gratuita?",
                  a: "Ofrecemos 14 días de prueba gratuita para todos los planes.",
                },
                {
                  q: "¿Qué métodos de pago aceptan?",
                  a: "Aceptamos tarjetas de crédito, PayPal, transferencia bancaria y criptomonedas.",
                },
                {
                  q: "¿Hay descuentos anuales?",
                  a: "Sí, obtén 20% de descuento si pagas anualmente.",
                },
              ].map((item, index) => (
                <Card key={index} className="p-4 bg-card/50 border-border/50">
                  <p className="font-medium text-foreground mb-2">{item.q}</p>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Payment Form */
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-none bg-gradient-to-br from-primary to-primary/80 text-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-foreground">Completar Pago</h2>
              <p className="text-sm text-muted-foreground">
                Plan: {selectedPlanData?.name} - ${selectedPlanData?.price}/mes
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment} className="space-y-6">
            {/* Security Notice */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-none flex gap-3">
              <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Pago Seguro</p>
                <p className="text-muted-foreground">Tu información está encriptada y protegida con SSL.</p>
              </div>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Número de Tarjeta</label>
              <Input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                maxLength={19}
                required
                className="font-mono"
              />
            </div>

            {/* Card Holder */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Titular de la Tarjeta</label>
              <Input
                type="text"
                name="cardHolder"
                placeholder="Juan Pérez"
                value={formData.cardHolder}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Vencimiento</label>
                <Input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  maxLength={5}
                  required
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">CVV</label>
                <Input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  maxLength={4}
                  required
                  className="font-mono"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Atrás
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : `Pagar $${selectedPlanData?.price}`}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

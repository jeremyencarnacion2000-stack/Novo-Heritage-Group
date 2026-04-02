"use client"

import { motion } from "framer-motion"
// @ts-ignore - lucide-react types not resolving correctly
import { Check, Sparkles } from "lucide-react"
import { useState } from "react"
import GlassRadioGroup from "./glass-radio-group"
import VerticalRadioGroup from "./vertical-radio-group"

const pricingPlans = [
  {
    name: "Básico",
    price: "Gratis",
    description: "Perfecto para comenzar con nuestros servicios",
    features: [
      "Consulta inicial gratuita",
      "Acceso a catálogo básico de propiedades",
      "Cotización de seguros estándar",
      "Destinos turísticos nacionales"
    ],
    popular: false,
    cta: "Comenzar Ahora",
  },
  {
    name: "Premium",
    monthlyPrice: 199,
    annualPrice: 149,
    description: "Para clientes que buscan servicios completos",
    features: [
      "Acceso completo a propiedades",
      "Seguros personalizados",
      "Paquetes turísticos internacionales",
      "Asesoría especializada 24/7",
      "Prioridad en atención",
      "Descuentos exclusivos"
    ],
    popular: true,
    cta: "Prueba Gratis 14 días",
  },
  {
    name: "Empresarial",
    monthlyPrice: 499,
    annualPrice: 399,
    description: "Para empresas y clientes con necesidades avanzadas",
    features: [
      "Todo lo incluido en Premium",
      "Servicios corporativos",
      "Propiedades comerciales exclusivas",
      "Viajes de negocios personalizados",
      "Asistencia ejecutiva",
      "Soporte dedicado"
    ],
    popular: false,
    cta: "Contactar Ventas",
  },
]

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-white/80">Precios</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-amber-200 to-white/60 bg-clip-text text-transparent mb-4">
            Planes adaptados a tus necesidades
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Comienza con nuestro plan gratuito y mejora cuando necesites más servicios.
          </p>

          {/* Monthly/Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-center">
              <p className="text-white/80 text-sm mb-4">Elige tu período de facturación</p>
              <GlassRadioGroup
                options={["Mensual", "Anual"]}
                defaultValue={isAnnual ? "Anual" : "Mensual"}
                onChange={(value) => setIsAnnual(value === "Anual")}
                className="mx-auto"
              />
            </div>

            {/* Service Type Selector */}
            <div className="text-center">
              <p className="text-white/80 text-sm mb-4">Tipo de servicio</p>
              <VerticalRadioGroup
                options={["Seguros", "Bienes Raíces", "Turismo", "Todos los servicios"]}
                defaultValue="Todos los servicios"
                className="mx-auto"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-none p-8 backdrop-blur-sm border transition-all duration-300 ${plan.popular
                  ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 shadow-lg shadow-amber-500/10"
                  : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-500/80 text-white text-sm font-medium px-4 py-2 rounded-none">
                    Más Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  {plan.price ? (
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-white/60 text-lg">{isAnnual ? "/año" : "/mes"}</span>
                    </>
                  )}
                </div>
                <p className="text-white/60 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-none font-medium transition-all duration-200 ${plan.popular
                    ? "bg-gradient-to-r from-amber-500 to-amber-500/80 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 mb-4">¿Necesitas un plan personalizado? Estamos aquí para ayudarte.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-amber-500 hover:text-amber-500/80 font-medium transition-colors"
          >
            Contactar con nuestro equipo →
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
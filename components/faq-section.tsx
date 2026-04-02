"use client"

import { useState } from "react"
// @ts-ignore - lucide-react types not resolving correctly
import { Plus, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    {
      question: "¿Qué servicios ofrecen en seguros?",
      answer:
        "Ofrecemos una amplia gama de seguros personalizados incluyendo seguros de vida, salud, propiedad y automóviles. Cada póliza se adapta a tus necesidades específicas con coberturas completas y asistencia 24/7.",
    },
    {
      question: "¿Cómo puedo encontrar propiedades para comprar o alquilar?",
      answer:
        "Contamos con una extensa base de datos de propiedades residenciales y comerciales en ubicaciones privilegiadas. Nuestros agentes expertos te ayudarán a encontrar la propiedad perfecta según tus criterios y presupuesto.",
    },
    {
      question: "¿Qué destinos turísticos ofrecen?",
      answer:
        "Ofrecemos paquetes turísticos a destinos nacionales e internacionales, desde escapadas románticas hasta aventuras extremas. Todos nuestros viajes son personalizados para crear experiencias inolvidables.",
    },
    {
      question: "¿Cómo puedo contactar con un agente?",
      answer:
        "Puedes contactarnos a través de nuestro formulario en línea, por teléfono al +1 (809) 555-1234, o visitando nuestra oficina en Av. Winston Churchill 1234. También puedes usar nuestro chatbot 24/7 para consultas inmediatas.",
    },
    {
      question: "¿Ofrecen financiamiento para propiedades?",
      answer:
        "Sí, trabajamos con múltiples instituciones financieras para ofrecer opciones de financiamiento competitivas. Nuestros asesores te ayudarán a encontrar la mejor opción de hipoteca según tu perfil financiero.",
    },
  ]

  return (
    <section id="faq" className="relative overflow-hidden pb-24 pt-12">
      {/* Background blur effects */}
      <div className="bg-primary/20 absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>
      <div className="bg-primary/20 absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full opacity-80 blur-3xl"></div>

      <div className="z-10 container mx-auto px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="border-primary/40 text-primary inline-flex items-center gap-2 rounded-none border px-3 py-1 uppercase">
            <span>✶</span>
            <span className="text-sm">Preguntas Frecuentes</span>
          </div>
        </motion.div>

        <motion.h2
          className="mx-auto mt-6 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          ¿Tienes preguntas?{" "}
          <span className="bg-gradient-to-b from-foreground via-amber-200 to-primary bg-clip-text text-transparent">
            Tenemos respuestas
          </span>
        </motion.h2>

        <div className="mx-auto mt-12 flex max-w-xl flex-col gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="from-secondary/40 to-secondary/10 rounded-none border border-white/10 bg-gradient-to-b p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset] transition-all duration-300 hover:border-white/20 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleItem(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  toggleItem(index)
                }
              }}
              {...(index === faqs.length - 1 && { "data-faq": faq.question })}
            >
              <div className="flex items-start justify-between">
                <h3 className="m-0 font-medium pr-4">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className=""
                >
                  {openItems.includes(index) ? (
                    <Minus className="text-primary flex-shrink-0 transition duration-300" size={24} />
                  ) : (
                    <Plus className="text-primary flex-shrink-0 transition duration-300" size={24} />
                  )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    className="mt-4 text-muted-foreground leading-relaxed overflow-hidden"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                      opacity: { duration: 0.2 },
                    }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
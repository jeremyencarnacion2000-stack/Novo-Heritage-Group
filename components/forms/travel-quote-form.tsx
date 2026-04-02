"use client"

import { useState, useEffect } from "react"
// @ts-ignore
import { Plane, Calendar, MapPin, Users, Check, Sparkles, ArrowRight, ArrowLeft, Target, Mail, Download, Palmtree, Compass, Anchor, ChevronRight } from "lucide-react"

type TravelType = 'resort' | 'experiencia' | 'yate' | 'corporativo'

interface TravelQuoteData {
  tipo: TravelType | null
  plan: string | null
  datos: Record<string, string | number>
  totalEstimado: number
  deposito: number
  // Contact Info
  name?: string
  email?: string
  phone?: string
  // Search Context
  origin?: string
  destination?: string
  checkIn?: string
  checkOut?: string
  guests?: string
  travelClass?: string
}

const TRAVEL_PLAN_TIERS = [
  { id: 'silver', title: 'Silver Experience', desc: 'Acceso premium y servicios esenciales de concierge.', mult: 1 },
  { id: 'gold', title: 'Gold Signature', desc: 'Upgrade de categoría, traslados privados y amenidades exclusivas.', mult: 1.8 },
  { id: 'platinum', title: 'Platinum / VIP', desc: 'Servicio 100% personalizado, acceso ultra-exclusivo y prioridad absoluta.', mult: 3.2 }
]

interface TravelFormField {
  id: string
  label: string
  type: 'select' | 'text' | 'number' | 'date'
  options?: string[]
}

const TRAVEL_FIELDS: Record<TravelType, TravelFormField[]> = {
  'resort': [
    { id: 'destino', label: 'Destino Exclusivo', type: 'select', options: ['Punta Cana', 'Cap Cana', 'Casa de Campo', 'Miches'] },
    { id: 'viajeros', label: 'Número de Personas', type: 'number' },
    { id: 'duracion', label: 'Estadía (Noches)', type: 'select', options: ['Weekend (2-3)', 'Semana (4-7)', 'Larga Estancia (8+)'] },
    { id: 'nivel', label: 'Nivel de Servicio', type: 'select', options: ['Presidential Suite', 'Oceanfront Villa', 'Luxury Room'] },
  ],
  'experiencia': [
    { id: 'tipo', label: 'Tipo de Experiencia', type: 'select', options: ['Safári Privado', 'Tour Gastronómico VIP', 'Golf Tour Elite', 'Retiro de Bienestar'] },
    { id: 'pasajeros', label: 'Participantes', type: 'number' },
    { id: 'fechas', label: 'Mes Preferido', type: 'select', options: ['Enero - Marzo', 'Abril - Junio', 'Julio - Septiembre', 'Octubre - Diciembre'] },
  ],
  'yate': [
    { id: 'eslora', label: 'Preferencia de Embarcación', type: 'select', options: ['Categoría 40-60 ft', 'Categoría 60-80 ft', 'Megayates 80+ ft'] },
    { id: 'marina', label: 'Marina de Salida', type: 'select', options: ['Marina Cap Cana', 'Marina Casa de Campo', 'Ocean World'] },
    { id: 'duracion', label: 'Duración del Chárter', type: 'select', options: ['Half-Day (4h)', 'Full-Day (8h)', 'Overnight', 'Semanal'] },
  ],
  'corporativo': [
    { id: 'evento', label: 'Tipo de Evento', type: 'select', options: ['Retiro Ejecutivo', 'Convención Anual', 'Incentivo de Ventas'] },
    { id: 'asistentes', label: 'Número de Ejecutivos', type: 'select', options: ['Menos de 20', '20 - 50', 'Más de 50'] },
    { id: 'amenidades', label: 'Amenidades Requeridas', type: 'select', options: ['Salones Privados + Golf', 'Yate Corporativo', 'All-Inclusive VIP'] },
  ]
}

export function TravelQuoteForm({ 
  defaultType = 'resort',
  initialData 
}: { 
  defaultType?: TravelType,
  initialData?: Partial<TravelQuoteData> 
}) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quote, setQuote] = useState<TravelQuoteData>({
    tipo: defaultType,
    plan: null,
    datos: {},
    totalEstimado: 0,
    deposito: 0,
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    ...initialData
  })

  // Mock luxury pricing engine
  useEffect(() => {
    if (quote.tipo && Object.keys(quote.datos).length > 2 && quote.plan) {
      let base = 5000
      if (quote.tipo === 'yate') base = 8500
      if (quote.tipo === 'corporativo') base = 25000
      if (quote.tipo === 'experiencia') base = 3500
      
      const planMultiplier = TRAVEL_PLAN_TIERS.find(p => p.id === quote.plan)?.mult || 1;
      const finalTotal = base * planMultiplier;
      
      setQuote(prev => ({
        ...prev,
        totalEstimado: finalTotal,
        deposito: finalTotal * 0.3
      }))
    }
  }, [quote.datos, quote.tipo, quote.plan])

  const handleSubmit = async () => {
    if (!quote.name || !quote.email || !quote.phone) {
      alert("Por favor completa tus datos de contacto")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        division: "turismo",
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        message: `Solicitud de diseño de viaje: ${quote.tipo} - Plan ${quote.plan}`,
        source: "cotizador_viajes_premium",
        details: {
          ...quote.datos,
          plan: quote.plan,
          tipo: quote.tipo,
          presupuesto_estimado: quote.totalEstimado,
          deposito_requerido: quote.deposito,
          // Propagate search context
          origin: quote.origin,
          destination: quote.destination,
          checkIn: quote.checkIn,
          checkOut: quote.checkOut,
          travelClass: quote.travelClass,
          guests: quote.guests
        }
      }

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("API Error")
      
      setStep(5) // Success step
    } catch (err) {
      console.error("Submission error:", err)
      alert("Error al enviar la solicitud. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDataChange = (id: string, value: string) => {
    setQuote(prev => {
      const newDatos = { ...prev.datos, [id]: value };
      
      // Auto-advance logic for Step 3
      if (step === 3 && prev.tipo) {
        const fields = TRAVEL_FIELDS[prev.tipo];
        const fieldIndex = fields.findIndex(f => f.id === id);
        const isLastField = fieldIndex === fields.length - 1;
        const currentField = fields[fieldIndex];
        
        // If it's the last field and it's a select, auto-advance
        if (isLastField && currentField.type === 'select' && value !== "") {
          setTimeout(() => setStep(4), 600);
        }
      }
      
      return { ...prev, datos: newDatos };
    });
  }

  const renderStepIcon = (num: number, label: string) => (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-none flex items-center justify-center text-xs font-bold border transition-all duration-500
        ${step > num ? 'bg-primary text-black border-primary' : 
          step === num ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(230,193,90,0.4)]' : 
          'bg-transparent text-foreground/40 border-foreground/10'}`}>
        {step > num ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={`text-xs uppercase tracking-widest ${step >= num ? 'text-primary' : 'text-foreground/40'}`}>{label}</span>
    </div>
  )

  const TravelCard = ({ id, icon: Icon, title, desc }: { id: TravelType, icon: any, title: string, desc: string }) => (
    <button
      onClick={() => {
        setQuote(prev => ({ ...prev, tipo: id, plan: null, datos: {} }));
        setTimeout(() => setStep(2), 400); 
      }}
      className={`text-left p-8 transition-all duration-700 border group hover:border-primary/50 hover:bg-primary/5 w-full bg-background/50
        ${quote.tipo === id ? 'border-primary bg-primary/10 shadow-premium scale-[1.02]' : 'border-primary/10 bg-background/40 hover:scale-[1.01]'}`}
    >
      <Icon className={`w-10 h-10 mb-6 transition-colors duration-300 ${quote.tipo === id ? 'text-primary' : 'text-foreground/40 group-hover:text-primary'}`} />
      <h4 className="font-serif text-2xl text-foreground mb-3">{title}</h4>
      <p className="text-sm text-foreground/60 tracking-wider font-light leading-relaxed">{desc}</p>
    </button>
  )

  const PlanSelectorCard = ({ id, title, desc }: { id: string, title: string, desc: string }) => (
    <button
      onClick={() => {
        setQuote(prev => ({ ...prev, plan: id }));
        setTimeout(() => setStep(3), 400); 
      }}
      className={`text-left p-8 transition-all duration-700 border flex flex-col justify-between group hover:border-primary/50 hover:bg-primary/5 min-h-[200px] w-full bg-background/50
        ${quote.plan === id ? 'border-primary bg-primary/10 shadow-premium scale-[1.02]' : 'border-primary/10 bg-background/40 hover:scale-[1.01]'}`}
    >
      <div>
        <h4 className={`font-serif text-2xl mb-4 transition-colors duration-300 ${quote.plan === id ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{title}</h4>
        <p className="text-sm text-foreground/60 tracking-wider font-light leading-relaxed">{desc}</p>
      </div>
      <div className={`mt-6 w-8 h-8 rounded-none border flex items-center justify-center transition-all ${quote.plan === id ? 'border-primary bg-primary' : 'border-foreground/10'}`}>
        {quote.plan === id && <Check className="w-5 h-5 text-black" />}
      </div>
    </button>
  )

  return (
    <div className="w-full bg-background text-foreground min-h-[60vh] flex flex-col relative overflow-hidden font-sans">
      {/* Premium Background FX */}
      <div className="absolute top-0 right-[-100px] w-[600px] h-[600px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-serif mb-4 leading-tight px-4">
          Diseño de <span className="italic text-primary">Experiencias</span>
        </h2>
        <p className="text-foreground/50 text-xs md:text-sm tracking-widest uppercase px-4">Concierge Patrimonial & Turismo</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-12 relative z-10 w-full overflow-x-auto px-4 pb-4 scrollbar-hide">
        {renderStepIcon(1, 'Categoría')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 1 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(2, 'Plan')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 2 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(3, 'Itinerario')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 3 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(4, 'Presupuesto')}
      </div>

      {/* Step 1: Type Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 1 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TravelCard id="resort" icon={Palmtree} title="Resorts & Villas" desc="Alojamiento de élite en las zonas más exclusivas" />
          <TravelCard id="yate" icon={Anchor} title="Chárter Náutico" desc="Yates privados con tripulación 5 estrellas" />
          <TravelCard id="experiencia" icon={Compass} title="Experiencias VIP" desc="Tours privados personalizados por especialistas" />
          <TravelCard id="corporativo" icon={Plane} title="Retiros Ejecutivos" desc="Logística integral para operaciones corporativas" />
        </div>
        <div className="mt-10 flex justify-end">
          <button 
            disabled={!quote.tipo}
            onClick={() => setStep(2)}
            className="flex items-center gap-4 px-8 py-3 bg-primary text-black font-bold uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_20px_rgba(230,193,90,0.3)] disabled:opacity-50 transition-all hover:translate-x-1 rounded-none"
          >
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 2: Plan Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 2 ? 'opacity-100 translate-x-0 block' : 'hidden translate-x-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRAVEL_PLAN_TIERS.map(plan => (
            <PlanSelectorCard key={plan.id} id={plan.id} title={plan.title} desc={plan.desc} />
          ))}
        </div>
        <div className="mt-12 flex justify-between">
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-4 px-8 py-3 border border-primary/20 text-foreground/60 font-bold uppercase tracking-[0.2em] text-xs hover:text-primary transition-all rounded-none"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button 
            disabled={!quote.plan}
            onClick={() => setStep(3)}
            className="flex items-center gap-4 px-8 py-3 bg-primary text-black font-bold uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_20px_rgba(230,193,90,0.3)] disabled:opacity-50 transition-all hover:translate-x-1 rounded-none"
          >
            Continuar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 3: Details */}
      <div className={`transition-all duration-1000 relative z-10 ${step === 3 ? 'opacity-100 translate-x-0' : 'hidden translate-x-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-background/80 p-10 md:p-16 border border-primary/10 shadow-premium">
          {quote.tipo && TRAVEL_FIELDS[quote.tipo].map((field) => (
            <div key={field.id} className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">{field.label}</label>
              {field.type === 'select' ? (
                <div className="relative group">
                  <select 
                    className="w-full bg-background/80 border border-primary/10 p-6 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer font-bold tracking-widest"
                    onChange={(e) => handleDataChange(field.id, e.target.value)}
                    value={quote.datos[field.id] || ""}
                  >
                    <option value="" disabled className="bg-background text-foreground/30">Seleccionar Opción...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt} className="bg-background text-foreground">{opt}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              ) : (
                <input 
                  type={field.type}
                  className="w-full bg-background/80 border border-primary/10 p-6 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-foreground/10 font-bold tracking-widest"
                  placeholder={`Defina su ${field.label.toLowerCase()}`}
                  onChange={(e) => handleDataChange(field.id, e.target.value)}
                  value={quote.datos[field.id] || ""}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Navigation Details */}
        <div className="mt-12 flex justify-between">
          <button 
            onClick={() => setStep(2)}
            className="flex items-center gap-4 px-8 py-3 border border-primary/20 text-foreground/60 font-bold uppercase tracking-[0.2em] text-xs hover:text-primary transition-all rounded-none"
          >
            <ArrowLeft className="w-4 h-4" /> Atrás
          </button>
          <button 
            disabled={Object.keys(quote.datos).length === 0}
            onClick={() => setStep(4)}
            className="flex items-center gap-4 px-8 py-3 bg-primary text-black font-bold uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_20px_rgba(230,193,90,0.3)] disabled:opacity-50 transition-all hover:translate-x-1 rounded-none"
          >
            Ver Propuesta <Check className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 4: Result */}
      <div className={`transition-all duration-700 relative z-10 ${step === 4 ? 'opacity-100 translate-x-0' : 'hidden translate-x-10'}`}>
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-serif text-primary">Propuesta {TRAVEL_PLAN_TIERS.find(p => p.id === quote.plan)?.title || 'Generada'}</h3>
          <p className="text-xs text-foreground/50 tracking-widest uppercase mt-2">Valores Exclusivos para Clientes VIP</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border border-primary/20 bg-background/80 shadow-premium">
            <h4 className="text-xs uppercase tracking-[0.4em] text-foreground/40 mb-6">Presupuesto Referencial</h4>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl text-foreground/50">$</span>
              <span className="text-5xl font-serif text-primary">{quote.totalEstimado.toLocaleString()}</span>
              <span className="text-xs text-foreground/40 uppercase tracking-widest">USD Estimado</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-foreground/50">Reserva con</span>
              <span className="text-xl font-serif text-foreground">${quote.deposito.toLocaleString()}</span>
              <span className="text-xs text-foreground/40 uppercase tracking-widest">(30%)</span>
            </div>
            
            <div className="h-[1px] bg-primary/10 w-full my-6" />
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-xs text-foreground/60"><Check className="w-4 h-4 text-primary" /> {quote.plan === 'platinum' ? 'Lifestyle Manager Personal 24/7' : 'Asesor de viajes dedicado'}</li>
              <li className="flex items-center gap-3 text-xs text-foreground/60"><Check className="w-4 h-4 text-primary" /> Acceso prioritario a amenidades VIP</li>
              <li className="flex items-center gap-3 text-xs text-foreground/60"><Check className="w-4 h-4 text-primary" /> Garantía de Satisfacción Novo Heritage</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 justify-center">
            <button className="flex items-center justify-between p-4 border border-primary/20 hover:bg-primary/5 transition-colors group rounded-none bg-background/50">
              <span className="text-xs uppercase tracking-widest font-bold">Contactar Lifestyle Manager</span>
              <Target className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
            <button className="flex items-center justify-between p-4 border border-primary/20 hover:bg-primary/5 transition-colors group rounded-none bg-background/50">
              <span className="text-xs uppercase tracking-widest font-bold">Enviar Paquete Detallado al Correo</span>
              <Mail className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
            <button className="flex items-center justify-between p-4 border border-primary/20 hover:bg-primary/5 transition-colors group rounded-none bg-background/50">
              <span className="text-xs uppercase tracking-widest font-bold">Descargar Itinerario Referencial</span>
              <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-12 flex justify-start">
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-4 px-8 py-3 border border-primary/20 text-foreground/60 font-bold uppercase tracking-[0.2em] text-xs hover:text-primary transition-all rounded-none"
          >
            <ArrowLeft className="w-4 h-4" /> Diseñar Nuevo Viaje
          </button>
        </div>
      </div>
    </div>
  )
}

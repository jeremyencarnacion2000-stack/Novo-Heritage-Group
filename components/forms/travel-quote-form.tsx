"use client"

import { useState, useEffect } from "react"
// @ts-ignore
import { Plane, Calendar, MapPin, Users, Check, Sparkles, ArrowRight, ArrowLeft, Target, Mail, Download, Palmtree, Compass, Anchor, ChevronRight, Landmark, Shield, Globe } from "lucide-react"

type TravelType = 'resort' | 'experiencia' | 'yate' | 'corporativo' | 'consular'

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
  ],
  'consular': [
    { id: 'pais', label: 'País de Interés', type: 'select', options: ['Estados Unidos', 'Europa / Schengen', 'Canadá', 'Reino Unido', 'Otro'] },
    { id: 'servicio', label: 'Tipo de Servicio', type: 'select', options: ['Primera Vez', 'Renovación', 'Asesoría de Perfil', 'Creación de Cuenta / Citas'] },
    { id: 'visa', label: 'Tipo de Visa', type: 'select', options: ['Turismo / B1/B2', 'Trabajo / Negocios', 'Estudios / F1', 'Residencia / Otros'] },
    { id: 'urgencia', label: 'Disponibilidad requerida', type: 'select', options: ['Normal', 'Urgente / Emergencia'] },
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
    if (quote.tipo && Object.keys(quote.datos).length > 1 && quote.plan) {
      let base = 5000
      if (quote.tipo === 'yate') base = 8500
      if (quote.tipo === 'corporativo') base = 25000
      if (quote.tipo === 'experiencia') base = 3500
      if (quote.tipo === 'consular') base = 450 // Base for consular service

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
        message: `Solicitud de diseño: ${quote.tipo} - Plan ${quote.plan}. País: ${quote.datos.pais || 'N/D'}`,
        source: "cotizador_viajes_premium",
        details: {
          ...quote.datos,
          plan: quote.plan,
          tipo: quote.tipo,
          presupuesto_estimado: quote.totalEstimado,
          deposito_requerido: quote.deposito,
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
      <div className="absolute top-0 right-[-100px] w-[600px] h-[600px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-serif mb-4 leading-tight px-4">
          Solicitud de <span className="italic text-primary">Servicios</span>
        </h2>
        <p className="text-foreground/50 text-xs md:text-sm tracking-widest uppercase px-4">Concierge & Asesoría Novo Heritage</p>
      </div>

      <div className="flex justify-center items-center gap-2 md:gap-4 mb-12 relative z-10 w-full overflow-x-auto px-4 pb-4 scrollbar-hide">
        {renderStepIcon(1, 'Categoría')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 1 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(2, 'Prioridad')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 2 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(3, 'Detalles')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 3 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(4, 'Contacto')}
      </div>

      {/* Step 1: Type Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 1 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TravelCard id="consular" icon={Landmark} title="Asesoría Consular" desc="Gestión de visas USA, Schengen y otros trámites legales" />
          <TravelCard id="resort" icon={Palmtree} title="Resorts & Villas" desc="Alojamiento de élite en las zonas más exclusivas" />
          <TravelCard id="experiencia" icon={Compass} title="Viajes de Autor" desc="Tours privados personalizados por especialistas" />
          <TravelCard id="yate" icon={Anchor} title="Chárter Náutico" desc="Yates privados con tripulación 5 estrellas" />
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
          <button onClick={() => setStep(1)} className="px-8 py-3 border border-primary/20 text-foreground/60 text-xs uppercase tracking-widest font-bold">Volver</button>
        </div>
      </div>

      {/* Step 3: Details */}
      <div className={`transition-all duration-1000 relative z-10 ${step === 3 ? 'opacity-100 translate-x-0' : 'hidden translate-x-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-background/80 p-8 border border-primary/10 shadow-premium">
          {quote.tipo && TRAVEL_FIELDS[quote.tipo].map((field) => (
            <div key={field.id} className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">{field.label}</label>
              {field.type === 'select' ? (
                <div className="relative group">
                  <select 
                    className="w-full bg-background/80 border border-primary/10 p-5 text-xs text-foreground focus:border-primary focus:outline-none appearance-none cursor-pointer font-bold tracking-widest"
                    onChange={(e) => handleDataChange(field.id, e.target.value)}
                    value={quote.datos[field.id] || ""}
                  >
                    <option value="" disabled>Seleccionar...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 pointer-events-none rotate-90" />
                </div>
              ) : (
                <input 
                  type={field.type}
                  className="w-full bg-background/80 border border-primary/10 p-5 text-xs text-foreground focus:border-primary focus:outline-none"
                  onChange={(e) => handleDataChange(field.id, e.target.value)}
                  value={quote.datos[field.id] || ""}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-between">
          <button onClick={() => setStep(2)} className="px-8 py-3 border border-primary/20 text-foreground/60 text-xs">Atrás</button>
          <button onClick={() => setStep(4)} className="px-10 py-3 bg-primary text-black font-bold uppercase tracking-widest text-xs">Continuar</button>
        </div>
      </div>

      {/* Step 4: Contact & Submission */}
      <div className={`transition-all duration-700 relative z-10 ${step === 4 ? 'opacity-100 translate-x-0' : 'hidden translate-x-10'}`}>
        <div className="max-w-2xl mx-auto space-y-8 bg-background/80 p-10 border border-primary/10 shadow-premium">
            <div className="text-center mb-10">
               <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
               <h3 className="text-2xl font-serif">Datos de Contacto</h3>
               <p className="text-foreground/40 text-xs uppercase tracking-widest mt-2">Seguridad y Confidencialidad Novo Heritage</p>
            </div>
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-black text-primary/60">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="w-full bg-background/50 border border-primary/10 p-5 text-xs focus:border-primary outline-none" 
                    placeholder="Ej. Juan Pérez"
                    value={quote.name}
                    onChange={(e) => setQuote(prev => ({...prev, name: e.target.value}))}
                  />
               </div>
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-primary/60">Correo Electrónico</label>
                     <input 
                        type="email" 
                        className="w-full bg-background/50 border border-primary/10 p-5 text-xs focus:border-primary outline-none" 
                        placeholder="juan@ejemplo.com"
                        value={quote.email}
                        onChange={(e) => setQuote(prev => ({...prev, email: e.target.value}))}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest font-black text-primary/60">Teléfono / WhatsApp</label>
                     <input 
                        type="tel" 
                        className="w-full bg-background/50 border border-primary/10 p-5 text-xs focus:border-primary outline-none" 
                        placeholder="+1 809..."
                        value={quote.phone}
                        onChange={(e) => setQuote(prev => ({...prev, phone: e.target.value}))}
                     />
                  </div>
               </div>
            </div>
            <button 
               onClick={handleSubmit} 
               disabled={isSubmitting}
               className="w-full mt-10 py-6 bg-primary text-black font-black uppercase tracking-[0.4em] text-xs hover:shadow-[0_0_30px_rgba(230,193,90,0.4)] transition-all flex items-center justify-center gap-4"
            >
               {isSubmitting ? 'Procesando...' : 'Solicitar Asesoría VIP'} <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="flex flex-col items-center justify-center text-center p-20 animate-fade-in">
           <div className="w-24 h-24 bg-primary/10 flex items-center justify-center mb-10">
              <Check className="w-12 h-12 text-primary" />
           </div>
           <h3 className="text-4xl font-serif text-primary mb-6">Solicitud Recibida</h3>
           <p className="text-foreground/50 max-w-lg mx-auto font-light leading-relaxed">
              Un Lifestyle Manager de Novo Heritage se pondrá en contacto con usted en las próximas 24 horas para dar inicio a su proceso personalizado.
           </p>
           <button onClick={() => setStep(1)} className="mt-12 text-xs font-bold uppercase tracking-widest text-primary hover:underline">Diseñar otra solicitud</button>
        </div>
      )}
    </div>
  )
}

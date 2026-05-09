"use client"

import { useState, useEffect } from "react"
// @ts-ignore
import { Home, Building, Building2, Map, Check, Sparkles, ArrowRight, ArrowLeft, Target, Mail, Download, Key, Plane, Shield, ChevronRight } from "lucide-react"

type RealEstateType = 'residencial' | 'comercial' | 'inversion'

interface RealEstateQuoteData {
  tipo: RealEstateType | null
  plan: 'esencial' | 'elite' | 'patrimonial' | null
  datos: Record<string, string | number>
  roiMensual: number
  roiAnual: number
}

interface RealEstateFormField {
  id: string
  label: string
  type: 'select' | 'text' | 'number'
  options?: string[]
}

const REAL_ESTATE_FIELDS: Record<RealEstateType, RealEstateFormField[]> = {
  'residencial': [
    { id: 'propiedad', label: 'Tipo de Propiedad', type: 'select', options: ['Villa Luxury', 'Penthouse', 'Casa Independiente', 'Condo Exclusivo'] },
    { id: 'zona', label: 'Zona Geográfica Prmium', type: 'select', options: ['Piantini / Naco', 'Punta Cana Village', 'Cap Cana', 'Casa de Campo'] },
    { id: 'habitaciones', label: 'Recámaras / Habitaciones', type: 'number' },
    { id: 'presupuesto', label: 'Presupuesto Estimado (USD)', type: 'select', options: ['500k - 1M', '1M - 3M', 'Más de 3M'] },
  ],
  'comercial': [
    { id: 'tipo', label: 'Categoría Comercial', type: 'select', options: ['Torre Corporativa / Oficinas', 'Plaza Comercial', 'Local Retail VIP', 'Nave Industrial'] },
    { id: 'metros', label: 'Metros Cuadrados Necesarios', type: 'number' },
    { id: 'financiamiento', label: 'Requiere Estructuración Financiera', type: 'select', options: ['Sí, con Banca Local', 'Sí, Fideicomiso', 'No, Capital Propio'] },
  ],
  'inversion': [
    { id: 'perfil', label: 'Perfil de Inversión', type: 'select', options: ['Airbnb / Renta Corta', 'Renta Larga / Estabilidad', 'Plusvalía / Pre-Venta'] },
    { id: 'monto', label: 'Capital Disponbile (USD)', type: 'select', options: ['Hasta 250k', '250k - 500k', '500k - 1M', 'Más de 1M'] },
    { id: 'plazo', label: 'Horizonte de Retorno', type: 'select', options: ['Inmediato (Listed)', 'Mediano (En construcción)', 'Largo (Planos)'] },
  ]
}

export function RealEstateQuoteForm({ defaultType = 'residencial' }: { defaultType?: RealEstateType }) {
  const [step, setStep] = useState(1)
  const [quote, setQuote] = useState<RealEstateQuoteData>({
    tipo: defaultType,
    plan: null,
    datos: {},
    roiAnual: 0,
    roiMensual: 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)

  // Mock financial projection engine
  useEffect(() => {
    if (quote.tipo && quote.plan && Object.keys(quote.datos).length >= 2) {
      let multiplier = 1.0
      if (quote.plan === 'elite') multiplier = 1.2
      if (quote.plan === 'patrimonial') multiplier = 1.5

      let baseYield = 8.5 
      if (quote.tipo === 'comercial') baseYield = 10.5
      if (quote.tipo === 'inversion') baseYield = 12.0
      if (quote.tipo === 'residencial') baseYield = 6.0
      
      const assumedCapital = 500000 
      const annualReturn = assumedCapital * (baseYield / 100) * multiplier
      
      setQuote(prev => ({
        ...prev,
        roiAnual: annualReturn,
        roiMensual: annualReturn / 12
      }))
    }
  }, [quote.datos, quote.tipo, quote.plan])

  const handleSubmitLead = async (action: string) => {
    if (!contactData.name || !contactData.email) {
      setStep(5); // Go to contact step
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        division: 'bienes_raices',
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        message: `Interés en: ${action}. Proyectado: $${quote.roiAnual.toLocaleString()} anual.`,
        source: 'quote_form',
        details: {
          category: quote.tipo,
          plan: quote.plan,
          roiAnual: quote.roiAnual,
          ...quote.datos
        }
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDataChange = (id: string, value: string) => {
    setQuote(prev => {
      const newDatos = { ...prev.datos, [id]: value };
      
      // Auto-advance logic for Step 3
      if (step === 3 && prev.tipo) {
        const fields = REAL_ESTATE_FIELDS[prev.tipo];
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

  const RealEstateCard = ({ id, icon: Icon, title, desc }: { id: RealEstateType, icon: any, title: string, desc: string }) => (
    <button
      onClick={() => {
        setQuote(prev => ({ ...prev, tipo: id, datos: {} }))
        setTimeout(() => setStep(2), 400)
      }}
      className={`text-left p-8 transition-all duration-700 border group hover:border-primary/50 hover:bg-primary/5 w-full bg-background/50
        ${quote.tipo === id ? 'border-primary bg-primary/10 shadow-premium scale-[1.02]' : 'border-primary/10 bg-background/40 hover:scale-[1.01]'}`}
    >
      <Icon className={`w-10 h-10 mb-6 transition-colors duration-300 ${quote.tipo === id ? 'text-primary' : 'text-foreground/40 group-hover:text-primary'}`} />
      <h4 className="font-serif text-2xl text-foreground mb-3">{title}</h4>
      <p className="text-sm text-foreground/60 tracking-wider font-light leading-relaxed">{desc}</p>
    </button>
  )

  return (
    <div className="w-full bg-background text-foreground min-h-[60vh] flex flex-col relative overflow-hidden font-sans px-4 md:px-10">
      {/* Premium Background FX */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-serif mb-4 leading-tight px-4">
          Patrimonio <span className="italic text-primary">Inmobiliario</span>
        </h2>
        <p className="text-foreground/50 text-xs md:text-sm tracking-widest uppercase px-4">Proyección Financiera & Adquisición</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center items-center gap-4 mb-12 relative z-10 px-4 scale-90 md:scale-100">
        {renderStepIcon(1, 'Categoría')}
        <div className={`w-8 md:w-12 h-[1px] ${step > 1 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(2, 'Estrategia')}
        <div className={`w-8 md:w-12 h-[1px] ${step > 2 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(3, 'Parámetros')}
        <div className={`w-8 md:w-12 h-[1px] ${step > 3 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(4, 'Proyección')}
      </div>

      {/* Step 1: Type Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 1 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RealEstateCard id="residencial" icon={Home} title="Residencial Lujo" desc="Villas y properties premium para uso propio" />
          <RealEstateCard id="inversion" icon={Building} title="Inversión y Retorno" desc="Búsqueda de alta rentabilidad inmobiliaria (ROI)" />
          <RealEstateCard id="comercial" icon={Building2} title="Estructuras Corporativas" desc="Centros de negocios, torres y locales VIP" />
        </div>
        <div className="mt-10 flex justify-end">
          <p className="text-xs text-foreground/30 uppercase tracking-[0.3em]">Seleccione una categoría para continuar</p>
        </div>
      </div>

      {/* Step 2: Strategy / Tier Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 2 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'esencial', title: 'Portafolio Esencial', desc: 'Acceso a unidades pre-venta con alta plusvalía proyectada.', icon: Target },
            { id: 'elite', title: 'Selección Elite', desc: 'Propiedades en zonas consolidadas con flujo de caja inmediato.', icon: Sparkles },
            { id: 'patrimonial', title: 'Fondo Patrimonial', desc: 'Activos de alto valor, trofeos inmobiliarios y rentas corporativas.', icon: Key },
          ].map((plan) => (
            <button
              key={plan.id}
              onClick={() => {
                setQuote(prev => ({ ...prev, plan: plan.id as any }))
                setTimeout(() => setStep(3), 400)
              }}
              className={`text-left p-10 border transition-all duration-700 group hover:scale-[1.02] bg-background/50
                ${quote.plan === plan.id ? 'border-primary ring-1 ring-primary/30 bg-primary/5 shadow-premium' : 'border-primary/10 hover:border-primary/40'}`}
            >
              <plan.icon className={`w-10 h-10 mb-8 ${quote.plan === plan.id ? 'text-primary' : 'text-foreground/20 group-hover:text-primary'} transition-colors`} />
              <h4 className="font-serif text-3xl text-foreground mb-6">{plan.title}</h4>
              <p className="text-xs text-foreground/50 leading-relaxed tracking-widest font-black uppercase">{plan.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-10 flex justify-between">
           <button onClick={() => setStep(1)} className="px-8 py-4 border border-primary/20 text-foreground/40 hover:text-primary transition-all text-xs font-black uppercase tracking-widest">Atrás</button>
           <p className="text-xs text-foreground/30 uppercase tracking-[0.3em] self-center">Seleccione un plan para continuar</p>
        </div>
      </div>

          <div className={`transition-all duration-1000 relative z-10 ${step === 3 ? 'opacity-100 translate-y-0' : 'hidden translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-background/80 p-10 md:p-16 border border-primary/10 shadow-premium">
          {quote.tipo && REAL_ESTATE_FIELDS[quote.tipo].map((field) => (
            <div key={field.id} className="flex flex-col gap-4">
              <label className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">{field.label}</label>
              {field.type === 'select' ? (
                <div className="relative group">
                  <select 
                    className="w-full bg-background/80 border border-primary/10 p-6 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer font-bold tracking-widest"
                    onChange={(e) => handleDataChange(field.id, e.target.value)}
                    value={String(quote.datos[field.id] || "")}
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
                  value={String(quote.datos[field.id] || "")}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex justify-between">
          <button onClick={() => setStep(2)} className="px-8 py-4 border border-primary/20 text-foreground/40 hover:text-primary transition-all text-xs font-black uppercase tracking-widest">Atrás</button>
          <button 
            disabled={Object.keys(quote.datos).length < 2}
            onClick={() => setStep(4)}
            className="btn-premium px-10 py-4"
          >
            Obtener Proyección <Map className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Step 4: Result */}
      <div className={`transition-all duration-700 relative z-10 ${step === 4 ? 'opacity-100 translate-y-0' : 'hidden'}`}>
        {submitted ? (
          <div className="text-center p-20 border border-primary/20 bg-primary/5">
            <Check className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-serif text-foreground mb-4">Solicitud Recibida</h3>
            <p className="text-foreground/60 text-sm tracking-widest uppercase">Un Portfolio Manager se pondrá en contacto con usted en breve.</p>
            <button onClick={() => setStep(1)} className="mt-10 text-primary border-b border-primary text-xs uppercase tracking-widest">Nueva Consulta</button>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-6 animate-pulse" />
              <h3 className="text-4xl font-serif text-foreground mb-4">Proyección <span className="italic text-primary">Novo Heritage</span></h3>
              <p className="text-xs text-foreground/40 tracking-[0.4em] uppercase">Análisis algorítmico de plusvalía y flujo</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="p-10 border border-primary/20 bg-background/80 shadow-premium relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
                <h4 className="text-xs font-black uppercase tracking-[0.5em] text-primary/60 mb-8 underline decoration-primary/20 underline-offset-8">Estimación de Rendimiento</h4>
                
                <div className="space-y-10">
                  <div>
                    <p className="text-xs text-foreground/30 uppercase tracking-widest mb-3">Retorno Anual Proyectado (USD)</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-light text-primary/50">$</span>
                      <span className="text-6xl font-serif text-primary leading-none">{(quote.roiAnual || 0).toLocaleString()}</span>
                      <span className="text-xs font-bold text-primary/40 uppercase">Efectivo Anual</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-foreground/30 uppercase tracking-widest mb-3">Flujo de Caja Mensual Estimado</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs text-foreground/30">$</span>
                      <span className="text-3xl font-serif text-foreground">{(quote.roiMensual || 0).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                      <span className="text-xs font-bold text-foreground/20 uppercase tracking-widest">Ingreso Pasivo</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[1px] bg-primary/10 w-full my-10" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-primary/5 bg-white/5 rounded-none">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Plusvalía</p>
                    <p className="text-xs text-foreground/60">+12.4% Anual</p>
                  </div>
                  <div className="p-4 border border-primary/5 bg-white/5 rounded-none">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Impuestos</p>
                    <p className="text-xs text-foreground/60">Optimización Fiscal</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Solicitar Dosier de Inversión', icon: Download },
                  { label: 'Agendar Tour de Propiedades VIP', icon: Plane },
                  { label: 'Videollamada con Portfolio Manager', icon: Mail },
                  { label: 'Estructuración de Fideicomiso', icon: Shield },
                ].map((btn, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSubmitLead(btn.label)}
                    className="flex items-center justify-between p-6 border border-primary/10 bg-background/50 hover:bg-primary/5 hover:border-primary/40 transition-all group rounded-none"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-foreground/70 group-hover:text-primary">{btn.label}</span>
                    <btn.icon className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-4 px-12 py-5 border border-primary/20 text-foreground/30 hover:text-primary hover:border-primary transition-all text-xs font-black uppercase tracking-[0.4em] rounded-none"
              >
                <ArrowLeft className="w-4 h-4" /> Recalcular Escenario Patrimonial
              </button>
            </div>
          </>
        )}
      </div>

      {/* Step 5: Final Contact Details */}
      <div className={`transition-all duration-700 relative z-10 ${step === 5 ? 'opacity-100 translate-y-0' : 'hidden'}`}>
        <div className="max-w-xl mx-auto bg-background p-12 border border-primary/20 shadow-premium">
          <h3 className="text-2xl font-serif text-foreground mb-8 text-center">Confirmar Identidad <span className="italic text-primary">Patrimonial</span></h3>
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Nombre Completo</label>
              <input 
                type="text" 
                className="w-full bg-transparent border-b border-foreground/10 py-3 focus:border-primary outline-none transition-all"
                value={contactData.name}
                onChange={(e) => setContactData({...contactData, name: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Email Corporativo / Privado</label>
              <input 
                type="email" 
                className="w-full bg-transparent border-b border-foreground/10 py-3 focus:border-primary outline-none transition-all"
                value={contactData.email}
                onChange={(e) => setContactData({...contactData, email: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Teléfono de Contacto</label>
              <input 
                type="text" 
                className="w-full bg-transparent border-b border-foreground/10 py-3 focus:border-primary outline-none transition-all"
                value={contactData.phone}
                onChange={(e) => setContactData({...contactData, phone: e.target.value})}
              />
            </div>
            
            <button 
              disabled={isSubmitting || !contactData.name || !contactData.email}
              onClick={() => handleSubmitLead('Lead desde Cotizador')}
              className="w-full btn-premium py-6 mt-10"
            >
              {isSubmitting ? 'Procesando...' : 'Finalizar Gestión'}
            </button>
            <button onClick={() => setStep(4)} className="w-full text-[10px] uppercase tracking-widest text-foreground/30 mt-4">Volver a Proyección</button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
// @ts-ignore
import { Calculator, Download, Mail, Share2, Copy, Check, Car, Home, Shield, Building, Target, TrendingUp, Sparkles, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react"

type InsuranceType = 'auto' | 'hogar' | 'vida' | 'empresarial'

interface QuoteData {
  tipo: InsuranceType | null
  plan: string | null
  datos: Record<string, string | number>
  totalAnual: number
  totalMensual: number
}

const PLAN_TIERS = [
  { id: 'esencial', title: 'Cobertura Esencial', desc: 'Protección fundamental para tranquilidad diaria.', mult: 1 },
  { id: 'premium', title: 'Plan Premium', desc: 'Mayor alcance con deducibles reducidos.', mult: 1.5 },
  { id: 'vip', title: 'Nivel Elite / VIP', desc: 'Cero deducibles, alcance global y atención prioritaria.', mult: 2.5 }
]

interface FormField {
  id: string
  label: string
  type: 'select' | 'text' | 'number'
  options?: string[]
}

const INSURANCE_FIELDS: Record<InsuranceType, FormField[]> = {
  'auto': [
    { id: 'marca', label: 'Marca del Vehículo', type: 'select', options: ['Sedán Premium', 'SUV Lujo', 'Deportivo', 'Pickup 4x4'] },
    { id: 'año', label: 'Año de Fabricación', type: 'select', options: ['2025', '2024', '2023', '2022', 'Anterior'] },
    { id: 'valorVehiculo', label: 'Valor Estimado (USD)', type: 'number' },
    { id: 'cobertura', label: 'Nivel de Cobertura', type: 'select', options: ['Full Total', 'Premium / 0KM', 'Semi-Full'] },
  ],
  'hogar': [
    { id: 'tipoPropiedad', label: 'Tipo de Residencia', type: 'select', options: ['Villa de Lujo', 'Penthouse', 'Casa Independiente', 'Apartamento'] },
    { id: 'valorPropiedad', label: 'Valor del Inmueble (USD)', type: 'number' },
    { id: 'seguridad', label: 'Sistema de Seguridad', type: 'select', options: ['Seguridad 24/7 (Gated) ', 'Cámaras + Alarma', 'Básica'] },
  ],
  'vida': [
    { id: 'edad', label: 'Edad', type: 'number' },
    { id: 'sumaAsegurada', label: 'Suma Asegurada Deseada (USD)', type: 'select', options: ['$100,000+', '$500,000+', '$1,000,000+'] },
    { id: 'profesion', label: 'Perfil Ocupacional', type: 'select', options: ['Ejecutivo C-Level', 'Empresario', 'Profesional'] },
  ],
  'empresarial': [
    { id: 'tipoEmpresa', label: 'Sector Empresarial', type: 'select', options: ['Servicios Financieros', 'Bienes Raíces', 'Comercio Lujo', 'Tecnología'] },
    { id: 'ingresos', label: 'Ingresos Anuales Estimados (USD)', type: 'select', options: ['Menos de 1M', '1M - 5M', 'Más de 5M'] },
    { id: 'empleados', label: 'Número de Empleados', type: 'number' },
  ]
}

export function InsuranceQuoteForm({ defaultType = 'auto' }: { defaultType?: InsuranceType }) {
  const [step, setStep] = useState(1)
  const [quote, setQuote] = useState<QuoteData>({
    tipo: defaultType,
    plan: null,
    datos: {},
    totalAnual: 0,
    totalMensual: 0
  })

  const handleDataChange = (id: string, value: string) => {
    setQuote(prev => {
      const newDatos = { ...prev.datos, [id]: value };
      
      // Auto-advance logic for Step 3
      if (step === 3 && prev.tipo) {
        const fields = INSURANCE_FIELDS[prev.tipo];
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

  // Auto-calculate dummy pricing for the Premium vibe
  useEffect(() => {
    if (quote.tipo && Object.keys(quote.datos).length > 2 && quote.plan) {
      let base = 2500
      if (quote.tipo === 'empresarial') base = 8500
      if (quote.tipo === 'hogar') base = 3500
      if (quote.tipo === 'vida') base = 4200
      
      const planMultiplier = PLAN_TIERS.find(p => p.id === quote.plan)?.mult || 1;
      
      setQuote(prev => ({
        ...prev,
        totalAnual: base * planMultiplier,
        totalMensual: (base * planMultiplier) / 12
      }))
    }
  }, [quote.datos, quote.tipo, quote.plan])

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

  const ServiceCard = ({ id, icon: Icon, title, desc }: { id: InsuranceType, icon: any, title: string, desc: string }) => (
    <button
      onClick={() => {
        setQuote(prev => ({ ...prev, tipo: id, plan: null, datos: {} }))
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

  const PlanSelectorCard = ({ id, title, desc }: { id: string, title: string, desc: string }) => (
    <button
      onClick={() => {
        setQuote(prev => ({ ...prev, plan: id }))
        setTimeout(() => setStep(3), 400)
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
    <div className="w-full bg-background text-foreground min-h-[60vh] flex flex-col relative overflow-hidden font-sans px-4 md:px-10">
      {/* Premium Background FX */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-none bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-serif mb-4 leading-tight px-4">
          Arquitectura <span className="italic text-primary">Predictiva</span>
        </h2>
        <p className="text-foreground/50 text-xs md:text-sm tracking-widest uppercase px-4">Motor de Cotización Patrimonial</p>
      </div>

      {/* Steps Indicator */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-12 relative z-10 w-full overflow-x-auto px-4 pb-4 scrollbar-hide">
        {renderStepIcon(1, 'Línea')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 1 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(2, 'Plan')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 2 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(3, 'Perfil')}
        <div className={`w-6 md:w-12 h-[1px] ${step > 3 ? 'bg-primary' : 'bg-foreground/10'} transition-colors duration-500`} />
        {renderStepIcon(4, 'Propuesta')}
      </div>

      {/* Step 1: Type Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 1 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ServiceCard id="auto" icon={Car} title="Auto Premium" desc="Blindaje VIP para vehículos de alto estándar y flotillas" />
          <ServiceCard id="hogar" icon={Home} title="Residencia Elite" desc="Protección integral para villas y propiedades exclusivas" />
          <ServiceCard id="vida" icon={Shield} title="Vida & Legado" desc="Estrategias de sucesión y seguridad familiar" />
          <ServiceCard id="empresarial" icon={Building} title="Corporativo" desc="Estructuras de cobertura para empresas y multinacionales" />
        </div>
        <div className="mt-10 flex justify-end">
          <p className="text-xs text-foreground/30 uppercase tracking-[0.3em]">Seleccione una línea para continuar</p>
        </div>
      </div>

      {/* Step 2: Plan Selection */}
      <div className={`transition-all duration-700 relative z-10 ${step === 2 ? 'opacity-100 translate-x-0 block' : 'hidden translate-x-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_TIERS.map(plan => (
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
          <p className="text-xs text-foreground/30 uppercase tracking-[0.3em] self-center">Seleccione un plan para continuar</p>
        </div>
      </div>

      {/* Step 3: Details */}
      <div className={`transition-all duration-1000 relative z-10 ${step === 3 ? 'opacity-100 translate-x-0' : 'hidden translate-x-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-background/80 p-10 md:p-16 border border-primary/10 shadow-premium">
          {quote.tipo && INSURANCE_FIELDS[quote.tipo].map((field) => (
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
            Generar Propuesta <Calculator className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step 4: Result */}
      <div className={`transition-all duration-700 relative z-10 ${step === 4 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-serif text-primary">Propuesta {PLAN_TIERS.find(p => p.id === quote.plan)?.title || 'Generada'}</h3>
          <p className="text-xs text-foreground/50 tracking-widest uppercase mt-2">Cotización Referencial Sujeta a Aprobación</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border border-primary/20 bg-background/80 shadow-premium">
            <h4 className="text-xs uppercase tracking-[0.4em] text-foreground/40 mb-6">Inversión Estimada</h4>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl text-foreground/50">$</span>
              <span className="text-5xl font-serif text-primary">{quote.totalAnual.toLocaleString()}</span>
              <span className="text-xs text-foreground/40 uppercase tracking-widest">/ Anual</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-foreground/50">$</span>
              <span className="text-xl font-serif text-foreground">{quote.totalMensual.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
              <span className="text-xs text-foreground/40 uppercase tracking-widest">/ Mensual (Financiamiento)</span>
            </div>
            
            <div className="h-[1px] bg-primary/10 w-full my-6" />
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-xs text-foreground/60"><Check className="w-4 h-4 text-primary" /> {quote.plan === 'vip' ? 'Cobertura Cero Deducible (VIP)' : 'Deducible Acorde al Plan'}</li>
              <li className="flex items-center gap-3 text-xs text-foreground/60"><Check className="w-4 h-4 text-primary" /> Asesoría Legal Dedicada 24/7</li>
              <li className="flex items-center gap-3 text-xs text-foreground/60"><Check className="w-4 h-4 text-primary" /> Ajustadores Priority Service</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 justify-center">
            <button className="flex items-center justify-between p-4 border border-primary/20 glass-architectural hover:bg-primary/5 transition-colors group rounded-none">
              <span className="text-xs uppercase tracking-widest font-bold">Solicitar Asesor</span>
              <Target className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
            <button className="flex items-center justify-between p-4 border border-primary/20 glass-architectural hover:bg-primary/5 transition-colors group rounded-none">
              <span className="text-xs uppercase tracking-widest font-bold">Enviar Resumen VIP por Email</span>
              <Mail className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
            <button className="flex items-center justify-between p-4 border border-primary/20 glass-architectural hover:bg-primary/5 transition-colors group rounded-none">
              <span className="text-xs uppercase tracking-widest font-bold">Descargar PDF Certificado</span>
              <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-12 flex justify-start">
          <button 
            onClick={() => setStep(1)}
            className="flex items-center gap-4 px-8 py-3 border border-primary/20 text-foreground/60 font-bold uppercase tracking-[0.2em] text-xs hover:text-primary transition-all rounded-none"
          >
            <ArrowLeft className="w-4 h-4" /> Nueva Cotización
          </button>
        </div>
      </div>
    </div>
  )
}

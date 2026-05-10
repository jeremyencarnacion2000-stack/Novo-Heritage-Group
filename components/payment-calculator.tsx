"use client"

import React, { useState, useEffect } from "react"
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface PaymentCalculatorProps {
    propertyPrice: number
    className?: string
}

export function PaymentCalculator({ propertyPrice, className }: PaymentCalculatorProps) {
    const [downPaymentPercent, setDownPaymentPercent] = useState(20)
    const [interestRate, setInterestRate] = useState(8.5)
    const [loanTerm, setLoanTerm] = useState(20)
    const [monthlyPayment, setMonthlyPayment] = useState(0)
    const [totalPayment, setTotalPayment] = useState(0)
    const [totalInterest, setTotalInterest] = useState(0)

    useEffect(() => {
        const principal = propertyPrice * (1 - downPaymentPercent / 100)
        const monthlyRate = interestRate / 100 / 12
        const numberOfPayments = loanTerm * 12

        if (monthlyRate === 0) {
            const payment = principal / numberOfPayments
            setMonthlyPayment(payment)
            setTotalPayment(principal)
            setTotalInterest(0)
        } else {
            const x = Math.pow(1 + monthlyRate, numberOfPayments)
            const payment = (principal * x * monthlyRate) / (x - 1)
            
            setMonthlyPayment(payment)
            setTotalPayment(payment * numberOfPayments)
            setTotalInterest((payment * numberOfPayments) - principal)
        }
    }, [propertyPrice, downPaymentPercent, interestRate, loanTerm])

    return (
        <div className={cn("bg-background/40 backdrop-blur-md border border-primary/10 p-8 md:p-12 shadow-premium relative overflow-hidden group", className)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-serif text-foreground">Calculadora de Pagos</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Proyección de Inversión Patrimonial</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="text-[10px] uppercase tracking-widest text-primary/60 font-black">Enganche ({downPaymentPercent}%)</Label>
                            <span className="text-sm font-light">${(propertyPrice * downPaymentPercent / 100).toLocaleString()}</span>
                        </div>
                        <Slider 
                            value={[downPaymentPercent]} 
                            onValueChange={(v) => setDownPaymentPercent(v[0])}
                            max={90}
                            min={5}
                            step={5}
                            className="py-4"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="text-[10px] uppercase tracking-widest text-primary/60 font-black">Tasa de Interés ({interestRate}%)</Label>
                            <Percent className="w-3 h-3 text-primary/40" />
                        </div>
                        <Slider 
                            value={[interestRate]} 
                            onValueChange={(v) => setInterestRate(v[0])}
                            max={20}
                            min={1}
                            step={0.1}
                            className="py-4"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label className="text-[10px] uppercase tracking-widest text-primary/60 font-black">Plazo ({loanTerm} años)</Label>
                            <Calendar className="w-3 h-3 text-primary/40" />
                        </div>
                        <Slider 
                            value={[loanTerm]} 
                            onValueChange={(v) => setLoanTerm(v[0])}
                            max={30}
                            min={1}
                            step={1}
                            className="py-4"
                        />
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 p-8 flex flex-col justify-center relative">
                    <div className="space-y-1 mb-8">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/40 font-bold">Cuota Mensual Estimada</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-light text-primary/60">$</span>
                            <span className="text-5xl font-serif text-primary leading-none">{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-primary/10">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                            <span className="text-foreground/40 font-bold">Monto a Financiar</span>
                            <span className="text-foreground/80">${(propertyPrice * (1 - downPaymentPercent / 100)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                            <span className="text-foreground/40 font-bold">Total Intereses</span>
                            <span className="text-foreground/80">${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest pt-2 border-t border-primary/5">
                            <span className="text-primary font-black">Pago Total</span>
                            <span className="text-primary font-black">${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-start gap-2 p-3 bg-background/50 border border-primary/5">
                        <Info className="w-3 h-3 text-primary/40 shrink-0 mt-0.5" />
                        <p className="text-[8px] uppercase tracking-tighter text-foreground/30 leading-tight">
                            Esta calculadora es una herramienta de referencia. Los términos finales dependen de la institución financiera y el perfil crediticio del solicitante.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

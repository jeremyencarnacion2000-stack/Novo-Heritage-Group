"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function PropertyContactForm({ propertyId }: { propertyId: string }) {
  const { toast } = useToast()
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", message: "" })
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      toast({ title: "Falta información", description: "Nombre y correo son obligatorios" })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: "bienes_raices",
          propertyId,
          ...form,
          source: "property_detail_page",
        }),
      })
      if (res.ok) {
        toast({ title: "Solicitud enviada", description: "Un asesor te contactará pronto." })
        setForm({ name: "", email: "", phone: "", message: "" })
      } else {
        toast({ title: "Error al enviar", description: "Intenta nuevamente más tarde." })
      }
    } catch (err) {
      toast({ title: "Error de red", description: "Revisa tu conexión e inténtalo otra vez." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 809..." />
        </div>
        <div className="space-y-1">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Cuéntanos qué te interesa" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  )
}


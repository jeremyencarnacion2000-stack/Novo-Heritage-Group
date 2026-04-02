"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Check, Bell, Settings, Lock, Mail } from "lucide-react"

export function SettingsManager() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = () => {
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast.success("Configuración guardada correctamente")
        }, 1000)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Configuración Global</h2>
                    <p className="text-muted-foreground">Administra las preferencias generales del sistema CRM.</p>
                </div>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? "Guardando..." : <><Check className="mr-2 h-4 w-4" /> Guardar Cambios</>}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Empresa</CardTitle>
                            <CardDescription>Detalles básicos que aparecerán en reportes y correos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company-name">Nombre de la Empresa</Label>
                                    <Input id="company-name" defaultValue="Inmobiliaria Heritage" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-email">Email de Contacto</Label>
                                    <Input id="contact-email" defaultValue="contacto@heritage.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección Física</Label>
                                <Textarea id="address" defaultValue="Av. Principal 123, Ciudad de México, CDMX" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input id="phone" defaultValue="+52 55 1234 5678" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Sitio Web</Label>
                                    <Input id="website" defaultValue="https://heritage.com" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias Regionales</CardTitle>
                            <CardDescription>Configuración de moneda, zona horaria e idioma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Moneda Principal</Label>
                                    <Input defaultValue="MXN - Peso Mexicano" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zona Horaria</Label>
                                    <Input defaultValue="(GMT-06:00) Central Time (US & Canada)" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Idioma</Label>
                                    <Input defaultValue="Español (Latinoamérica)" disabled />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Alertas por Correo</CardTitle>
                            <CardDescription>Configura cuándo recibir notificaciones por email.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Nuevos Leads</Label>
                                    <p className="text-sm text-muted-foreground">Recibir un correo cuando se registre un nuevo lead.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Asignación de Propiedades</Label>
                                    <p className="text-sm text-muted-foreground">Notificar cuando se me asigne una nueva propiedad.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Reportes Semanales</Label>
                                    <p className="text-sm text-muted-foreground">Recibir un resumen semanal de actividad y métricas.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>APIs y Servicios Externos</CardTitle>
                            <CardDescription>Conecta tu CRM con herramientas de terceros.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="google-maps-key">Google Maps API Key</Label>
                                <div className="flex space-x-2">
                                    <Input id="google-maps-key" type="password" value="AIzaSyD...MockKey" readOnly />
                                    <Button variant="outline">Cambiar</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Usado para mostrar mapas en las propiedades.</p>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="sendgrid-key">SendGrid API Key</Label>
                                <div className="flex space-x-2">
                                    <Input id="sendgrid-key" type="password" value="SG.Mk...MockKey" readOnly />
                                    <Button variant="outline">Cambiar</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Usado para el envío de correos transaccionales.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seguridad y Acceso</CardTitle>
                            <CardDescription>Configura políticas de contraseñas y sesiones.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Autenticación de Dos Factores (2FA)</Label>
                                    <p className="text-sm text-muted-foreground">Requerir 2FA para todos los administradores.</p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Cierre de Sesión Automático</Label>
                                    <p className="text-sm text-muted-foreground">Cerrar sesión tras 30 minutos de inactividad.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

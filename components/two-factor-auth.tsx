"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
// @ts-ignore - lucide-react types not resolving correctly
import { Shield, Copy, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface TwoFactorAuthProps {
  onEnable?: (secret: string) => void
  onDisable?: () => void
  isEnabled?: boolean
}

export function TwoFactorAuth({ onEnable, onDisable, isEnabled = false }: TwoFactorAuthProps) {
  const [step, setStep] = useState<"setup" | "verify" | "backup" | "enabled">(isEnabled ? "enabled" : "setup")
  const [secret, setSecret] = useState("JBSWY3DPEBLW64TMMQ======")
  const [code, setCode] = useState("")
  const [backupCodes, setBackupCodes] = useState([
    "8F3K-9L2M-4P5Q",
    "7R8S-9T0U-1V2W",
    "3X4Y-5Z6A-7B8C",
    "9D0E-1F2G-3H4I",
    "5J6K-7L8M-9N0O",
  ])
  const [copied, setCopied] = useState(false)

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    toast.success("Secreto copiado al portapapeles")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerifyCode = () => {
    if (code.length === 6) {
      setStep("backup")
      toast.success("Código verificado correctamente")
    } else {
      toast.error("Por favor ingresa un código de 6 dígitos")
    }
  }

  const handleConfirmBackup = () => {
    setStep("enabled")
    onEnable?.(secret)
    toast.success("Autenticación de dos factores habilitada")
  }

  const handleDisable = () => {
    setStep("setup")
    onDisable?.()
    toast.success("Autenticación de dos factores deshabilitada")
  }

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"))
    toast.success("Códigos de respaldo copiados")
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {step === "setup" && (
        <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-none bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-foreground">Autenticación de Dos Factores</h2>
              <p className="text-sm text-muted-foreground">Protege tu cuenta con una capa adicional de seguridad</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-none flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">¿Qué es la autenticación de dos factores?</p>
                <p className="text-muted-foreground">
                  Añade una capa extra de seguridad requiriendo un código de verificación además de tu contraseña.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Pasos para configurar:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Descarga una aplicación autenticadora (Google Authenticator, Authy, Microsoft Authenticator)</li>
                <li>Escanea el código QR o ingresa la clave secreta</li>
                <li>Verifica el código de 6 dígitos generado</li>
                <li>Guarda tus códigos de respaldo en un lugar seguro</li>
              </ol>
            </div>

            <Button onClick={() => setStep("verify")} className="w-full bg-gradient-to-r from-primary to-primary/80">
              Comenzar Configuración
            </Button>
          </div>
        </Card>
      )}

      {step === "verify" && (
        <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
          <h2 className="text-2xl font-serif font-light text-foreground mb-6">Verificar Autenticador</h2>

          <div className="space-y-6">
            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 bg-muted border-2 border-dashed border-border rounded-none flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Código QR</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">O ingresa esta clave manualmente:</p>
            </div>

            {/* Secret Key */}
            <div className="p-4 bg-muted rounded-none flex items-center justify-between">
              <code className="font-mono text-sm text-foreground">{secret}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySecret}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Código de verificación (6 dígitos)</label>
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("setup")} className="flex-1">
                Atrás
              </Button>
              <Button onClick={handleVerifyCode} className="flex-1 bg-gradient-to-r from-primary to-primary/80">
                Verificar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === "backup" && (
        <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50">
          <h2 className="text-2xl font-serif font-light text-foreground mb-6">Códigos de Respaldo</h2>

          <div className="space-y-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-none flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">Guarda estos códigos en un lugar seguro</p>
                <p className="text-muted-foreground">
                  Úsalos si pierdes acceso a tu autenticador. Cada código solo se puede usar una vez.
                </p>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="p-4 bg-muted rounded-none space-y-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="font-mono text-sm text-foreground">
                  {index + 1}. {code}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleCopyBackupCodes}
              className="w-full gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Códigos
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("verify")} className="flex-1">
                Atrás
              </Button>
              <Button onClick={handleConfirmBackup} className="flex-1 bg-gradient-to-r from-primary to-primary/80">
                Confirmar y Habilitar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === "enabled" && (
        <Card className="p-8 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-none bg-gradient-to-br from-green-500 to-green-600 text-white">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-light text-foreground">¡Habilitado!</h2>
              <p className="text-sm text-muted-foreground">Tu cuenta está protegida con autenticación de dos factores</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-background/50 rounded-none space-y-2">
              <p className="text-sm font-medium text-foreground">Estado:</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-none bg-green-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">Autenticación de dos factores activa</span>
              </div>
            </div>

            <Button
              variant="default"
              onClick={handleDisable}
              className="w-full"
            >
              Deshabilitar 2FA
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

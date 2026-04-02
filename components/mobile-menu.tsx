"use client"

import { cn } from "@/lib/utils"
import * as Dialog from "@radix-ui/react-dialog"
// @ts-ignore - lucide-react types not resolving correctly
import { Settings, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
  className?: string
}

export const MobileMenu = ({ className }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: "Seguros", href: "/seguros" },
    { name: "Bienes Raíces", href: "/bienes-raices" },
    { name: "Turismo", href: "/turismo" },
    { name: "Contacto", href: "/contacto" },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Dialog.Root modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("group lg:hidden p-2 hover:bg-muted/80", className)}
          aria-label="Open menu"
        >
          <Settings className="group-[[data-state=open]]:hidden w-4 h-4" />
          <X className="hidden group-[[data-state=open]]:block w-4 h-4" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <div data-overlay="true" className="fixed z-30 inset-0 bg-background/60 backdrop-blur-xl animate-fade-in" />

        <Dialog.Content
          onInteractOutside={(e) => {
            if (e.target instanceof HTMLElement && e.target.dataset.overlay !== "true") {
              e.preventDefault()
            }
          }}
          className="fixed top-0 left-0 w-full z-40 py-28 md:py-40"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>

          <nav className="flex flex-col space-y-6 container mx-auto">
            {menuItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className="text-xl font-mono uppercase text-foreground/60 transition-all duration-300 ease-out hover:text-foreground/100 py-2 hover:scale-105 hover:translate-x-2 group"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <span className="inline-block group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {item.name}
                </span>
              </Link>
            ))}

            <div className="mt-6">
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="inline-block text-xl font-mono uppercase text-primary transition-all duration-300 ease-out hover:text-primary/80 py-2 hover:scale-105 hover:translate-x-2 group"
              >
                <span className="inline-block group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Iniciar Sesión
                </span>
              </Link>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

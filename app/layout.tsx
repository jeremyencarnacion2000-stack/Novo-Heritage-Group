import type { Metadata } from "next"
import { Montserrat, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SessionProviderWrapper } from "@/hooks/use-auth"
import { TrackingInitiator } from "@/components/tracking-initiator"
import Chatbot from "@/components/chatbot"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "700", "900"]
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"]
})

export const metadata: Metadata = {
  title: {
    default: "Novo Heritage | Soluciones Premium",
    template: "%s | Novo Heritage"
  },
  description: "Soluciones exclusivas en Seguros, Bienes Raíces y Turismo. Gestionamos su patrimonio con excelencia y atención personalizada.",
  metadataBase: new URL('https://novo-heritage-group-3n0yr22o7.vercel.app'),
  keywords: ["seguros", "bienes raíces", "turismo", "lujo", "patrimonio", "inversión", "viajes", "propiedades", "República Dominicana"],
  authors: [{ name: "Novo Heritage Group" }],
  openGraph: {
    title: "Novo Heritage | Soluciones Premium",
    description: "Soluciones exclusivas en Seguros, Bienes Raíces y Turismo.",
    url: 'https://novo-heritage-group-3n0yr22o7.vercel.app',
    siteName: 'Novo Heritage',
    images: [
      {
        url: '/Novo Heritage Group.jpg',
        width: 1200,
        height: 630,
        alt: 'Novo Heritage Group',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Novo Heritage | Soluciones Premium",
    description: "Soluciones exclusivas en Seguros, Bienes Raíces y Turismo.",
    images: ['/Novo Heritage Group.jpg'],
  },
  icons: {
    icon: '/Icono.png',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${cormorant.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300 font-sans`}
      >
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SmoothScroll>
              {children}
            </SmoothScroll>
            <Chatbot />
            <FloatingThemeToggle />
            <TrackingInitiator />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

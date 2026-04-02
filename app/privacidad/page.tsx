import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad - Novo Heritage",
  description: "Política de privacidad de Novo Heritage - Cómo protegemos y manejamos tu información personal. Conoce tus derechos y cómo utilizamos tus datos.",
  keywords: 'política de privacidad, protección de datos, información personal, Novo Heritage, RGPD, datos personales',
  openGraph: {
    title: 'Política de Privacidad - Novo Heritage',
    description: 'Política de privacidad de Novo Heritage - Cómo protegemos y manejamos tu información personal',
    url: 'https://novoheritage.com/privacidad',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Política de Privacidad - Novo Heritage',
    description: 'Política de privacidad de Novo Heritage - Cómo protegemos y manejamos tu información personal',
    creator: '@novoheritage',
  },
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString("es-DO")}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">1. Información que Recopilamos</h2>
            <p className="text-muted-foreground mb-4">
              En Novo Heritage, recopilamos información personal que usted nos proporciona voluntariamente cuando:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Solicita una cotización de seguros</li>
              <li>Se registra en nuestro sitio web</li>
              <li>Se comunica con nosotros a través de formularios de contacto</li>
              <li>Utiliza nuestro chatbot de asistencia</li>
              <li>Se suscribe a nuestro boletín informativo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">2. Uso de la Información</h2>
            <p className="text-muted-foreground mb-4">Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Procesar sus solicitudes de servicios</li>
              <li>Proporcionar cotizaciones personalizadas</li>
              <li>Mejorar nuestros servicios y experiencia del usuario</li>
              <li>Enviar comunicaciones relacionadas con nuestros servicios</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">3. Protección de Datos</h2>
            <p className="text-muted-foreground mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra
              acceso no autorizado, pérdida, destrucción o alteración. Esto incluye:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
              <li>Acceso restringido a información personal</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Capacitación continua del personal en protección de datos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">4. Compartir Información</h2>
            <p className="text-muted-foreground mb-4">
              No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Con su consentimiento explícito</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Con proveedores de servicios que nos ayudan a operar nuestro negocio</li>
              <li>En caso de fusión, adquisición o venta de activos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">5. Sus Derechos</h2>
            <p className="text-muted-foreground mb-4">Usted tiene derecho a:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Acceder a su información personal</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Solicitar la portabilidad de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">6. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. Para más
              información, consulte nuestra{" "}
              <a href="/cookies" className="text-primary hover:underline">
                Política de Cookies
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">7. Contacto</h2>
            <p className="text-muted-foreground mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, contáctenos:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground">
              <li>Email: legal@novoheritage.com</li>
              <li>Teléfono: 809-215-7540</li>
              <li>Dirección: Av. Winston Churchill, Santo Domingo, República Dominicana</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

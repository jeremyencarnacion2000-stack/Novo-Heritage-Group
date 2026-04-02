import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y Condiciones - Novo Heritage",
  description: "Términos y condiciones de uso de los servicios de Novo Heritage. Conoce las condiciones para utilizar nuestros servicios de seguros, bienes raíces y turismo.",
  keywords: 'términos y condiciones, condiciones de uso, servicios, Novo Heritage, seguros, bienes raíces, turismo',
  openGraph: {
    title: 'Términos y Condiciones - Novo Heritage',
    description: 'Términos y condiciones de uso de los servicios de Novo Heritage',
    url: 'https://novoheritage.com/terminos',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Términos y Condiciones - Novo Heritage',
    description: 'Términos y condiciones de uso de los servicios de Novo Heritage',
    creator: '@novoheritage',
  },
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">Términos y Condiciones</h1>
        <p className="text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString("es-DO")}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground mb-4">
              Al acceder y utilizar el sitio web de Novo Heritage, usted acepta estar sujeto a estos Términos y
              Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio
              web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">2. Servicios Ofrecidos</h2>
            <p className="text-muted-foreground mb-4">Novo Heritage ofrece los siguientes servicios:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Seguros de vehículos con diferentes niveles de cobertura</li>
              <li>Servicios de bienes raíces incluyendo compra, venta y alquiler de propiedades</li>
              <li>Paquetes turísticos y servicios de viaje</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">3. Uso del Sitio Web</h2>
            <p className="text-muted-foreground mb-4">Usted se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>No utilizar el sitio para fines ilegales o no autorizados</li>
              <li>No interferir con el funcionamiento del sitio web</li>
              <li>Respetar los derechos de propiedad intelectual</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">4. Cotizaciones y Precios</h2>
            <p className="text-muted-foreground mb-4">
              Las cotizaciones proporcionadas a través de nuestro sitio web son estimaciones basadas en la información
              que usted proporciona. Los precios finales pueden variar según:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Verificación de la información proporcionada</li>
              <li>Evaluación de riesgos adicionales</li>
              <li>Cambios en las condiciones del mercado</li>
              <li>Requisitos regulatorios</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">5. Propiedad Intelectual</h2>
            <p className="text-muted-foreground mb-4">
              Todo el contenido del sitio web, incluyendo textos, gráficos, logos, imágenes y software, es propiedad de
              Novo Heritage o sus licenciantes y está protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">6. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground mb-4">
              Novo Heritage no será responsable por daños indirectos, incidentales, especiales o consecuentes que
              resulten del uso o la imposibilidad de usar nuestros servicios, incluyendo pero no limitado a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pérdida de beneficios</li>
              <li>Pérdida de datos</li>
              <li>Interrupción del negocio</li>
              <li>Errores u omisiones en el contenido</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">7. Modificaciones</h2>
            <p className="text-muted-foreground mb-4">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios
              entrarán en vigor inmediatamente después de su publicación en el sitio web. Su uso continuado del sitio
              después de cualquier cambio constituye su aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">8. Ley Aplicable</h2>
            <p className="text-muted-foreground mb-4">
              Estos Términos y Condiciones se rigen por las leyes de la República Dominicana. Cualquier disputa será
              resuelta en los tribunales competentes de Santo Domingo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">9. Contacto</h2>
            <p className="text-muted-foreground mb-4">
              Para preguntas sobre estos Términos y Condiciones, contáctenos:
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

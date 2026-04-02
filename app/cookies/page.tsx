import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cookies - Novo Heritage",
  description: "Información detallada sobre el uso de cookies en el sitio web de Novo Heritage. Aprende cómo utilizamos las cookies para mejorar tu experiencia.",
  keywords: 'política de cookies, cookies, privacidad, Novo Heritage, web, sitio web',
  openGraph: {
    title: 'Política de Cookies - Novo Heritage',
    description: 'Información detallada sobre el uso de cookies en el sitio web de Novo Heritage',
    url: 'https://novoheritage.com/cookies',
    siteName: 'Novo Heritage',
    locale: 'es_DO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Política de Cookies - Novo Heritage',
    description: 'Información detallada sobre el uso de cookies en el sitio web de Novo Heritage',
    creator: '@novoheritage',
  },
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">Política de Cookies</h1>
        <p className="text-muted-foreground mb-8">Última actualización: {new Date().toLocaleDateString("es-DO")}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">¿Qué son las Cookies?</h2>
            <p className="text-muted-foreground mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web.
              Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionen
              información a los propietarios del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Tipos de Cookies que Utilizamos</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">1. Cookies Esenciales</h3>
              <p className="text-muted-foreground mb-2">
                Estas cookies son necesarias para el funcionamiento básico del sitio web y no se pueden desactivar.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Cookies de sesión para mantener su sesión activa</li>
                <li>Cookies de seguridad para proteger contra ataques</li>
                <li>Cookies de preferencias de idioma</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">2. Cookies de Rendimiento</h3>
              <p className="text-muted-foreground mb-2">
                Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Google Analytics para análisis de tráfico</li>
                <li>Cookies de seguimiento de errores</li>
                <li>Cookies de pruebas A/B</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">3. Cookies Funcionales</h3>
              <p className="text-muted-foreground mb-2">
                Estas cookies permiten que el sitio web recuerde sus elecciones y proporcione características mejoradas.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Preferencias de tema (claro/oscuro)</li>
                <li>Configuración de accesibilidad</li>
                <li>Historial de búsqueda</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">4. Cookies de Marketing</h3>
              <p className="text-muted-foreground mb-2">
                Estas cookies se utilizan para mostrar anuncios relevantes y medir la efectividad de nuestras campañas.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Cookies de redes sociales</li>
                <li>Cookies de remarketing</li>
                <li>Cookies de seguimiento de conversiones</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Cookies de Terceros</h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos servicios de terceros que pueden establecer cookies en su dispositivo:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Google Analytics:</strong> Para análisis de tráfico y comportamiento del usuario
              </li>
              <li>
                <strong>Redes Sociales:</strong> Para compartir contenido y mostrar widgets sociales
              </li>
              <li>
                <strong>Servicios de Chat:</strong> Para proporcionar soporte en tiempo real
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Gestión de Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Puede controlar y/o eliminar las cookies según desee. Puede eliminar todas las cookies que ya están en su
              dispositivo y puede configurar la mayoría de los navegadores para evitar que se coloquen.
            </p>
            <p className="text-muted-foreground mb-4">
              Para gestionar las cookies en los navegadores más populares:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferencias → Privacidad → Cookies
              </li>
              <li>
                <strong>Edge:</strong> Configuración → Privacidad → Cookies
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Consecuencias de Desactivar Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Si desactiva las cookies, algunas funciones del sitio web pueden no funcionar correctamente:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>No podrá mantener su sesión iniciada</li>
              <li>Sus preferencias no se guardarán</li>
              <li>Algunas funciones interactivas pueden no estar disponibles</li>
              <li>La experiencia del usuario puede verse afectada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Actualizaciones de esta Política</h2>
            <p className="text-muted-foreground mb-4">
              Podemos actualizar esta Política de Cookies periódicamente para reflejar cambios en nuestras prácticas o
              por razones operativas, legales o regulatorias. Le recomendamos que revise esta página regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif font-light mb-4">Contacto</h2>
            <p className="text-muted-foreground mb-4">
              Si tiene preguntas sobre nuestra Política de Cookies, contáctenos:
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

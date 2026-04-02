import Image from "next/image"
import { Badge } from "@/components/ui/badge"

// Dummy data - in a real app, you would fetch this based on the slug
const dummyPosts = {
  "guia-completa-seguros-de-vida": {
    slug: "guia-completa-seguros-de-vida",
    title: "Guía Completa de Seguros de Vida: Protegiendo a tu Familia",
    content: `
<p>Entender los seguros de vida puede ser complicado. Te guiamos a través de los diferentes tipos, beneficios y cómo elegir el plan perfecto para tus seres queridos.</p>
<h3 class="text-2xl font-serif mt-8 mb-4">Tipos de Seguros de Vida</h3>
<p>Existen principalmente dos categorías: seguro de vida a término y seguro de vida permanente. El primero cubre un período específico, mientras que el segundo dura toda la vida.</p>
<h3 class="text-2xl font-serif mt-8 mb-4">¿Cuánto Cuesta?</h3>
<p>El costo varía según tu edad, salud y el monto de la cobertura. Es más asequible de lo que la mayoría de la gente piensa. Un adulto sano de 30 años puede obtener una cobertura significativa por menos de $30 al mes.</p>
`,
    imageUrl: "/placeholder.jpg",
    category: "Seguros",
    author: "Ana García",
    authorImageUrl: "/placeholder-user.jpg",
    date: "12 de Oct, 2025",
  },
  "inversion-inteligente-bienes-raices": {
    slug: "inversion-inteligente-bienes-raices",
    title: "Inversión Inteligente: 5 Consejos para Comprar tu Primera Propiedad",
    content: `
<p>El mercado inmobiliario ofrece grandes oportunidades. Aprende los pasos clave para realizar una inversión segura y rentable en tu primera casa o apartamento.</p>
<h3 class="text-2xl font-serif mt-8 mb-4">1. Define tu Presupuesto</h3>
<p>Antes de buscar, sabe cuánto puedes pagar. Considera la cuota inicial, los costos de cierre y los gastos mensuales.</p>
<h3 class="text-2xl font-serif mt-8 mb-4">2. Ubicación, Ubicación, Ubicación</h3>
<p>La ubicación determina el valor a largo plazo de tu propiedad. Investiga el vecindario, las escuelas y los servicios cercanos.</p>
`,
    imageUrl: "/luxury-modern-real-estate-property.jpg",
    category: "Bienes Raíces",
    author: "Carlos Martínez",
    authorImageUrl: "/placeholder-user.jpg",
    date: "10 de Oct, 2025",
  },
  "destinos-turisticos-para-desconectar": {
    slug: "destinos-turisticos-para-desconectar",
    title: "Top 3 Destinos en el Caribe para Desconectar y Recargar Energías",
    content: `
<p>¿Necesitas un descanso? Descubre playas paradisíacas, resorts de lujo y actividades inolvidables en los destinos más espectaculares del Caribe.</p>
<h3 class="text-2xl font-serif mt-8 mb-4">1. Punta Cana, República Dominicana</h3>
<p>Playas de arena blanca, aguas cristalinas y una amplia oferta de resorts todo incluido. Ideal para relajarse y disfrutar del sol.</p>
<h3 class="text-2xl font-serif mt-8 mb-4">2. Cancún, México</h3>
<p>Combina cultura, fiesta y relajación. Explora ruinas mayas, nada en cenotes y disfruta de una vibrante vida nocturna.</p>
`,
    imageUrl: "/luxury-travel-destination-beach-resort.jpg",
    category: "Turismo",
    author: "Sofía Rodríguez",
    authorImageUrl: "/placeholder-user.jpg",
    date: "8 de Oct, 2025",
  },
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = dummyPosts[params.slug as keyof typeof dummyPosts]

  if (!post) {
    return <div>Post no encontrado</div>
  }

  return (
    <article className="container mx-auto py-20 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">{post.category}</Badge>
        <h1 className="text-4xl md:text-5xl font-serif font-light leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Image src={post.authorImageUrl} alt={post.author} width={32} height={32} className="rounded-full" />
          <span>{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
      </div>

      <div className="relative h-96 rounded-lg overflow-hidden mb-12">
        <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
      </div>

      <div
        className="prose prose-lg max-w-none mx-auto text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}

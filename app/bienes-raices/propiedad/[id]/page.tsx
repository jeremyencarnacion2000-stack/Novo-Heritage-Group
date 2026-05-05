import { Metadata } from "next"
import { PropertyDetailClient } from "@/components/property-detail-client"
import sql from "@/lib/railway-db"

interface Props {
  params: { id: string }
}

async function getProperty(id: string) {
  try {
    const data = await sql`
      SELECT title, description, image, price, location, sector, city
      FROM properties 
      WHERE id = ${id}
      LIMIT 1
    `;
    return data[0] || null;
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(params.id)
  
  if (!property) {
    return {
      title: "Propiedad No Encontrada | Novo Heritage",
    }
  }

  const title = `${property.title} | Novo Heritage`
  const description = property.description?.substring(0, 160) || "Propiedad exclusiva en República Dominicana gestionada por Novo Heritage Group."
  const imageUrl = property.image || "/Novo Heritage Group.jpg"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    }
  }
}

export default function PropertyDetailPage({ params }: Props) {
  return <PropertyDetailClient propertyId={params.id} />
}

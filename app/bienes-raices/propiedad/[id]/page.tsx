import { Metadata } from "next"
import { PropertyDetailClient } from "@/components/property-detail-client"
import cockroachDb from "@/lib/cockroach-db"
import { mapCockroachProperty } from "@/lib/property-utils"

interface Props {
  params: { id: string }
}

async function getProperty(id: string) {
  try {
    const data = await cockroachDb`
      SELECT *
      FROM public.inventario_digital
      WHERE id = ${id}
      LIMIT 1
    `;
    if (!data || data.length === 0) return null;
    return mapCockroachProperty(data[0]);
  } catch (err) {
    console.error("Error fetching property:", err);
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
  const imageUrl = property.images?.[0] || "/Novo Heritage Group.jpg"

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

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.id)
  return <PropertyDetailClient propertyId={params.id} initialProperty={property} />
}

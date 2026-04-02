import { TurismoDetailPage } from "@/components/turismo-detail-page"

export default function Page({ params }: { params: { id: string } }) {
    return <TurismoDetailPage id={params.id} />
}

import { DashboardInteligente } from "@/components/dashboard-inteligente"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header isScrolled={true} />
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4">
                    <DashboardInteligente />
                </div>
            </main>
            <Footer />
        </div>
    )
}

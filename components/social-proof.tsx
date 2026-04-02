"use client"

// @ts-ignore - lucide-react types not resolving correctly
import { Star, Users, TrendingUp, Award } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Clientes satisfechos",
    color: "text-blue-400",
  },
  {
    icon: TrendingUp,
    value: "15+",
    label: "Años de experiencia",
    color: "text-emerald-400",
  },
  {
    icon: Star,
    value: "98%",
    label: "Tasa de satisfacción",
    color: "text-amber-400",
  },
  {
    icon: Award,
    value: "4.9/5",
    label: "Calificación promedio",
    color: "text-purple-400",
  },
]

export function SocialProof({ stats: customStats }: { stats?: any[] }) {
  const displayStats = customStats || stats

  return (
    <section className="relative py-16 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 rounded-none bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 transition-all duration-500 group"
              >
                <Icon className={`w-8 h-8 mb-4 ${stat.color}`} />
                <div className="text-3xl sm:text-4xl font-serif font-light text-white mb-2 group-hover:animate-elegant-pulse">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300 text-center">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
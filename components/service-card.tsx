"use client"

import Link from 'next/link'

interface ServiceCardProps {
  icon: string
  title: string
  description: string
  href: string
}

export function ServiceCard({
  icon,
  title,
  description,
  href
}: ServiceCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-none p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-none flex items-center justify-center mb-6">
        <span className="text-3xl">{icon}</span>
      </div>

      <h3 className="text-2xl font-serif font-light mb-4 text-white">{title}</h3>

      <p className="text-gray-300 mb-6">
        {description}
      </p>

      <Link
        href={href}
        className="inline-flex items-center gap-2 mt-6 text-amber-400 hover:text-amber-300 font-medium transition-colors group/link"
      >
        Saber más
        <svg
          className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
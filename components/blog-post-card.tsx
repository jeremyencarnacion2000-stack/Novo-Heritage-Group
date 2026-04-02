import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface BlogPost {
  slug: string
  title: string
  summary: string
  imageUrl: string
  category: string
  author: string
  authorImageUrl: string
  date: string
}

export function BlogPostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  if (featured) return null // Skip featured post in grid since it's shown separately

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="rounded-none overflow-hidden hover:shadow-xl transition-all duration-300 card-premium group">
        {/* Image */}
        <div className="relative h-56 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-gradient-shift"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-lg animate-smooth-float"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-md animate-smooth-float" style={{ animationDelay: '1s' }}></div>
          
          {/* Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-none flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-all duration-500">
              <span className="text-2xl">
                {post.category === "Seguros" ? "🛡️" : 
                 post.category === "Bienes Raíces" ? "🏠" : 
                 post.category === "Turismo" ? "✈️" : "📝"}
              </span>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-white/60 rounded-full animate-smooth-pulse"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-smooth-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/50 rounded-full animate-smooth-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-white/30 rounded-full animate-smooth-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <Badge 
            variant="outline" 
            className="mb-3 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-300"
          >
            {post.category}
          </Badge>
          <h3 className="text-xl font-serif mb-3 leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
            {post.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-none flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{post.author[0]}</span>
            </div>
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

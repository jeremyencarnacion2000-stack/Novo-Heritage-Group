"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
// @ts-ignore
import { ArrowRight, Clock, Calendar } from "lucide-react"
import { BlogPost } from "@/lib/blog-data"
import { cn } from "@/lib/utils"

export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/5] overflow-hidden border border-white/10 glass-premium">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 blur-[2px] group-hover:blur-0"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/20 text-[8px] font-black uppercase tracking-[0.3em] text-primary">
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-[8px] text-white/40 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              {post.readingTime}
            </div>
          </div>
          
          <h3 className="text-2xl font-serif text-white mb-4 leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          
          <p className="text-white/60 text-xs font-light line-clamp-2 mb-6 tracking-wide">
            {post.summary}
          </p>
          
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
             <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-none border border-primary/20 overflow-hidden">
                    <Image src={post.authorImageUrl} alt={post.author} fill className="object-cover" />
                </div>
                <span className="text-[10px] text-white/80 font-bold uppercase tracking-widest">{post.author}</span>
             </div>
             <ArrowRight className="w-5 h-5 text-primary -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

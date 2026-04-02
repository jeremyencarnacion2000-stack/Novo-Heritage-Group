"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Review {
  id: string
  author: string
  avatarUrl: string
  rating: number
  comment: string
  date: string
}

const dummyReviews: Review[] = [
  {
    id: "1",
    author: "Carlos S.",
    avatarUrl: "/placeholder-user.jpg",
    rating: 5,
    comment: "¡Excelente servicio! El proceso fue rápido y el personal muy atento. Totalmente recomendado.",
    date: "hace 2 días",
  },
  {
    id: "2",
    author: "Laura G.",
    avatarUrl: "/placeholder-user.jpg",
    rating: 4,
    comment: "Buena experiencia en general. Me ayudaron a encontrar el paquete de viaje perfecto para mis vacaciones.",
    date: "hace 1 semana",
  },
]

function ReviewForm() {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically submit the review to your backend
    console.log({ rating, comment })
    setRating(0)
    setComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="mb-12">
      <h3 className="text-2xl font-serif mb-4">Deja tu opinión</h3>
      <div className="mb-4">
        <StarRating rating={rating} setRating={setRating} size={24} />
      </div>
      <Textarea
        placeholder="Escribe tu comentario aquí..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-4"
        rows={4}
      />
      <Button type="submit" disabled={rating === 0 || comment.length < 10}>
        Enviar opinión
      </Button>
    </form>
  )
}

function ReviewsList() {
  return (
    <div>
      <h3 className="text-2xl font-serif mb-6">Opiniones de clientes</h3>
      <div className="space-y-6">
        {dummyReviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar>
              <AvatarImage src={review.avatarUrl} alt={review.author} />
              <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold">{review.author}</p>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <div className="mb-2">
                <StarRating rating={review.rating} readOnly size={16} />
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Reviews() {
  return (
    <section className="py-20 px-4 border-t">
      <div className="container max-w-4xl mx-auto">
        <ReviewForm />
        <ReviewsList />
      </div>
    </section>
  )
}

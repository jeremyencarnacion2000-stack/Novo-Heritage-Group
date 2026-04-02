"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// @ts-ignore - lucide-react types not resolving correctly
import { MessageCircle, X, Send, Loader2, Sparkles, Volume2, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  sentiment?: "positive" | "neutral" | "negative"
  rating?: "up" | "down"
}

export function AdvancedChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages: aiMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Sync AI messages with local state
  useEffect(() => {
    if (aiMessages.length > 0) {
      const lastMessage = aiMessages[aiMessages.length - 1]
      const messageContent = lastMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => (part as any).text)
        .join("")

      if (messageContent && !messages.some((m) => m.content === messageContent)) {
        setMessages((prev) => [
          ...prev,
          {
            id: lastMessage.id,
            role: lastMessage.role as "user" | "assistant",
            content: messageContent,
            timestamp: new Date(),
          },
        ])
      }
    }
  }, [aiMessages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const input = e.currentTarget.message.value
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: new Date(),
      },
    ])

    sendMessage({ text: input })
    e.currentTarget.message.value = ""
  }

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "es-ES"
      utterance.rate = 0.9
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado al portapapeles")
  }

  const handleRating = (messageId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg))
    )
    toast.success(`Gracias por tu ${rating === "up" ? "voto positivo" : "voto negativo"}`)
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Abrir chat"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse group-hover:animate-none" />
          <MessageCircle className="w-6 h-6 relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[100] w-[380px] h-[600px] bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Asistente IA Novo Heritage</div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  En línea
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background/50 to-background">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8 h-full flex flex-col items-center justify-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2 font-medium">¡Hola! Soy tu asistente IA.</p>
                <p className="text-xs">Puedo ayudarte con seguros, propiedades y viajes.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                      : "bg-muted text-foreground border border-border"
                    }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                  {/* Message Actions */}
                  {message.role === "assistant" && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                      <button
                        onClick={() => handleSpeak(message.content)}
                        disabled={isSpeaking}
                        className="p-1 hover:bg-background/50 rounded transition-colors"
                        title="Escuchar"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="p-1 hover:bg-background/50 rounded transition-colors"
                        title="Copiar"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRating(message.id, "up")}
                        className={`p-1 rounded transition-colors ${message.rating === "up" ? "bg-green-500/20" : "hover:bg-background/50"
                          }`}
                        title="Útil"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRating(message.id, "down")}
                        className={`p-1 rounded transition-colors ${message.rating === "down" ? "bg-red-500/20" : "hover:bg-background/50"
                          }`}
                        title="No útil"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {status === "streaming" && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-muted rounded-2xl px-4 py-2.5 border border-border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                name="message"
                placeholder="Escribe tu pregunta..."
                disabled={status === "streaming"}
                className="flex-1 bg-background/80 border-border/50 focus:border-primary"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={status === "streaming"}
                className="flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

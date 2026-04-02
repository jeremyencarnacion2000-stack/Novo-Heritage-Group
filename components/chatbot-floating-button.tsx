"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
// @ts-ignore - lucide-react types not resolving correctly
import { MessageCircle, X, Send, Zap, User, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    sender: "bot",
    timestamp: new Date(),
  },
]

const quickReplies = [
  "¿Cómo funcionan los seguros?",
  "Información sobre bienes raíces",
  "Planes de turismo",
  "¿Dónde están ubicados?",
]

export default function ChatbotFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(content)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("seguro") || input.includes("seguros")) {
      return "Ofrecemos seguros para autos, hogar y vida. ¿Te gustaría que te ayude a cotizar un seguro específico?"
    }

    if (input.includes("bienes") || input.includes("raíces") || input.includes("propiedad")) {
      return "Tenemos una amplia selección de propiedades en venta y alquiler. ¿Buscas comprar, vender o alquilar?"
    }

    if (input.includes("turismo") || input.includes("viaje")) {
      return "Organizamos viajes personalizados a destinos nacionales e internacionales. ¿Qué tipo de viaje tienes en mente?"
    }

    if (input.includes("ubicacion") || input.includes("oficina") || input.includes("direccion")) {
      return "Nuestras oficinas principales están ubicadas en Santo Domingo. También atendemos en Santiago y otras ciudades importantes."
    }

    if (input.includes("contacto") || input.includes("telefono")) {
      return "Puedes contactarnos al (809) 555-0123 o escribirnos a info@novohg.com. ¡Estaremos encantados de atenderte!"
    }

    return "Gracias por tu mensaje. Un agente se pondrá en contacto contigo pronto para atender tu consulta específica."
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group"
          size="lg"
          aria-label={isOpen ? "Cerrar chat" : "Abrir asistente virtual"}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-green-500 border-2 border-white">
                  <span className="sr-only">Mensajes nuevos</span>
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">Asistente Virtual</CardTitle>
                      <p className="text-xs text-muted-foreground">En línea</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  <CardContent className="p-0">
                    {/* Messages */}
                    <div className="h-64 overflow-y-auto p-4 space-y-3">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.sender === 'bot' && (
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <Zap className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {message.content}
                          </div>
                          {message.sender === 'user' && (
                            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 justify-start"
                        >
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="w-3 h-3 text-primary-foreground" />
                          </div>
                          <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Quick Replies */}
                    {messages.length === 1 && (
                      <div className="px-4 pb-2">
                        <div className="flex flex-wrap gap-1">
                          {quickReplies.map((reply, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickReply(reply)}
                              className="text-xs h-7 px-2"
                            >
                              {reply}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-border/50">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSendMessage(inputValue)
                        }}
                        className="flex gap-2"
                      >
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Escribe tu mensaje..."
                          className="flex-1 h-8 text-sm"
                          disabled={isTyping}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!inputValue.trim() || isTyping}
                          className="h-8 px-3"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
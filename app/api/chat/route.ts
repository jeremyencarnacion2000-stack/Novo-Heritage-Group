import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import sql from "@/lib/db"

// SambaNova Client (Llama 3.1 405B for Elite Reasoning)
const sambanova = createOpenAI({
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: "https://api.sambanova.ai/v1",
})

export const maxDuration = 45

export async function POST(req: Request) {
  const { messages, userId } = await req.json()

  // 1. Fetch User Profile for Hyper-Personalization
  let userContext = "";
  if (userId) {
    try {
      const [profile] = await sql`SELECT * FROM perfil_usuario WHERE usuario_id = ${userId} LIMIT 1`;
      if (profile) {
        userContext = `\n\n**PERFIL DEL CLIENTE:**
- Intereses: ${JSON.stringify(profile.intereses)}
- Comportamiento: ${profile.tipo_usuario}
- Últimas búsquedas: ${JSON.stringify(profile.busquedas_recientes)}
Personaliza tu respuesta basándote en que el usuario ya ha mostrado interés en estas áreas.`;
      }
    } catch (e) {
      console.error("Profiling load failed:", e);
    }
  }

  // 2. RAG: Fetch Real-Time Inventory for Recommendations
  let inventoryContext = "";
  try {
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Simple Semantic-ish Filter: if user asks for specific location or type
    let query = sql`SELECT title, price, location, sector, bedrooms, bathrooms FROM properties WHERE is_published = true `;
    
    if (lastMessage.includes("piantini") || lastMessage.includes("naco") || lastMessage.includes("punta cana")) {
        const sector = lastMessage.includes("piantini") ? "Piantini" : lastMessage.includes("naco") ? "Naco" : "Punta Cana";
        query = sql`${query} AND sector ILIKE ${'%' + sector + '%'}`;
    }
    
    const listings = await sql`${query} ORDER BY created_at DESC LIMIT 3`;
    
    if (listings.length > 0) {
      inventoryContext = `\n\n**INVENTARIO DISPONIBLE EN TIEMPO REAL:**
${listings.map(l => `- ${l.title} en ${l.sector}: US$ ${l.price.toLocaleString()} (${l.bedrooms} Hab / ${l.bathrooms} Baños)`).join('\n')}
Menciona estas opciones específicas si encajan con lo que busca el usuario.`;
    }
  } catch (e) {
    console.error("Inventory RAG failed:", e);
  }

  const result = streamText({
    model: sambanova("Meta-Llama-3.1-405B-Instruct"),
    system: `Eres "Novo AI", el asistente inteligente de Novo Heritage Group. Tu objetivo es asesorar a clientes de alto nivel en República Dominicana sobre Bienes Raíces, Seguros y Turismo.

**DIRECTIVAS DE NOVO AI:**
1. **Precisión Dominicana:** Conoces perfectamente sectores como Piantini, Naco, Cap Cana y Casa de Campo.
2. **Mentalidad de Inversor:** Si hablan de bienes raíces, enfócate en plusvalía y retorno de inversión (ROI).
3. **Conversión Intuitiva:** Si el usuario pregunta por algo general, guíalo hacia una recomendación específica de nuestro inventario real.
4. **Tono:** Ejecutivo, fluido, sofisticado y servicial.

${userContext}
${inventoryContext}

Si el usuario pregunta por algo que no está en el listado anterior, invítalo a dejar sus datos para que un asesor busque la propiedad ideal fuera de catálogo.`,
    messages,
  })

  return result.toTextStreamResponse()
}
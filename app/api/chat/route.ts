import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import neonSql from "@/lib/db"
import cockroachDb from "@/lib/cockroach-db"

// SambaNova Client (Llama 3.1 405B for Elite Reasoning)
const sambanova = createOpenAI({
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: "https://api.sambanova.ai/v1",
})

export const maxDuration = 45

export async function POST(req: Request) {
  const { messages, userId } = await req.json()

  // Detect if any message has an attachment (Vision task)
  const hasImage = messages.some((msg: any) => msg.experimental_attachments && msg.experimental_attachments.length > 0);

  // 1. Fetch User Profile from Neon (auth/profiles DB)
  let userContext = "";
  if (userId && userId !== "anonymous") {
    try {
      const [profile] = await neonSql`SELECT * FROM perfil_usuario WHERE usuario_id = ${userId} LIMIT 1`;
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

  // 2. RAG: Fetch Real-Time Inventory from CockroachDB (properties DB)
  let inventoryContext = "";
  try {
    const lastMessage = messages[messages.length - 1].content || "";
    const lastMessageLower = typeof lastMessage === 'string' ? lastMessage.toLowerCase() : "";
    
    let listings: any[] = [];
    
    // Location-aware filtering
    const locations = ["piantini", "naco", "punta cana", "cap cana", "bavaro"];
    const foundLocation = locations.find(loc => lastMessageLower.includes(loc));

    if (foundLocation) {
      const sector = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1);
      listings = await cockroachDb`
        SELECT nombre_proyecto, precio, zona, descripcion_limpia, es_constructora_oficial 
        FROM public.inventario_digital 
        WHERE nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', '')
          AND zona ILIKE ${'%' + sector + '%'}
        ORDER BY id DESC LIMIT 5
      `;
    } else {
      // General inventory
      listings = await cockroachDb`
        SELECT nombre_proyecto, precio, zona, descripcion_limpia, es_constructora_oficial 
        FROM public.inventario_digital 
        WHERE nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', '')
          AND descripcion_limpia IS NOT NULL
          AND LENGTH(descripcion_limpia) > 10
        ORDER BY id DESC LIMIT 5
      `;
    }
    
    if (listings.length > 0) {
      inventoryContext = `\n\n**INVENTARIO DISPONIBLE EN TIEMPO REAL (CockroachDB):**
${listings.map((l: any) => `- ${l.nombre_proyecto} en ${l.zona}: ${l.precio} ${l.es_constructora_oficial ? '✅ Constructora Oficial' : ''}\n  ${(l.descripcion_limpia || '').substring(0, 100)}`).join('\n')}
Menciona estas opciones específicas si encajan con lo que busca el usuario.`;
    }
  } catch (e) {
    console.error("Inventory RAG failed:", e);
  }

  const modelName = hasImage ? "Llama-3.2-11B-Vision-Instruct" : "Meta-Llama-3.1-405B-Instruct";

  const result = streamText({
    model: sambanova(modelName) as any,
    system: `Eres "Novo AI", el asistente inteligente de Novo Heritage Group. Tu objetivo es asesorar a clientes de alto nivel en República Dominicana sobre Bienes Raíces, Seguros y Turismo.

**DIRECTIVAS DE NOVO AI:**
1. **Precisión Dominicana:** Conoces perfectamente sectores como Piantini, Naco, Cap Cana y Casa de Campo.
2. **Mentalidad de Inversor:** Si hablan de bienes raíces, enfócate en plusvalía y retorno de inversión (ROI).
3. **Conversión Intuitiva:** Si el usuario pregunta por algo general, guíalo hacia una recomendación específica de nuestro inventario real.
4. **Tono:** Ejecutivo, fluido, sofisticado y servicial.
${hasImage ? "5. **Análisis de Visión:** Si el usuario envía una imagen, analízala con detalle técnico (arquitectura, acabados, ubicación probable) y relaciónala con nuestro catálogo si es posible." : ""}

${userContext}
${inventoryContext}

Si el usuario pregunta por algo que no está en el listado anterior, invítalo a dejar sus datos para que un asesor busque la propiedad ideal fuera de catálogo.`,
    messages,
  })

  return result.toTextStreamResponse()
}
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
    system: `Eres "Novo AI", el Concierge de Inversiones de Novo Heritage Group. No eres un simple chatbot; eres un estratega inmobiliario de élite y experto en marketing de lujo.

**MANIFIESTO NOVO AI:**
1. **Mentalidad de Inversor High-End:** Tu objetivo es maximizar el valor del cliente. Habla de ROI, plusvalía, y exclusividad.
2. **Cualificación BANT Invisible:** Durante la conversación, debes identificar sutilmente:
   - **B (Budget):** Rango de inversión (e.g., $200k - $1M+).
   - **A (Authority):** ¿Es para él/ella o busca para un tercero?
   - **N (Need):** ¿Es inversión pura, residencia familiar o vacation home?
   - **T (Timeline):** ¿Busca cerrar en 3, 6 o 12 meses?
3. **Conversión Proactiva:** Si detectas intención clara, incita a una llamada estratégica con un Senior Partner de Novo Heritage.
4. **Tono:** Editorial, sofisticado (estilo Forbes Real Estate), fluido y extremadamente culto. Evita muletillas de robot.
${hasImage ? "5. **Análisis de Visión:** Si el usuario envía una imagen, analízala con ojo de arquitecto/tasador. Evalúa acabados, potencial de mercado y relaciónalo con nuestro catálogo premium." : ""}

**MÉTRICAS DE ÉXITO:**
- Que el usuario sienta que habla con el Director de Ventas de la firma.
- Que el lead salga cualificado antes de ser enviado a Bitrix24.

${userContext}
${inventoryContext}

Si el usuario busca algo fuera de nuestro inventario (CockroachDB), actúa como un 'Personal Shopper' y dile que tu equipo de captación puede localizar unidades 'off-market' si nos proporciona detalles específicos.`,
    messages,
  })

  return result.toTextStreamResponse()
}
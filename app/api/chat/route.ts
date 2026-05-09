import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import cockroachDb from "@/lib/cockroach-db"

// OpenRouter Client
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

export const maxDuration = 45

// Ensure user profile table exists
async function ensureTables() {
  try {
    await cockroachDb`
      CREATE TABLE IF NOT EXISTS public.perfil_usuario (
        id SERIAL PRIMARY KEY,
        usuario_id VARCHAR(100) UNIQUE NOT NULL,
        intereses JSONB DEFAULT '[]',
        tipo_usuario VARCHAR(50) DEFAULT 'lead',
        busquedas_recientes JSONB DEFAULT '[]',
        ultima_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (e) {
    console.error("DB Init failed:", e);
  }
}

export async function POST(req: Request) {
  const { messages, userId } = await req.json()

  await ensureTables();

  // Detect if any message has an attachment (Vision task)
  const hasImage = messages.some((msg: any) => msg.experimental_attachments && msg.experimental_attachments.length > 0);

  // 1. Fetch/Initialize User Profile from CockroachDB
  let userContext = "";
  if (userId && userId !== "anonymous") {
    try {
      const [profile] = await cockroachDb`
        SELECT * FROM public.perfil_usuario WHERE usuario_id = ${userId} LIMIT 1
      `;
      
      if (profile) {
        userContext = `\n\n**PERFIL DEL CLIENTE:**
- Intereses: ${JSON.stringify(profile.intereses)}
- Nivel: ${profile.tipo_usuario}
- Historial: ${JSON.stringify(profile.busquedas_recientes)}
Personaliza tu asesoría basándote en su historial.`;
      } else {
        // Create initial profile
        await cockroachDb`
          INSERT INTO public.perfil_usuario (usuario_id) VALUES (${userId})
          ON CONFLICT (usuario_id) DO NOTHING
        `;
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
    
    // Multi-keyword location extraction
    const locations = ["piantini", "naco", "punta cana", "cap cana", "bavaro", "casa de campo", "romana"];
    const foundLocation = locations.find(loc => lastMessageLower.includes(loc));

    if (foundLocation) {
      const sector = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1);
      listings = await cockroachDb`
        SELECT id, multimedia, nombre_proyecto, precio, zona, descripcion_limpia, es_constructora_oficial 
        FROM public.inventario_digital 
        WHERE (zona ILIKE ${'%' + sector + '%'} OR nombre_proyecto ILIKE ${'%' + sector + '%'})
          AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', '')
        ORDER BY es_constructora_oficial DESC, id DESC LIMIT 5
      `;
    } else {
      listings = await cockroachDb`
        SELECT id, multimedia, nombre_proyecto, precio, zona, descripcion_limpia, es_constructora_oficial 
        FROM public.inventario_digital 
        WHERE descripcion_limpia IS NOT NULL AND LENGTH(descripcion_limpia) > 20
          AND nombre_proyecto NOT IN ('Sin nombre', 'Parseo fallido', 'No disponible', '')
        ORDER BY id DESC LIMIT 5
      `;
    }
    
    if (listings.length > 0) {
      inventoryContext = `\n\n**INVENTARIO ESTRATÉGICO Y REGLAS DE PRESENTACIÓN (¡MUY IMPORTANTE!):**

Para las propiedades en el inventario actual, **SIEMPRE DEBES MOSTRARLAS USANDO ESTE FORMATO MARKDOWN EXACTO**:

[![](URL_PRIMERA_IMAGEN)](https://novo-heritage.vercel.app/bienes-raices/propiedades/ID_PROPIEDAD)
### [NOMBRE_DEL_PROYECTO](https://novo-heritage.vercel.app/bienes-raices/propiedades/ID_PROPIEDAD)
**Zona**: ZONA_AQUI | **Precio**: PRECIO_AQUI

A continuación tienes el inventario disponible:
${listings.map((l: any) => {
  let img = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop";
  try {
     let parsed = l.multimedia;
     if (typeof parsed === 'string') parsed = JSON.parse(parsed);
     if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
     else if (typeof parsed === 'object' && parsed !== null) img = Object.values(parsed)[0] as string;
  } catch(e) {}
  return `- ID_PROPIEDAD: ${l.id}\n- NOMBRE_DEL_PROYECTO: ${l.nombre_proyecto}\n- ZONA_AQUI: ${l.zona}\n- PRECIO_AQUI: ${l.precio} ${l.es_constructora_oficial ? '(✅ Oficial)' : ''}\n- URL_PRIMERA_IMAGEN: ${img}\n  ${(l.descripcion_limpia || '').substring(0, 150)}`;
}).join('\n\n')}

¡Recuerda siempre insertar la imagen clickeable siguiendo estrictamente el formato Markdown solicitado!`;
    }
  } catch (e) {
    console.error("Inventory RAG failed:", e);
  }

  const modelName = hasImage ? "meta-llama/llama-3.2-11b-vision-instruct" : "meta-llama/llama-3.1-405b-instruct";

  const result = streamText({
    model: openrouter(modelName) as any,
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
${hasImage ? "5. **Análisis de Visión:** Si el usuario envía una imagen, analízala con ojo de arquitecto/tasador. Evalúa acabados, potencial de mercado y relaciónalo con nuestro catálogo premium de CockroachDB." : ""}

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
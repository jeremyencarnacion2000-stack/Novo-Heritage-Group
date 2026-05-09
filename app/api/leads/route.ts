import { NextResponse } from "next/server"
import cockroachDb from "@/lib/cockroach-db"
import { sendBrandedEmail, sendClientConfirmationEmail } from "@/lib/mail"

// Ensure leads table exists in CockroachDB
async function ensureLeadsTable() {
  try {
    await cockroachDb`
      CREATE TABLE IF NOT EXISTS public.leads (
        id SERIAL PRIMARY KEY,
        division VARCHAR(50) NOT NULL,
        property_id VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        source VARCHAR(100),
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (e) {
    console.error("Failed to ensure leads table:", e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.division || !body?.name || !body?.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await ensureLeadsTable();

    // 1. Insert into CockroachDB
    const data = await cockroachDb`
      INSERT INTO public.leads (division, property_id, name, email, phone, message, source, details)
      VALUES (
        ${body.division}, 
        ${body.propertyId || null}, 
        ${body.name}, 
        ${body.email}, 
        ${body.phone || null}, 
        ${body.message || null}, 
        ${body.source || 'web'},
        ${body.details || {}}
      )
      RETURNING *
    `;

    const lead = data[0];

    await sendBrandedEmail({
        name: body.name,
        email: body.email,
        phone: body.phone || 'No provisto',
        division: body.division,
        message: body.message,
        propertyId: body.propertyId,
        details: body.details
    });

    // 2.5 Send Auto-Response to Client if it's a property listing request
    if (body.source === 'formulario_vender_alquilar' || body.division === 'bienes_raices') {
        const serviceType = body.details?.Servicio_Solicitado || 'Publicar';
        await sendClientConfirmationEmail(body.email, body.name, serviceType);
    }

    // 3. Forward to Bitrix24 (Disabled if not configured or paid)
    const bitrixWebhook = process.env.BITRIX24_WEBHOOK_URL;
    if (bitrixWebhook && !bitrixWebhook.includes('YOUR_BITRIX')) {
      try {
        let enhancedMessage = `División: ${body.division}\nMensaje: ${body.message || 'Sin mensaje'}`;
        if (body.propertyId) enhancedMessage += `\nPropiedad: ${body.propertyId}`;
        if (body.details) {
            enhancedMessage += `\n\n--- Detalles Extras ---\n`;
            for (const [key, val] of Object.entries(body.details)) {
                if (val && typeof val === 'string' && val.trim() !== '') {
                    enhancedMessage += `${key}: ${val}\n`;
                }
            }
        }

        const bitrixPayload = {
          fields: {
            "TITLE": `Novo Lead - ${body.division.toUpperCase()}`,
            "NAME": body.name,
            "EMAIL": [{ "VALUE": body.email, "VALUE_TYPE": "WORK" }],
            "PHONE": body.phone ? [{ "VALUE": body.phone, "VALUE_TYPE": "WORK" }] : [],
            "COMMENTS": enhancedMessage,
            "SOURCE_ID": "WEB"
          }
        };

        await fetch(bitrixWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bitrixPayload)
        });
      } catch (bitrixError) {
        console.error("Bitrix24 integration error:", bitrixError);
      }
    }

    // 4. Forward to N8n Webhook
    const n8nWebhook = process.env.N8N_WEBHOOK_URL || "https://suskj501-n8n.hf.space/webhook/leads";
    const n8nApiKey = process.env.N8N_API_KEY;
    
    try {
        await fetch(n8nWebhook, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...(n8nApiKey ? { 'Authorization': `Bearer ${n8nApiKey}` } : {})
            },
            body: JSON.stringify({
                lead_id: lead.id,
                db: 'cockroach',
                timestamp: new Date().toISOString(),
                ...body
            })
        });
    } catch (n8nError) {
        console.error("N8n integration error:", n8nError);
    }

    return NextResponse.json({ ok: true, lead: lead }, { status: 201 })
  } catch (e) {
    console.error("Leads API error:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


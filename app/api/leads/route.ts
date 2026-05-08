import { NextResponse } from "next/server"
import cockroachDb from "@/lib/cockroach-db"

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

    // 2. Forward to Bitrix24 (Disabled if not configured or paid)
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

    // 3. Forward to N8n Webhook (For lead qualification/notification)
    const n8nWebhook = process.env.N8N_WEBHOOK_URL || process.env.N8N_LEADS_WEBHOOK;
    if (n8nWebhook) {
        try {
            await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: data[0].id,
                    db: 'cockroach',
                    timestamp: new Date().toISOString(),
                    ...body
                })
            });
        } catch (n8nError) {
            console.error("N8n integration error:", n8nError);
        }
    }

    return NextResponse.json({ ok: true, lead: data[0] }, { status: 201 })
  } catch (e) {
    console.error("Leads API error:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}



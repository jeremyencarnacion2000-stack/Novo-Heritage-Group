import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.division || !body?.name || !body?.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Insert into local SQL database
    const data = await sql`
      INSERT INTO leads (division, property_id, name, email, phone, message, source)
      VALUES (
        ${body.division}, 
        ${body.propertyId || null}, 
        ${body.name}, 
        ${body.email}, 
        ${body.phone || null}, 
        ${body.message || null}, 
        ${body.source || 'web'}
      )
      RETURNING *
    `;

    // 2. Forward to Bitrix24 if webhook is configured
    const bitrixWebhook = process.env.BITRIX24_WEBHOOK_URL;
    if (bitrixWebhook) {
      try {
        let enhancedMessage = `División: ${body.division}\nMensaje: ${body.message || 'Sin mensaje'}`;
        if (body.propertyId) enhancedMessage += `\nPropiedad: ${body.propertyId}`;
        if (body.details) {
            enhancedMessage += `\n\n--- Detalles Extras ---\n`;
            for (const [key, val] of Object.entries(body.details)) {
                if (val && typeof val === 'string' && val.trim() !== '') {
                    // Custom label maps for readability in CRM
                    const labelMap: Record<string, string> = {
                        hotel: "Hotel Seleccionado",
                        hotelImage: "Imagen del Hotel",
                        hotelRating: "Calificación",
                        hotelDescription: "Descripción Escaneada",
                        rooms: "Habitaciones",
                        guests: "Huéspedes",
                        adults: "Adultos",
                        children: "Niños",
                        roomType: "Tipo de Habitación",
                        insuranceType: "Tipo de Seguro",
                        coverageAmount: "Cobertura",
                        origin: "Origen del Viaje",
                        destination: "Destino",
                        travelClass: "Clase de Viaje",
                        checkIn: "Fecha de Salida",
                        checkOut: "Fecha de Regreso",
                    };
                    const label = labelMap[key] || key;
                    enhancedMessage += `${label}: ${val}\n`;
                }
            }
        }

        const bitrixPayload = {
          fields: {
            "TITLE": `Nuevo Lead - ${body.division.toUpperCase()}`,
            "NAME": body.name,
            "EMAIL": [{ "VALUE": body.email, "VALUE_TYPE": "WORK" }],
            "PHONE": body.phone ? [{ "VALUE": body.phone, "VALUE_TYPE": "WORK" }] : [],
            "COMMENTS": enhancedMessage,
            "SOURCE_ID": "WEB",
            "UTM_SOURCE": body.source || 'web'
          },
          params: { "REGISTER_SONET_EVENT": "Y" }
        };

        const bitrixRes = await fetch(bitrixWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bitrixPayload)
        });

        if (!bitrixRes.ok) {
          console.error("Bitrix24 forwarding failed:", await bitrixRes.text());
        }
      } catch (bitrixError) {
        console.error("Bitrix24 integration error:", bitrixError);
      }
    }

    // 3. Forward full native payload to N8n Webhook
    const n8nWebhook = process.env.N8N_WEBHOOK_URL || process.env.N8N_LEADS_WEBHOOK;
    if (n8nWebhook) {
        try {
            const n8nRes = await fetch(n8nWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lead_id: data[0].id,
                    timestamp: new Date().toISOString(),
                    ...body
                })
            });

            if (!n8nRes.ok) {
                console.error("N8n forwarding failed:", await n8nRes.text());
            }
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


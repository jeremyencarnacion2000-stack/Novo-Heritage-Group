import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendBrandedEmail(leadData: any) {
  const { name, email, phone, division, message, propertyId, details } = leadData;
  
  // Custom subject and titles based on division
  let subject = "Novo Heritage - Nuevo Lead Capturado";
  let headTitle = "Nueva Solicitud de Contacto";
  
  const divLower = (division || '').toLowerCase();
  
  if (divLower === 'bienes_raices' || divLower === 'bienes raíces') {
    subject = "Novo Heritage - Nueva Solicitud Inmobiliaria";
    headTitle = "Propiedades e Inversión";
  } else if (divLower === 'seguros') {
    subject = "Novo Heritage - Nueva Cotización de Seguro";
    headTitle = "Protección y Respaldo";
  } else if (divLower === 'turismo') {
    subject = "Novo Heritage - Reserva Turismo Express";
    headTitle = "Experiencias de Viaje";
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          body { font-family: 'Inter', -apple-system, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 40px; text-align: center; border-bottom: 2px solid #D4AF37; }
          .logo { color: #D4AF37; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 4px; }
          .content { padding: 40px; }
          .division-badge { display: inline-block; padding: 6px 12px; background: rgba(212, 175, 55, 0.1); border: 1px solid #D4AF37; color: #D4AF37; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
          h1 { font-size: 20px; font-weight: 700; margin: 0 0 10px; color: #ffffff; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
          .info-grid { background: #111111; padding: 25px; border-radius: 8px; border: 1px solid #1a1a1a; margin-top: 20px; }
          .info-item { margin-bottom: 15px; border-bottom: 1px solid #1f1f1f; padding-bottom: 10px; }
          .info-item:last-child { border-bottom: none; margin-bottom: 0; }
          .info-label { color: #71717a; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
          .info-value { color: #ffffff; font-size: 15px; font-weight: 500; }
          .footer { padding: 30px; text-align: center; background: #050505; border-top: 1px solid #1a1a1a; }
          .footer p { font-size: 11px; margin: 0; color: #3f3f46; letter-spacing: 2px; text-transform: uppercase; }
          .accent { color: #D4AF37; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NOVO HERITAGE</div>
          </div>
          <div class="content">
            <div class="division-badge">${headTitle}</div>
            <h1>Nuevo Lead: <span class="accent">${name}</span></h1>
            <p>Se ha recibido una nueva solicitud a través del ecosistema digital. Aquí están los detalles primarios:</p>
            
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Solicitante</span>
                <div class="info-value">${name}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Correo Electrónico</span>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-item">
                <span class="info-label">Teléfono de Contacto</span>
                <div class="info-value">${phone || 'No provisto'}</div>
              </div>
              <div class="info-item">
                <span class="info-label">División de Interés</span>
                <div class="info-value">${division?.toUpperCase() || 'GENERAL'}</div>
              </div>
              ${propertyId ? `
              <div class="info-item">
                <span class="info-label">ID de Propiedad</span>
                <div class="info-value">${propertyId}</div>
              </div>` : ''}
              ${message ? `
              <div class="info-item">
                <span class="info-label">Mensaje / Nota</span>
                <div class="info-value">${message}</div>
              </div>` : ''}
              ${details && Object.keys(details).length > 0 ? `
              <div class="info-item">
                <span class="info-label">Información Adicional</span>
                <div class="info-value" style="font-size: 12px; color: #888;">
                  ${Object.entries(details).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join('<br/>')}
                </div>
              </div>` : ''}
            </div>
          </div>
          <div class="footer">
            <p>© 2026 NOVO HERITAGE GROUP</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Novo Heritage CRM" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL || 'novoheritagesales@gmail.com',
      subject: subject,
      html: html,
    });
    console.log("Branded email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send branded email:", error);
    return { success: false, error };
  }
}

export async function sendClientConfirmationEmail(clientEmail: string, clientName: string, serviceType: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          body { font-family: 'Inter', -apple-system, sans-serif; background-color: #050505; color: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 60px 40px; text-align: center; border-bottom: 2px solid #D4AF37; }
          .logo { color: #D4AF37; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 6px; }
          .content { padding: 50px 40px; text-align: center; }
          h1 { font-size: 24px; font-weight: 700; margin: 0 0 20px; color: #ffffff; letter-spacing: 1px; }
          p { color: #a1a1aa; font-size: 16px; line-height: 1.8; margin: 0 auto 30px; max-width: 450px; }
          .button { display: inline-block; padding: 16px 32px; background: #D4AF37; color: #000; font-weight: 700; text-decoration: none; border-radius: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
          .footer { padding: 40px; text-align: center; background: #050505; border-top: 1px solid #1a1a1a; }
          .footer p { font-size: 10px; margin: 0; color: #3f3f46; letter-spacing: 2px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NOVO HERITAGE</div>
          </div>
          <div class="content">
            <h1>Estimado/a ${clientName},</h1>
            <p>Hemos recibido con éxito su solicitud para <strong style="color: #D4AF37;">${serviceType.toLowerCase()}</strong> su propiedad.</p>
            <p>Nuestro equipo de curadores patrimoniales está revisando los detalles proporcionados para asegurar que cumplan con nuestros estándares de exclusividad. Nos pondremos en contacto con usted en un plazo de 24 a 48 horas laborales.</p>
            <div style="margin-top: 40px;">
              <div class="button">SOLICITUD EN REVISIÓN</div>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 NOVO HERITAGE GROUP | EXCLUSIVE MANAGEMENT</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Novo Heritage" <${process.env.SMTP_USER}>`,
      to: clientEmail,
      subject: "Recibimos su solicitud de propiedad - Novo Heritage",
      html: html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send client confirmation email:", error);
    return { success: false, error };
  }
}

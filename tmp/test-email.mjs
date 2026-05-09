import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Manual env parser
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/"/g, '').split('#')[0].trim();
    }
});

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '587'),
  secure: env.SMTP_SECURE === 'true',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

async function testEmail() {
  console.log('--- Iniciando Prueba de Correo Novo Heritage ---');
  console.log(`SMTP User: ${env.SMTP_USER}`);
  console.log(`Enviando a: ${env.RECIPIENT_EMAIL}`);

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #050505; color: #ffffff; padding: 40px; border: 1px solid #D4AF37; border-radius: 8px;">
      <h1 style="color: #D4AF37; letter-spacing: 4px;">NOVO HERITAGE</h1>
      <p style="font-size: 18px;">PRUEBA DE CONEXIÓN EXITOSA</p>
      <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 20px 0;">
      <p style="color: #a1a1aa;">Este es un correo de validación para confirmar que la configuración SMTP y la Contraseña de Aplicación funcionan correctamente.</p>
      <div style="margin-top: 30px; padding: 20px; background: #111; border-radius: 4px;">
        <p style="margin: 0; font-weight: bold; color: #D4AF37;">Estado del Sistema: <span style="color: #00ff00;">VIVO</span></p>
      </div>
      <p style="font-size: 10px; color: #333; margin-top: 40px;">© 2026 NOVO HERITAGE GROUP</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Test Novo Heritage" <${env.SMTP_USER}>`,
      to: env.RECIPIENT_EMAIL || 'novoheritagesales@gmail.com',
      subject: "Test de Configuración - Novo Heritage",
      html: html,
    });
    console.log('¡Éxito! Correo enviado.');
    console.log('ID del Mensaje:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

testEmail();

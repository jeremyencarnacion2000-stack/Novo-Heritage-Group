-- Neon Database Setup for Intelligent Tracking and Automation System

-- 1. Usuarios (Basic info)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tracking de Eventos (High frequency)
CREATE TABLE IF NOT EXISTS tracking_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT, -- Can be session ID or UUID
  evento TEXT NOT NULL, -- 'view', 'click', 'scroll', 'stay'
  seccion TEXT NOT NULL, -- 'seguros', 'bienes-raices', 'turismo'
  tiempo_en_segundos INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Perfil de Usuario (The Brain)
CREATE TABLE IF NOT EXISTS perfil_usuario (
  usuario_id TEXT PRIMARY KEY,
  tipo_usuario TEXT DEFAULT 'visitor', -- 'inversionista', 'cliente_seguros', 'turista'
  intereses JSONB DEFAULT '[]',
  score_interes JSONB DEFAULT '{"inmuebles": 0, "seguros": 0, "turismo": 0}',
  ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Datos de Proyectos (WhatsApp Ingestion)
CREATE TABLE IF NOT EXISTS proyectos_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_proyecto TEXT NOT NULL,
  tipo_contenido TEXT, -- 'plano', 'imagen', 'documento', 'drive_link'
  contenido TEXT, -- Extract or description
  url TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Logs de Emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT,
  contenido TEXT,
  tipo_email TEXT, -- 'reactivacion', 'bienvenida'
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Historial (Legacy compatibility)
CREATE TABLE IF NOT EXISTS historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  seccion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_tracking_usuario ON tracking_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_nombre ON proyectos_data(nombre_proyecto);

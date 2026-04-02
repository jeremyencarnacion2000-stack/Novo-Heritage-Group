-- ================================================
-- PLATAFORMA MULTISECTORIAL - SCHEMA (NEON)
-- ================================================

-- 1. Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nombre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla: tracking_eventos
CREATE TABLE IF NOT EXISTS tracking_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id TEXT NOT NULL,
    evento TEXT NOT NULL,
    seccion TEXT NOT NULL,
    tiempo_en_segundos INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla: perfil_usuario
CREATE TABLE IF NOT EXISTS perfil_usuario (
    usuario_id TEXT PRIMARY KEY,
    tipo_usuario TEXT,
    intereses JSONB DEFAULT '{}'::jsonb,
    score_interes JSONB DEFAULT '{"inversionista": 0, "cliente": 0, "viajero": 0}'::jsonb,
    ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla: email_logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id TEXT NOT NULL,
    contenido TEXT,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla: proyectos_data
CREATE TABLE IF NOT EXISTS proyectos_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_proyecto TEXT,
    tipo_contenido TEXT,
    contenido TEXT,
    url TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_tracking_usuario ON tracking_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_nombre ON proyectos_data(nombre_proyecto);

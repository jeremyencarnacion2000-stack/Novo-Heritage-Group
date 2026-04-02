-- COMPREHENSIVE NEON DATABASE SETUP
-- This script initializes ALL project tables for Novo Heritage.

-- 1. Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  email_3days BOOLEAN DEFAULT true,
  email_7days BOOLEAN DEFAULT true,
  email_14days BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 1.1 Usuario Preferencias
CREATE TABLE IF NOT EXISTS usuario_preferencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'es',
    notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Propiedades (Bienes Raíces)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  address TEXT,
  location TEXT,
  city TEXT DEFAULT 'Santo Domingo',
  sector TEXT,
  status TEXT DEFAULT 'available', -- 'available', 'sold', 'rented'
  transaction_type TEXT DEFAULT 'venta', -- 'venta', 'alquiler'
  price DECIMAL(15,2),
  type TEXT, -- 'casa', 'apartamento', 'penthouse', 'villa'
  bedrooms INT,
  bathrooms INT,
  area DECIMAL(10,2),
  year_built INT,
  description TEXT,
  features TEXT[], -- Array of features
  amenities TEXT[], -- Array of amenities
  image TEXT, -- Primary image URL
  images TEXT[], -- Gallery URLs
  agent_name TEXT DEFAULT 'Agente Novo Heritage',
  agent_phone TEXT,
  estimated_rent_monthly DECIMAL(15,2),
  hoa_fee_monthly DECIMAL(15,2),
  taxes_annual DECIMAL(15,2),
  maintenance_annual DECIMAL(15,2),
  occupancy_rate DECIMAL(5,2),
  reference TEXT,
  garage INT DEFAULT 0,
  parking INT DEFAULT 0,
  peb TEXT DEFAULT 'B', -- Professional Energy Class
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Hoteles (Turismo)
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  rating DECIMAL(3,1),
  rating_text TEXT,
  reviews INT DEFAULT 0,
  price DECIMAL(15,2),
  stars INT DEFAULT 0,
  type TEXT, -- 'Resort', 'Boutique', 'Hotel', etc.
  amenities TEXT[],
  image TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Leads (Contactos y Solicitudes)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL, -- 'bienes_raices', 'seguros', 'turismo'
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'web',
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'lost', 'won'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Intelligent Tracking
CREATE TABLE IF NOT EXISTS tracking_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT, -- Can be email, UUID or guest session ID
  evento TEXT NOT NULL, -- 'view', 'click', 'scroll', 'stay'
  seccion TEXT NOT NULL, 
  tiempo_en_segundos INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Perfil de Usuario (AI Brain)
CREATE TABLE IF NOT EXISTS perfil_usuario (
  usuario_id TEXT PRIMARY KEY,
  tipo_usuario TEXT DEFAULT 'visitor',
  intereses JSONB DEFAULT '[]',
  score_interes JSONB DEFAULT '{"inmuebles": 0, "seguros": 0, "turismo": 0}',
  ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. WhatsApp Projects Data (Ingestion)
CREATE TABLE IF NOT EXISTS proyectos_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_proyecto TEXT NOT NULL,
  tipo_contenido TEXT, -- 'plano', 'imagen', 'documento', 'drive_link'
  contenido TEXT,
  url TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Logs y Notificaciones
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT,
  email TEXT,
  contenido TEXT,
  tipo_email TEXT,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Memoria de Chat (IA)
CREATE TABLE IF NOT EXISTS mensajes_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id TEXT NOT NULL,
  rol TEXT NOT NULL, -- 'user', 'assistant'
  contenido TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prop_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_prop_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_tracking_usr ON tracking_eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proj_name ON proyectos_data(nombre_proyecto);
CREATE INDEX IF NOT EXISTS idx_msg_usr ON mensajes_historial(usuario_id, created_at);

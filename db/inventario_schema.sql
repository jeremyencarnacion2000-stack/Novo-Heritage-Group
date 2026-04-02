-- Tabla para centralizar activos digitales de proyectos (Imágenes, Drive, Planos)
CREATE TABLE IF NOT EXISTS inventario_digital (
    id SERIAL PRIMARY KEY,
    nombre_proyecto VARCHAR(255),
    tipo_activo VARCHAR(50), -- 'IMAGEN', 'PLANO', 'DRIVE_LINK', 'DOCUMENTO'
    url_activo TEXT UNIQUE, -- Evita duplicados por URL exacto
    descripcion TEXT,
    metadata JSONB, -- Datos extra: { "habitaciones": 3, "precio_ref": 150000, "ubicacion": "Playa" }
    stock_disponible BOOLEAN DEFAULT TRUE,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsqueda rápida por nombre de proyecto
CREATE INDEX IF NOT EXISTS idx_proyecto ON inventario_digital(nombre_proyecto);

-- Función para actualizar el timestamp automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventario_modtime
BEFORE UPDATE ON inventario_digital
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

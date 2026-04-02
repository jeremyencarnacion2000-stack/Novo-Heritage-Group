# Supabase Edge Functions - Novo Heritage Group

Este proyecto contiene las Edge Functions de Supabase para el sistema de Novo Heritage Group.

## Funciones Disponibles

### 1. `manejo_usuarios`
**Ubicación:** `supabase/functions/manejo_usuarios/index.ts`

**Funcionalidad:**
- Crear usuarios nuevos
- Actualizar información de usuarios existentes
- Eliminar usuarios
- Gestionar flags de email: `email_3days`, `email_7days`, `email_14days`

**Endpoint:** `POST /functions/v1/manejo_usuarios`

**Request Body:**
```json
{
  "action": "create|update|delete",
  "user": {
    "id": "uuid", // requerido solo para update/delete
    "email": "user@example.com", // requerido
    "name": "User Name",
    "phone": "+1234567890",
    "preferences": {},
    "email_3days": true,
    "email_7days": true,
    "email_14days": true
  }
}
```

### 2. `registrar_historial`
**Ubicación:** `supabase/functions/registrar_historial/index.ts`

**Funcionalidad:**
- Registrar actividad de usuario en la tabla `historial`
- Capturar automáticamente IP y User Agent
- Soporte para metadatos adicionales

**Endpoint:** `POST /functions/v1/registrar_historial`

**Request Body:**
```json
{
  "history": {
    "user_id": "uuid",
    "action": "login|page_view|button_click|etc",
    "details": {},
    "metadata": {}
  }
}
```

### 3. `email_inactividad`
**Ubicación:** `supabase/functions/email_inactividad/index.ts`

**Funcionalidad:**
- Revisar inactividad de usuarios
- Enviar correos automáticos usando Brevo API
- Soporte para diferentes niveles de inactividad (3, 7, 14 días)

**Endpoint:** `POST /functions/v1/email_inactividad`

**Request Body:**
```json
{
  // Puede estar vacío para ejecución automática
}
```

### 4. `usuario_preferencias`
**Ubicación:** `supabase/functions/usuario_preferencias/index.ts`

**Funcionalidad:**
- Obtener preferencias de usuario
- Actualizar preferencias de usuario
- Gestionar configuración de tema, idioma, notificaciones, etc.

**Endpoints:**
- `GET /functions/v1/usuario_preferencias?user_id=uuid`
- `POST /functions/v1/usuario_preferencias`

**Request Body para POST:**
```json
{
  "action": "get|update",
  "user_id": "uuid",
  "preferences": {
    "theme": "light|dark",
    "language": "es|en",
    "notifications": true,
    "marketing_emails": true
  }
}
```

### 5. `analisis_historial`
**Ubicación:** `supabase/functions/analisis_historial/index.ts`

**Funcionalidad:**
- Análisis de actividad de usuarios individuales
- Análisis global de toda la plataforma
- Métricas de engagement y retención
- Tendencias de actividad diarias

**Endpoint:** `POST /functions/v1/analisis_historial`

**Request Body:**
```json
{
  "user_id": "uuid", // opcional - si no se incluye, análisis global
  "date_from": "2024-01-01T00:00:00Z", // opcional
  "date_to": "2024-12-31T23:59:59Z", // opcional
  "action_filter": ["login", "page_view"], // opcional
  "limit": 1000, // opcional
  "offset": 0 // opcional
}
```

## Configuración

### Variables de Entorno Requeridas

Asegúrate de configurar estas variables en tu proyecto de Supabase:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BREVO_API_KEY=your_brevo_api_key
```

### Instalación y Despliegue

1. **Instalar Supabase CLI:**
```bash
npm install -g supabase
```

2. **Iniciar sesión:**
```bash
supabase login
```

3. **Enlazar proyecto:**
```bash
supabase link --project-ref your-project-ref
```

4. **Desplegar funciones:**
```bash
supabase functions deploy
```

### Desarrollo Local

1. **Iniciar Supabase local:**
```bash
supabase start
```

2. **Servir funciones localmente:**
```bash
supabase functions serve
```

3. **Probar función:**
```bash
curl -X POST 'http://localhost:54321/functions/v1/manejo_usuarios' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"action": "create", "user": {"email": "test@example.com"}}'
```

## Integración con n8n

Todas las funciones están diseñadas para ser completamente compatibles con n8n:

- **Formato JSON:** Todas las respuestas siguen el formato `application/json`
- **Códigos de Estado HTTP:** Respuestas apropiadas (200, 201, 400, 404, 500)
- **Headers CORS:** Configurados para permitir llamadas desde cualquier origen
- **Autenticación:** Compatible con Bearer tokens de Supabase

### Ejemplo de Workflow n8n

1. **HTTP Request Node:**
   - Method: POST
   - URL: `{{ $env.SUPABASE_URL }}/functions/v1/manejo_usuarios`
   - Headers:
     ```
     Authorization: Bearer {{ $env.SUPABASE_ANON_KEY }}
     Content-Type: application/json
     ```

2. **Body:**
   ```json
   {
     "action": "create",
     "user": {
       "email": "={{ $json.email }}",
       "name": "={{ $json.name }}"
     }
   }
   ```

## Base de Datos

### Tablas Requeridas

Las funciones esperan las siguientes tablas en tu base de datos:

#### `usuarios`
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    email_3days BOOLEAN DEFAULT true,
    email_7days BOOLEAN DEFAULT true,
    email_14days BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `historial`
```sql
CREATE TABLE historial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `usuario_preferencias`
```sql
CREATE TABLE usuario_preferencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'es',
    notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migraciones

Ejecuta las migraciones para crear las tablas:

```bash
supabase db push
```

## Monitoreo y Logs

### Ver logs de funciones:

```bash
supabase functions logs
```

### Ver logs de función específica:

```bash
supabase functions logs manejo_usuarios
```

## Seguridad

- **Row Level Security (RLS):** Habilitado en todas las tablas
- **Service Role:** Las funciones usan el service role key para operaciones administrativas
- **Validación:** Todas las entradas son validadas antes del procesamiento
- **Rate Limiting:** Implementado a nivel de Supabase

## Soporte

Para soporte técnico o preguntas sobre las Edge Functions, contacta al equipo de desarrollo.
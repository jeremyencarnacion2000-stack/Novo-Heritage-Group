# Frontend Integration - Supabase Edge Functions

Esta guía explica cómo integrar las Edge Functions de Supabase en tu aplicación Next.js/React.

## Instalación

Asegúrate de tener las variables de entorno configuradas en tu archivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Uso Básico

### Importar las funciones

```typescript
import {
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  registrarHistorialSimple,
  obtenerPreferenciasUsuario,
  actualizarPreferenciasUsuario,
  analisisUsuario,
  analisisGlobal,
  procesarEmailsInactividad
} from '@/lib/supabase/functions'
```

### Ejemplos de uso

#### Crear un usuario
```typescript
try {
  const result = await crearUsuario({
    email: 'usuario@example.com',
    name: 'Juan Pérez',
    phone: '+1234567890',
    preferences: { theme: 'dark' },
    email_3days: true,
    email_7days: true,
    email_14days: false
  })
  console.log('Usuario creado:', result.user)
} catch (error) {
  console.error('Error:', error.message)
}
```

#### Registrar actividad
```typescript
await registrarHistorialSimple(
  'fb2b6b83-7e9f-4e16-a1b5-593f2b2ab3b2',
  'seguros'
)
```

#### Obtener preferencias de usuario
```typescript
const { preferences } = await obtenerPreferenciasUsuario(userId)
console.log('Tema:', preferences.theme)
```

#### Actualizar preferencias
```typescript
await actualizarPreferenciasUsuario(userId, {
  theme: 'light',
  language: 'es',
  notifications: true
})
```

#### Análisis de usuario
```typescript
const analysis = await analisisUsuario(userId, '2024-01-01', '2024-12-31')
console.log('Total de acciones:', analysis.user_analysis.total_actions)
```

## Hook de Tracking Automático

### `useHistorialTracker`

Hook que automáticamente registra la actividad del usuario:

```typescript
import { useHistorialTracker } from '@/hooks/use-historial-tracker'

function MyComponent() {
  const userId = 'fb2b6b83-7e9f-4e16-a1b5-593f2b2ab3b2'

  useHistorialTracker({
    userId,
    enabled: true,
    trackPageViews: true,
    trackClicks: true
  })

  return <div>Contenido</div>
}
```

### Tracking de clics

Para trackear clics en elementos específicos, añade el atributo `data-track`:

```jsx
<button data-track="button_click" data-track-details='{"button": "cta_principal"}'>
  Click me
</button>
```

## Manejo de Errores

Todas las funciones incluyen manejo de errores específico:

```typescript
try {
  await crearUsuario(userData)
} catch (error) {
  if (error.message.includes('foreign key constraint')) {
    console.error('Usuario no encontrado')
  } else if (error.message.includes('invalid uuid')) {
    console.error('ID de usuario inválido')
  } else if (error.message.includes('duplicate key value')) {
    console.error('El email ya está registrado')
  } else {
    console.error('Error desconocido:', error.message)
  }
}
```

## Integración con Context/Auth

### Ejemplo con Context de usuario

```typescript
import { createContext, useContext, useEffect } from 'react'
import { useHistorialTracker } from '@/hooks/use-historial-tracker'

const UserContext = createContext<{ userId: string | null }>({ userId: null })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)

  // Tracking automático cuando hay usuario
  useHistorialTracker({
    userId: userId || undefined,
    enabled: !!userId
  })

  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
```

## Integración con n8n

### HTTP Request Node Configuration

```json
{
  "method": "POST",
  "url": "{{ $env.SUPABASE_URL }}/functions/v1/manejo_usuarios",
  "headers": {
    "Authorization": "Bearer {{ $env.SUPABASE_ANON_KEY }}",
    "Content-Type": "application/json"
  },
  "body": {
    "action": "create",
    "user": {
      "email": "={{ $json.email }}",
      "name": "={{ $json.name }}"
    }
  }
}
```

### Workflow de ejemplo

1. **Webhook** → Recibe datos del formulario
2. **HTTP Request** → Llama a `manejo_usuarios` para crear usuario
3. **HTTP Request** → Llama a `registrar_historial` para log activity
4. **Email** → Envía confirmación al usuario

## Tipos TypeScript

```typescript
interface UsuarioData {
  id?: string
  email: string
  name?: string
  phone?: string
  preferences?: Record<string, any>
  email_3days?: boolean
  email_7days?: boolean
  email_14days?: boolean
}

interface HistorialData {
  user_id: string
  action: string
  details?: Record<string, any>
  metadata?: Record<string, any>
}

interface PreferenciasData {
  theme?: string
  language?: string
  notifications?: boolean
  marketing_emails?: boolean
  [key: string]: any
}
```

## Mejores Prácticas

1. **Siempre usar try/catch** para manejar errores
2. **Validar datos** antes de enviar
3. **Usar el hook de tracking** para actividad automática
4. **Implementar loading states** en la UI
5. **Cachear preferencias** localmente cuando sea posible
6. **Usar IDs consistentes** para tracking

## Troubleshooting

### Error: "Failed to fetch"
- Verificar que las variables de entorno estén configuradas
- Revisar que Supabase esté corriendo (`supabase status`)

### Error: "User not found"
- El user_id no existe en la base de datos
- Verificar que el usuario fue creado correctamente

### Error: "Email already exists"
- El email ya está registrado
- Usar `actualizarUsuario` en lugar de `crearUsuario`

### Error: "Invalid UUID"
- El formato del user_id no es válido
- Usar UUID v4 válido
/**
 * Supabase Edge Functions Service Layer
 *
 * This file provides a clean interface to interact with Supabase Edge Functions
 * from the Next.js/React frontend application.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Warning: Missing Supabase environment variables in functions.ts. This may cause issues during build or runtime.')
  }
}

// Types for the service functions
export interface UsuarioData {
  id?: string
  email: string
  name?: string
  phone?: string
  preferences?: Record<string, any>
  email_3days?: boolean
  email_7days?: boolean
  email_14days?: boolean
}

export interface HistorialData {
  user_id: string
  action: string
  details?: Record<string, any>
  metadata?: Record<string, any>
}

export interface PreferenciasData {
  theme?: string
  language?: string
  notifications?: boolean
  marketing_emails?: boolean
  [key: string]: any
}

export interface AnalisisRequest {
  user_id?: string
  date_from?: string
  date_to?: string
  action_filter?: string[]
  limit?: number
  offset?: number
}

/**
 * Generic helper to call Supabase Edge Functions
 */
async function callEdgeFunction(functionName: string, body: any): Promise<any> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are missing. Cannot call edge function.')
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Usuario no encontrado o referencia inválida')
      }
      if (error.message.includes('invalid uuid')) {
        throw new Error('ID de usuario inválido')
      }
      if (error.message.includes('duplicate key value')) {
        throw new Error('El email ya está registrado')
      }
    }

    throw error
  }
}

/**
 * User Management Functions
 */
export async function manejoUsuarios(action: 'create' | 'update' | 'delete', user: UsuarioData) {
  return callEdgeFunction('manejo_usuarios', { action, user })
}

export async function crearUsuario(user: Omit<UsuarioData, 'id'>) {
  return manejoUsuarios('create', user)
}

export async function actualizarUsuario(user: UsuarioData) {
  if (!user.id && !user.email) {
    throw new Error('Se requiere ID o email para actualizar usuario')
  }
  return manejoUsuarios('update', user)
}

export async function eliminarUsuario(userIdOrEmail: string) {
  // Try to determine if it's an ID or email
  if (userIdOrEmail.includes('@')) {
    return manejoUsuarios('delete', { email: userIdOrEmail } as UsuarioData)
  } else {
    return manejoUsuarios('delete', { id: userIdOrEmail } as UsuarioData)
  }
}

/**
 * History Tracking Functions
 */
export async function registrarHistorial(data: HistorialData) {
  return callEdgeFunction('registrar_historial', { history: data })
}

export async function registrarHistorialSimple(userId: string, seccion: string, accion: string = 'page_view') {
  return registrarHistorial({
    user_id: userId,
    action: accion,
    details: { seccion }
  })
}

/**
 * User Preferences Functions
 */
export async function obtenerPreferenciasUsuario(userId: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are missing. Cannot fetch preferences.')
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/usuario_preferencias?user_id=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
  }

  return await response.json()
}

export async function actualizarPreferenciasUsuario(userId: string, preferences: PreferenciasData) {
  return callEdgeFunction('usuario_preferencias', {
    action: 'update',
    user_id: userId,
    preferences
  })
}

/**
 * Analytics Functions
 */
export async function analisisHistorial(request: AnalisisRequest = {}) {
  return callEdgeFunction('analisis_historial', request)
}

export async function analisisUsuario(userId: string, dateFrom?: string, dateTo?: string) {
  return analisisHistorial({
    user_id: userId,
    date_from: dateFrom,
    date_to: dateTo
  })
}

export async function analisisGlobal(dateFrom?: string, dateTo?: string, actionFilter?: string[]) {
  return analisisHistorial({
    date_from: dateFrom,
    date_to: dateTo,
    action_filter: actionFilter
  })
}

/**
 * Inactivity Email Functions
 */
export async function procesarEmailsInactividad() {
  return callEdgeFunction('email_inactividad', {})
}

/**
 * Authentication Functions
 */
export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name?: string
    role?: string
  }
  session?: any
  error?: string
}

/**
 * Initiates Google OAuth Sign-in
 */
export async function signInWithGoogle() {
  const { supabase } = await import("./index")
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Authenticate User with Email/Password
 */
export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const { supabase } = await import("./index")

    if (!data.email || !data.password) {
      return {
        success: false,
        error: "Email y contraseña son requeridos"
      }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.full_name || authData.user.user_metadata?.name,
        role: authData.user.user_metadata?.role || 'user'
      },
      session: authData.session
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Error interno del servidor"
    }
  }
}

/**
 * User Registration Functions
 */
export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  preferences?: Record<string, any>
}

export interface RegisterResponse {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  try {
    // Create user in the system
    const userData: UsuarioData = {
      email: data.email,
      name: data.name,
      phone: data.phone,
      preferences: data.preferences || {},
      email_3days: true,
      email_7days: true,
      email_14days: true
    }

    const result = await crearUsuario(userData)

    if (result.success) {
      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name || data.name
        }
      }
    } else {
      return {
        success: false,
        error: result.error || "Error al crear usuario"
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "Error interno del servidor"
    }
  }
}
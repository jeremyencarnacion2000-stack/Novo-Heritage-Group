/**
 * Supabase Legacy Functions - NEUTRALIZED
 * All Supabase connections have been removed in favor of Neon/Railway.
 */

export async function registrarHistorialSimple(userId: string, seccion: string, accion: string = 'page_view') {
  console.log("[Legacy] registrarHistorialSimple suppressed:", { userId, seccion, accion });
  return { success: true };
}

export async function registerUser(data: any) {
  console.log("[Legacy] registerUser suppressed. Please use Google Login.");
  return { success: false, error: "Legacy registration disabled." };
}

export async function loginUser(data: any) {
  console.log("[Legacy] loginUser suppressed. Please use Google Login.");
  return { success: false, error: "Legacy login disabled." };
}

export async function manejoUsuarios(action: string, user: any) {
  return { success: true };
}

export async function crearUsuario(user: any) {
  return { success: true };
}

export async function actualizarUsuario(user: any) {
  return { success: true };
}

export async function eliminarUsuario(userIdOrEmail: string) {
  return { success: true };
}

export async function registrarHistorial(data: any) {
  return { success: true };
}

export async function obtenerPreferenciasUsuario(userId: string) {
  return { theme: 'dark', notifications: true };
}

export async function actualizarPreferenciasUsuario(userId: string, preferences: any) {
  return { success: true };
}

export async function analisisHistorial(request: any = {}) {
  return [];
}
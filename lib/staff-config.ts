/**
 * Novo Heritage Staff Configuration
 * 
 * Emails listed here are recognized as internal Novo Heritage members
 * (employees, agents, vendors). When logged in with one of these emails,
 * the CRM button becomes visible in the navigation bar.
 */

// Authorized staff emails ONLY
const STAFF_EMAILS = [
  "jorddyr.novoheritage@gmail.com",
  "novoheritagesales@gmail.com",
  "angelluis.encarnacion2000@gmail.com",
]

/**
 * Check if a user email belongs to a Novo Heritage staff member
 */
export function isStaffMember(email: string | null | undefined): boolean {
  if (!email) return false
  const lower = email.toLowerCase()
  
  // Check individual emails exactly
  return STAFF_EMAILS.some(e => e.toLowerCase() === lower)
}

/**
 * Bitrix24 CRM Portal URL
 * Update this to match your Bitrix24 portal address.
 */
export const BITRIX_CRM_URL = "https://novoheritagerealty.bitrix24.es/online/"

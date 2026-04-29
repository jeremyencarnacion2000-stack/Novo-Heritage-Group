/**
 * Novo Heritage Staff Configuration
 * 
 * Emails listed here are recognized as internal Novo Heritage members
 * (employees, agents, vendors). When logged in with one of these emails,
 * the CRM button becomes visible in the navigation bar.
 */

// Authorized staff email domains and individual emails
const STAFF_DOMAINS = [
  "@novoheritage.com.do",
  "@novoheritagegroup.com",
]

const STAFF_EMAILS = [
  "jeremyencarnacion2000@gmail.com",
  "angelluisencarnacion2000@gmail.com",
  // Add more individual staff emails here
]

/**
 * Check if a user email belongs to a Novo Heritage staff member
 */
export function isStaffMember(email: string | null | undefined): boolean {
  if (!email) return false
  const lower = email.toLowerCase()
  
  // Check individual emails
  if (STAFF_EMAILS.some(e => e.toLowerCase() === lower)) return true
  
  // Check authorized domains
  if (STAFF_DOMAINS.some(domain => lower.endsWith(domain.toLowerCase()))) return true
  
  return false
}

/**
 * Bitrix24 CRM Portal URL
 * This is the URL that staff members will be directed to when clicking the CRM button.
 * Update this to match your Bitrix24 portal address.
 */
export const BITRIX_CRM_URL = "https://novoheritage.bitrix24.com"

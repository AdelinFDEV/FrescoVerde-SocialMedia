const env = import.meta.env ?? {}

/**
 * Huella de la contraseña de acceso, no la contraseña.
 *
 * Es una cortina, no una puerta: el código de la página es público, así que
 * quien abra las herramientas del navegador puede saltarse la pantalla. Lo que
 * sí evita guardar la huella en vez del texto es que la contraseña quede a la
 * vista en el JavaScript — importa porque la gente reutiliza contraseñas.
 *
 * Los datos siguen protegidos solo por las políticas de Supabase, no por esto.
 */
export const ACCESS_HASH = env.VITE_ACCESS_PASSWORD_HASH ?? ''
export const isGateEnabled = ACCESS_HASH.length > 0

// La sal no da secreto (viaja en la página), pero evita que la huella se
// resuelva con una tabla genérica de contraseñas comunes.
const SALT = 'frescoverde-panou-2026'

const STORAGE_KEY = 'frescoverde:acces'

/** SHA-256 en hexadecimal. Necesita HTTPS o localhost. */
export async function hashPassword(password) {
  const bytes = new TextEncoder().encode(`${SALT}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function checkPassword(password) {
  if (!isGateEnabled) return true
  try {
    return (await hashPassword(password)) === ACCESS_HASH.trim().toLowerCase()
  } catch {
    // Sin `crypto.subtle` (contexto no seguro) no se puede comprobar nada.
    return false
  }
}

/**
 * Se recuerda la huella, no un simple «sí». Así, al cambiar la contraseña,
 * las sesiones antiguas dejan de valer solas.
 */
export function rememberAccess() {
  try {
    localStorage.setItem(STORAGE_KEY, ACCESS_HASH)
  } catch {
    // Sin almacenamiento se pedirá la contraseña en cada visita.
  }
}

export function hasAccess() {
  if (!isGateEnabled) return true
  try {
    return localStorage.getItem(STORAGE_KEY) === ACCESS_HASH
  } catch {
    return false
  }
}

export function forgetAccess() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nada que hacer.
  }
}

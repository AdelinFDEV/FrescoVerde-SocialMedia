import { createClient } from '@supabase/supabase-js'

// `import.meta.env` solo existe bajo Vite; el script de verificación corre en
// Node pelado y ahí no hay configuración, que es justo lo que queremos.
const env = import.meta.env ?? {}
const url = env.VITE_SUPABASE_URL
const anonKey = env.VITE_SUPABASE_ANON_KEY

/**
 * Cliente de Supabase, o `null` si el proyecto no está configurado.
 *
 * Sin `.env.local` el panel sigue funcionando con los datos de demostración,
 * que es justo lo que se quiere para enseñarlo sin conectar nada.
 */
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = !!supabase

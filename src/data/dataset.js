import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { campaignsFromDatabase, monthsFromDatabase } from './fromDatabase'

/**
 * De dónde salen los datos del panel: de Supabase y de ningún otro sitio.
 *
 * No hay datos de relleno. Si la base de datos está vacía, el panel lo dice y
 * no enseña nada — inventarse cifras para que «se vea algo» es justo lo que no
 * puede hacer una herramienta con la que se toman decisiones.
 *
 * Los selectores leen de aquí en vez de importar una constante, porque los
 * datos ya no se conocen al cargar el módulo: llegan por red. La lectura pasa
 * por `useDataset`, que conecta este almacén externo con React.
 */

const EMPTY = {
  months: [],
  campaigns: [],
  status: isSupabaseConfigured ? 'loading' : 'ready',
  incomplete: [],
  inconsistent: [],
  error: null,
  connected: false,
}

let current = EMPTY
const listeners = new Set()

function publish(next) {
  current = next
  listeners.forEach((fn) => fn())
}

export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getSnapshot = () => current

/**
 * Carga un juego de datos a mano. Solo lo usan las verificaciones
 * (`npm run check`), que necesitan partir de cifras conocidas.
 */
export function setDataset(months, campaigns) {
  publish({ ...EMPTY, months, campaigns, status: 'ready' })
}

/* ---- Lo que consumen los selectores ------------------------------------ */

export const months = () => current.months
export const campaigns = () => current.campaigns

/* ---- Carga ------------------------------------------------------------- */

let started = false

/** Vuelve a leer la base de datos, por ejemplo después de guardar. */
export const refreshDataset = () => fetchDataset({ showLoading: false })

/** Carga los datos reales una sola vez. Sin configuración, no hace nada. */
export async function loadDataset() {
  if (started || !isSupabaseConfigured) return
  started = true
  return fetchDataset({ showLoading: true })
}

// Al recargar tras guardar no se muestra la pantalla de carga: taparía el
// panel entero por una consulta de medio segundo.
async function fetchDataset({ showLoading }) {
  if (!isSupabaseConfigured) return

  if (showLoading) publish({ ...current, status: 'loading' })

  try {
    const [stats, camps] = await Promise.all([
      supabase.from('monthly_metrics').select('*').order('year').order('month'),
      supabase.from('campaigns').select('*').order('year').order('month').order('id'),
    ])

    if (stats.error) throw stats.error
    if (camps.error) throw camps.error

    const { months: loaded, incomplete, inconsistent } = monthsFromDatabase(stats.data ?? [])

    publish({
      months: loaded,
      campaigns: campaignsFromDatabase(camps.data ?? []),
      status: 'ready',
      incomplete,
      inconsistent,
      error: null,
      connected: true,
    })
  } catch (error) {
    publish({ ...EMPTY, status: 'ready', error: error.message ?? String(error), connected: true })
  }
}

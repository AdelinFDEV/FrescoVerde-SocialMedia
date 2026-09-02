import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { campaignsFromDatabase, monthsFromDatabase } from './fromDatabase'
import { DEMO_CAMPAIGNS, DEMO_MONTHLY } from './demoData'

/**
 * De dónde salen los datos del panel.
 *
 * Sin `.env.local` configurado, o si la consulta falla, se usan los datos de
 * demostración: el panel siempre enseña algo, y el aviso fijo de la esquina
 * dice con claridad cuál de los dos está viendo el usuario.
 *
 * Los selectores leen de aquí en vez de importar una constante, porque los
 * datos ya no se conocen al cargar el módulo: llegan por red. La lectura pasa
 * por `useDataset`, que conecta este almacén externo con React.
 */

const DEMO = {
  months: DEMO_MONTHLY,
  campaigns: DEMO_CAMPAIGNS,
  source: 'demo',
  status: 'ready',
  incomplete: [],
  error: null,
  connected: false,
}

let current = DEMO
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

/* ---- Lo que consumen los selectores ------------------------------------ */

export const months = () => current.months
export const campaigns = () => current.campaigns
export const years = () => [...new Set(current.months.map((m) => m.year))]
export const currentYear = () => {
  const list = years()
  return list[list.length - 1]
}

/* ---- Carga ------------------------------------------------------------- */

let started = false

/** Carga los datos reales una sola vez. Sin configuración, no hace nada. */
export async function loadDataset() {
  if (started || !isSupabaseConfigured) return
  started = true

  publish({ ...current, status: 'loading' })

  try {
    const [stats, camps] = await Promise.all([
      supabase.from('monthly_metrics').select('*').order('year').order('month'),
      supabase.from('campaigns').select('*').order('year').order('month').order('id'),
    ])

    if (stats.error) throw stats.error
    if (camps.error) throw camps.error

    const { months: loaded, incomplete } = monthsFromDatabase(stats.data ?? [])

    // Una base de datos vacía no es un error: aún no se ha metido nada. Se
    // sigue enseñando la demostración hasta que haya un mes completo.
    if (!loaded.length) {
      publish({ ...DEMO, status: 'ready', source: 'demo', incomplete, connected: true })
      return
    }

    publish({
      months: loaded,
      campaigns: campaignsFromDatabase(camps.data ?? []),
      source: 'supabase',
      status: 'ready',
      incomplete,
      error: null,
      connected: true,
    })
  } catch (error) {
    publish({ ...DEMO, error: error.message ?? String(error), connected: true })
  }
}

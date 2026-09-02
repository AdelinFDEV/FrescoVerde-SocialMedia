/**
 * Definiciones compartidas de campañas: objetivos y estados. El generador de
 * datos, el listado y el formulario leen de aquí, así que añadir un objetivo o
 * un estado se hace en un solo sitio.
 */

export const OBJECTIVES = [
  // Los multiplicadores solo los usa el generador de datos de demostración.
  { id: 'urmaritori', label: 'Urmăritori noi', cpmMult: 1.12, ctrMult: 1.25, followerMult: 1.55 },
  { id: 'interactiune', label: 'Interacțiune', cpmMult: 0.94, ctrMult: 1.1, followerMult: 0.85 },
  { id: 'notorietate', label: 'Notorietate', cpmMult: 0.72, ctrMult: 0.62, followerMult: 0.48 },
  { id: 'trafic', label: 'Trafic', cpmMult: 1.05, ctrMult: 1.4, followerMult: 0.62 },
]

export const OBJECTIVE_BY_ID = Object.fromEntries(OBJECTIVES.map((o) => [o.id, o]))

export const STATUSES = [
  {
    id: 'planificata',
    label: 'Planificată',
    className: 'bg-ink-50 text-ink-600 ring-1 ring-inset ring-ink-200',
    help: 'Programată, dar încă nu a început.',
  },
  {
    id: 'activa',
    label: 'Activă',
    className: 'bg-neon-050 text-[#0b7a35]',
    help: 'Rulează chiar acum și consumă buget.',
  },
  {
    id: 'in_pauza',
    label: 'În pauză',
    className: 'bg-[#fdf1e3] text-[#8a4b12]',
    help: 'Oprită temporar; cifrele rămân, bugetul nu se consumă.',
  },
  {
    id: 'finalizata',
    label: 'Finalizată',
    className: 'bg-ink-100 text-ink-600',
    help: 'Încheiată; rezultatele sunt definitive.',
  },
]

export const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]))

/** Campos de resultados de una campaña, tal como los da el administrador de anuncios. */
export const RESULT_FIELDS = [
  { id: 'spend', label: 'Investiție', unit: 'eur' },
  { id: 'impressions', label: 'Afișări', unit: 'int' },
  { id: 'reach', label: 'Persoane acoperite', unit: 'int' },
  { id: 'clicks', label: 'Clicuri', unit: 'int' },
  { id: 'followersGained', label: 'Urmăritori câștigați', unit: 'int' },
]

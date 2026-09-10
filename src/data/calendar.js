/** Nombres de los meses en rumano y utilidades de periodo. */

export const MONTH_LABELS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec']

export const MONTH_LABELS_LONG = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
]

/**
 * Cabecera de un mes. `month` va de 0 a 11 en toda la aplicación; en la base de
 * datos se guarda de 1 a 12, que es lo natural al escribir SQL a mano, y la
 * conversión se hace en un único sitio (`fromDatabase`).
 */
export function monthMeta(year, month) {
  return {
    key: `${year}-${String(month + 1).padStart(2, '0')}`,
    year,
    month,
    quarter: Math.floor(month / 3) + 1,
    label: MONTH_LABELS[month],
    longLabel: `${MONTH_LABELS[month]} ${year}`,
    fullLabel: `${MONTH_LABELS_LONG[month]} ${year}`,
  }
}

/**
 * Años que se ofrecen en los formularios.
 *
 * Con la base de datos vacía no hay años que listar, así que se ofrecen el
 * actual y los dos anteriores: hay que poder meter el primer mes, y también
 * el histórico que ya se tenga.
 */
export function yearOptions(loadedYears = []) {
  const now = new Date().getFullYear()
  const base = [now - 2, now - 1, now]
  return [...new Set([...base, ...loadedYears])].sort((a, b) => a - b)
}

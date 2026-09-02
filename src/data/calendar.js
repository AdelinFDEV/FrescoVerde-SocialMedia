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

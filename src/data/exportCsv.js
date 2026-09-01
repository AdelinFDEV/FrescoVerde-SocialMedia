/**
 * Exportación a CSV de cualquier tabla del panel.
 *
 * Pensado para abrirse en Excel con configuración rumana o española:
 *  - separador `;`, porque la coma es el separador decimal;
 *  - números en crudo con coma decimal, sin unidad ni miles, para que Excel los
 *    reconozca como números y se puedan sumar (la unidad va en la cabecera);
 *  - BOM UTF-8, para que las diacríticas rumanas no salgan rotas.
 */

const nfRaw = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 4, useGrouping: false })

/** Escapa un valor según las reglas de CSV (RFC 4180) con separador `;`. */
function escape(value) {
  const s = String(value ?? '')
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Valor exportable de una celda:
 *  - `csv: false` excluye la columna (botones, acciones);
 *  - `csv: fn` la controla a mano;
 *  - si el dato crudo es numérico, se exporta crudo (Excel puede calcular);
 *  - si no, se usa lo que pinta la tabla, siempre que sea texto.
 */
function cellValue(column, row) {
  if (typeof column.csv === 'function') return column.csv(row)

  const raw = row[column.key]
  if (typeof raw === 'number' && Number.isFinite(raw)) return nfRaw.format(raw)

  const rendered = column.render ? column.render(row) : raw
  if (typeof rendered === 'string' || typeof rendered === 'number') return rendered
  return raw == null ? '' : String(raw)
}

/** Cabecera con la unidad entre paréntesis, ya que las celdas van en crudo. */
function header(column) {
  return column.csvLabel ?? column.label
}

export function toCsv(columns, rows) {
  const cols = columns.filter((c) => c.csv !== false)
  const lines = [
    cols.map((c) => escape(header(c))).join(';'),
    ...rows.map((row) => cols.map((c) => escape(cellValue(c, row))).join(';')),
  ]
  return lines.join('\r\n')
}

/** Nombre de archivo seguro: sin diacríticas ni espacios. */
export function csvFilename(...parts) {
  const slug = parts
    .filter(Boolean)
    .join('-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  return `frescoverde-${slug}.csv`
}

export function downloadCsv(filename, csv) {
  // El BOM es lo que hace que Excel abra el archivo como UTF-8.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

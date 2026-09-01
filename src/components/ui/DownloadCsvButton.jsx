import { Download } from 'lucide-react'
import { csvFilename, downloadCsv, toCsv } from '../../data/exportCsv'

/** Descarga la tabla que acompaña a un gráfico o a una tarjeta. */
export default function DownloadCsvButton({ columns, rows, name, year, label = 'Descarcă CSV' }) {
  if (!columns?.length || !rows?.length) return null

  return (
    <button
      onClick={() => downloadCsv(csvFilename(name, year), toCsv(columns, rows))}
      title={label}
      aria-label={label}
      className="rounded-lg border border-ink-100 bg-white p-2 text-ink-500 transition-colors hover:border-ink-200 hover:text-ink-800"
    >
      <Download size={16} strokeWidth={2.2} />
    </button>
  )
}

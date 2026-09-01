import Card from './Card'
import DataTable from './DataTable'
import DownloadCsvButton from './DownloadCsvButton'

/** Tarjeta con título, texto de apoyo, descarga CSV y tabla. */
export default function TableCard({
  title,
  subtitle,
  columns,
  rows,
  rowClassName,
  csvName,
  year,
  delay = 0,
}) {
  return (
    <Card className="p-5 sm:p-6" delay={delay}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight text-ink-900">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p> : null}
        </div>
        <div className="shrink-0">
          <DownloadCsvButton columns={columns} rows={rows} name={csvName ?? title} year={year} />
        </div>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} rows={rows} rowClassName={rowClassName} />
      </div>
    </Card>
  )
}

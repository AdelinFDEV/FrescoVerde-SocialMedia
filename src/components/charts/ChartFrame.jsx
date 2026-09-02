import { useId, useState } from 'react'
import { Table2, ChartSpline } from 'lucide-react'
import Card from '../ui/Card'
import DataTable from '../ui/DataTable'
import DownloadCsvButton from '../ui/DownloadCsvButton'
import useIsMobile from '../ui/useIsMobile'

/**
 * Marco común de todos los gráficos: título, subtítulo, leyenda (obligatoria a
 * partir de 2 series) y conmutador gráfico / tabla.
 */
export default function ChartFrame({
  title,
  subtitle,
  note,
  series = [],
  actions,
  table,
  height = 320,
  delay = 0,
  className = '',
  children,
}) {
  const [asTable, setAsTable] = useState(false)
  const isMobile = useIsMobile()
  const id = useId()

  return (
    <Card className={`p-4 sm:p-6 ${className}`} delay={delay}>
      <div className="flex items-start justify-between gap-3">
        {/* El bloque de texto encoge; los controles nunca bajan de línea. */}
        <div className="min-w-0 flex-1">
          <h2 id={id} className="flex flex-wrap items-center gap-2 text-base font-semibold tracking-tight text-ink-900">
            {title}
            {/* Aviso de alcance: qué redes reportan de verdad esta métrica. */}
            {note ? (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                {note}
              </span>
            ) : null}
          </h2>
          {subtitle ? <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {table ? (
            <>
              <button
                onClick={() => setAsTable((v) => !v)}
                aria-pressed={asTable}
                title={asTable ? 'Vezi graficul' : 'Vezi tabelul de date'}
                className="rounded-lg border border-ink-100 bg-white p-2 text-ink-500 transition-colors hover:border-ink-200 hover:text-ink-800"
              >
                {asTable ? (
                  <ChartSpline size={16} strokeWidth={2.2} />
                ) : (
                  <Table2 size={16} strokeWidth={2.2} />
                )}
              </button>
              {/* El año sale de las propias filas: no hace falta pasarlo aparte. */}
              <DownloadCsvButton
                columns={table.columns}
                rows={table.rows}
                name={title}
                year={table.rows[0]?.year}
              />
            </>
          ) : null}
        </div>
      </div>

      {series.length >= 2 && !asTable ? (
        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {series.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5 text-sm text-ink-600">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}

      {/* En el móvil los gráficos se acortan: a la altura de escritorio no cabe
          nada más en pantalla y obliga a desplazarse por cada uno. */}
      <div className="mt-4" style={asTable ? undefined : { height: isMobile ? Math.min(height, 240) : height }}>
        {asTable ? <DataTable columns={table.columns} rows={table.rows} /> : children}
      </div>
    </Card>
  )
}

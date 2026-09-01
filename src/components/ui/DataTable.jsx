/**
 * Vista de tabla que acompaña a cada gráfico: es el canal de respaldo cuando el
 * color no basta (daltonismo, impresión) y donde viven los valores que no se
 * etiquetan directamente sobre las marcas.
 */
export default function DataTable({ columns, rows, rowClassName }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-ink-50">
            {columns.map((c, i) => (
              <th
                key={c.key}
                scope="col"
                className={`px-3 py-2.5 font-semibold text-ink-600 ${
                  i === 0 ? 'text-left' : 'text-right'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {c.color ? (
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: c.color }}
                      aria-hidden="true"
                    />
                  ) : null}
                  {c.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={row.key ?? r}
              className={`border-t border-ink-100 transition-colors ${
                rowClassName?.(row) ?? 'hover:bg-ink-50/60'
              }`}
            >
              {columns.map((c, i) => (
                <td
                  key={c.key}
                  className={`px-3 py-2 ${
                    i === 0
                      ? 'text-left font-medium text-ink-800'
                      : 'tnum text-right text-ink-700'
                  }`}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

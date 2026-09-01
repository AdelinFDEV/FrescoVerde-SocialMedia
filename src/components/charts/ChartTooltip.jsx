/** Tooltip compartido: mismo formato en todos los gráficos. */
export default function ChartTooltip({ active, payload, label, format, title, total }) {
  if (!active || !payload?.length) return null

  const rows = payload.filter((p) => p.value != null && !p.hide)
  const sum = rows.reduce((s, p) => s + (p.value || 0), 0)

  return (
    <div className="min-w-[190px] animate-fade rounded-xl border border-ink-100 bg-white p-3 shadow-[0_10px_30px_-12px_rgba(28,35,43,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        {title ? title(label, payload) : label}
      </p>
      <ul className="mt-2 space-y-1.5">
        {rows.map((p) => (
          <li key={p.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-ink-600">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: p.color ?? p.stroke ?? p.fill }}
                aria-hidden="true"
              />
              {p.name}
            </span>
            <span className="tnum font-semibold text-ink-900">{format(p.value, p)}</span>
          </li>
        ))}
      </ul>
      {total && rows.length > 1 ? (
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-ink-100 pt-2 text-sm">
          <span className="font-medium text-ink-500">Total</span>
          <span className="tnum font-semibold text-ink-900">{format(sum)}</span>
        </div>
      ) : null}
    </div>
  )
}

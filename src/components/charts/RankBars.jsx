import { fmtPct } from '../../data/selectors'

/**
 * Barras horizontales de reparto. Es HTML puro: el valor va etiquetado fuera de
 * la barra, así que no depende del color para leerse.
 */
export default function RankBars({ items, format, caption }) {
  const max = Math.max(...items.map((i) => i.value)) || 1
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      {items.map((item, i) => (
        <div key={item.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-ink-800">
              <span className="size-2.5 rounded-full" style={{ background: item.color }} aria-hidden="true" />
              {item.label}
            </span>
            <span className="tnum text-ink-600">
              <span className="font-semibold text-ink-900">{format(item.value)}</span>
              {item.share != null ? <span className="ml-2 text-ink-400">{fmtPct(item.share, 1)}</span> : null}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-50">
            <div
              className="h-full rounded-full"
              style={{
                background: item.color,
                width: `${(item.value / max) * 100}%`,
                animation: `grow 0.9s cubic-bezier(0.22,1,0.36,1) ${i * 80}ms backwards`,
              }}
            />
          </div>
          {item.note ? <p className="mt-1 text-xs text-ink-400">{item.note}</p> : null}
        </div>
      ))}
      {caption ? <p className="mt-1 text-xs text-ink-400">{caption}</p> : null}
      <style>{`@keyframes grow { from { width: 0 } }`}</style>
    </div>
  )
}

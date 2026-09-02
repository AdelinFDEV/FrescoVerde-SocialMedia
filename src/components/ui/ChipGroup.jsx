/** Fila de filtros: una sola opción activa, envolviendo en pantallas pequeñas. */
export default function ChipGroup({ options, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-2.5 py-2 text-sm font-medium transition-all duration-200 sm:py-1 ${
              active
                ? 'border-ink-600 bg-ink-600 text-white'
                : 'border-ink-100 bg-white text-ink-500 hover:border-ink-200 hover:text-ink-800'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

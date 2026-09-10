/** Fila de filtros: una sola opción activa, envolviendo en pantallas pequeñas. */
export default function ChipGroup({ options, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            // 40 px de alto en el móvil: son doce meses en fila, se fallan.
            className={`min-h-10 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-all duration-200 sm:min-h-0 sm:px-2.5 sm:py-1 ${
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

export default function SegmentedControl({ options, value, onChange, size = 'md', label }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex rounded-xl border border-ink-100 bg-ink-50 p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            // En el móvil se pulsa con el dedo: los botones no bajan de 40 px.
            className={`relative whitespace-nowrap rounded-lg font-medium transition-all duration-200 sm:min-h-0 ${
              size === 'sm' ? 'min-h-10 px-3 text-xs sm:px-2.5 sm:py-1' : 'min-h-10 px-3.5 text-sm sm:py-1.5'
            } ${
              active
                ? 'bg-white text-ink-900 shadow-[0_1px_2px_rgba(28,35,43,0.10)]'
                : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

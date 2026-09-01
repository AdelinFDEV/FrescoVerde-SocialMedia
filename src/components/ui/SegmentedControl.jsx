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
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative rounded-lg font-medium transition-all duration-200 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
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

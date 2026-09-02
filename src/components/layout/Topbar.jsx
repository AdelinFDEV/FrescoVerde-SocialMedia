import { Check, Menu, Plus } from 'lucide-react'
import { NETWORKS } from '../../data/networks'
import { VIEW_BY_ID } from '../../data/navigation'
import SegmentedControl from '../ui/SegmentedControl'

export default function Topbar({ view, year, years, onYear, active, onToggleNetwork, onAddData, onOpenNav }) {
  const current = VIEW_BY_ID[view]

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-8 sm:py-3.5">
        {/* En móvil las secciones viven en un panel: ocho pestañas en una fila
            obligarían a arrastrar a ciegas para llegar a la última. */}
        <button
          onClick={onOpenNav}
          aria-label="Deschide secțiunile"
          className="-ml-1 shrink-0 rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-ink-50 lg:hidden"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <div className="mr-auto min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
            {current?.label}
          </h1>
          <p className="hidden truncate text-sm text-ink-500 sm:block">{current?.subtitle}</p>
        </div>

        <SegmentedControl
          label="An"
          size="sm"
          options={years.map((y) => ({ value: y, label: String(y) }))}
          value={year}
          onChange={onYear}
        />

        <button
          onClick={onAddData}
          aria-label="Adaugă date"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-ink-600 px-2.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-700 sm:px-3.5 sm:py-2"
        >
          <Plus size={16} strokeWidth={2.6} className="text-neon-400" />
          <span className="hidden sm:inline">Adaugă date</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-2.5 sm:px-8 sm:pb-3">
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-400">Rețele</span>
        {NETWORKS.map((n) => {
          const on = active.includes(n.id)
          const only = on && active.length === 1
          return (
            <button
              key={n.id}
              onClick={() => onToggleNetwork(n.id)}
              disabled={only}
              aria-pressed={on}
              title={only ? 'Trebuie să rămână cel puțin o rețea activă' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200 sm:py-1.5 ${
                on
                  ? 'border-ink-200 bg-white text-ink-800 shadow-[0_1px_2px_rgba(28,35,43,0.06)]'
                  : 'border-ink-100 bg-ink-50 text-ink-400 hover:text-ink-600'
              } ${only ? 'cursor-default' : ''}`}
            >
              <span
                className="grid size-3.5 place-items-center rounded-full transition-colors"
                style={{ background: on ? n.hex : 'var(--color-ink-200)' }}
                aria-hidden="true"
              >
                {on ? <Check size={9} strokeWidth={4} className="text-white" /> : null}
              </span>
              {n.name}
            </button>
          )
        })}
      </div>
    </header>
  )
}

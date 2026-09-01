import { Check, Plus } from 'lucide-react'
import { NETWORKS } from '../../data/networks'
import { VIEWS, VIEW_BY_ID } from '../../data/navigation'
import SegmentedControl from '../ui/SegmentedControl'
import Logo from './Logo'

export default function Topbar({
  view,
  onView,
  year,
  years,
  onYear,
  active,
  onToggleNetwork,
  onAddData,
}) {
  const current = VIEW_BY_ID[view]

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:px-8">
        <span className="lg:hidden">
          <Logo size={30} />
        </span>
        <div className="mr-auto">
          <h1 className="text-lg font-semibold tracking-tight text-ink-900">{current?.label}</h1>
          <p className="text-sm text-ink-500">{current?.subtitle}</p>
        </div>

        <SegmentedControl
          label="An"
          options={years.map((y) => ({ value: y, label: String(y) }))}
          value={year}
          onChange={onYear}
        />

        <button
          onClick={onAddData}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-ink-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-700"
        >
          <Plus size={16} strokeWidth={2.6} className="text-neon-400" />
          Adaugă date
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-5 pb-3 sm:px-8">
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
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
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
        <nav className="ml-auto shrink-0 lg:hidden">
          <SegmentedControl
            size="sm"
            label="Secțiune"
            options={VIEWS.map((v) => ({ value: v.id, label: v.label }))}
            value={view}
            onChange={onView}
          />
        </nav>
      </div>
    </header>
  )
}

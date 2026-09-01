import Logo from './Logo'
import { VIEWS } from '../../data/navigation'

export default function Sidebar({ view, onChange }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink-600 px-4 py-6 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span className="grid size-11 place-items-center rounded-xl bg-white p-1">
          <Logo size={30} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">FrescoVerde</p>
          <p className="text-xs text-ink-200">Rețele sociale</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const active = id === view
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active ? 'bg-ink-700 text-white' : 'text-ink-200 hover:bg-ink-700/60 hover:text-white'
              }`}
            >
              <span
                className={`absolute left-0 h-5 w-1 rounded-r-full bg-neon-400 transition-all duration-300 ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden="true"
              />
              <Icon
                size={17}
                strokeWidth={2.2}
                className={active ? 'text-neon-400' : 'text-ink-300 group-hover:text-white'}
              />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import { Check, Menu, Plus } from 'lucide-react'
import { NETWORKS } from '../../data/networks'
import { VIEW_BY_ID } from '../../data/navigation'
import SegmentedControl from '../ui/SegmentedControl'

export default function Topbar({ view, year, years, onYear, active, onToggleNetwork, onAddData, onOpenNav }) {
  const current = VIEW_BY_ID[view]

  // En el móvil la barra va fija: no depende de que `sticky` se comporte, no
  // se despega al rebotar el scroll y no la tapa la barra del navegador. Como
  // sale del flujo, hace falta un hueco de su mismo alto — y su alto cambia
  // (título de dos líneas, chips que envuelven), así que se mide en vez de
  // fijarlo a ojo. En escritorio vuelve al flujo normal y el hueco desaparece.
  const barRef = useRef(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    // La primera medida es síncrona, antes de pintar: si dependiera del
    // observador, el primer fotograma saldría con el contenido bajo la barra.
    //
    // Se redondea y solo se guarda si cambia de verdad. En iOS, esconder y
    // sacar la barra del navegador dispara medidas con diferencias de una
    // fracción de píxel; guardarlas todas repintaba el hueco a cada una y eso
    // se ve como pequeños saltos del contenido mientras se desplaza.
    const measure = () => {
      const next = Math.round(el.getBoundingClientRect().height)
      setHeight((prev) => (prev === next ? prev : next))
    }
    measure()
    // El observador solo se ocupa de lo que venga después: girar el teléfono,
    // o los chips de red pasando a dos líneas.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
    <header
      ref={barRef}
      // `transform-gpu` la sube a su propia capa de composición: en iOS, una
      // barra fija que comparte capa con la página se desplaza a tirones
      // mientras el scroll lleva inercia, en vez de quedarse quieta.
      className="fixed inset-x-0 top-0 z-30 transform-gpu border-b border-ink-100 bg-white pt-[env(safe-area-inset-top)] lg:sticky lg:inset-x-auto lg:z-20 lg:pt-0"
    >
      <div className="flex items-center gap-3 px-4 py-2 sm:px-8 sm:py-3.5">
        {/* En móvil las secciones viven en un panel: nueve pestañas en una fila
            obligarían a arrastrar a ciegas para llegar a la última. */}
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Deschide secțiunile"
          className="-ml-1 grid min-h-11 min-w-11 shrink-0 place-items-center rounded-xl text-ink-600 transition-colors hover:bg-ink-50 lg:hidden"
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
          type="button"
          onClick={onAddData}
          aria-label="Adaugă date"
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-ink-600 text-sm font-semibold text-white transition-colors hover:bg-ink-700 sm:min-h-0 sm:min-w-0 sm:px-3.5 sm:py-2"
        >
          <Plus size={16} strokeWidth={2.6} className="text-neon-400" />
          <span className="hidden sm:inline">Adaugă date</span>
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:px-8 sm:pb-3">
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-400">Rețele</span>
        {NETWORKS.map((n) => {
          const on = active.includes(n.id)
          const only = on && active.length === 1
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onToggleNetwork(n.id)}
              disabled={only}
              aria-pressed={on}
              title={only ? 'Trebuie să rămână cel puțin o rețea activă' : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all duration-200 sm:min-h-0 sm:px-3 sm:py-1.5 ${
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

    {/* El hueco que deja la barra fija. En escritorio no hace falta. */}
    <div style={{ height }} className="lg:hidden" aria-hidden="true" />
    </>
  )
}

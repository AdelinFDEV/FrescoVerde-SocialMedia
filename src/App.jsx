import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import DataEntryDrawer from './components/entry/DataEntryDrawer'
import DemoNotice from './components/layout/DemoNotice'
import MobileNav from './components/layout/MobileNav'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import { ALL_NETWORK_IDS, NETWORKS } from './data/networks'
import { loadDataset } from './data/dataset'
import useDataset from './data/useDataset'

// Cada sección se carga cuando se abre. Con recharts dentro, cargarlas todas de
// golpe son cientos de kilobytes que en el móvil se notan; así solo viaja la
// que se está mirando.
const VIEW_COMPONENTS = {
  rezumat: lazy(() => import('./views/Rezumat')),
  crestere: lazy(() => import('./views/Crestere')),
  audienta: lazy(() => import('./views/Audienta')),
  interactiuni: lazy(() => import('./views/Interactiuni')),
  investitie: lazy(() => import('./views/Investitie')),
  campanii: lazy(() => import('./views/Campanii')),
  trimestrial: lazy(() => import('./views/Trimestrial')),
  anual: lazy(() => import('./views/Anual')),
}

const Loading = ({ text = 'Se încarcă…' }) => (
  <div className="grid min-h-48 place-items-center">
    <p className="animate-fade text-sm font-medium text-ink-400">{text}</p>
  </div>
)

export default function App() {
  const [view, setView] = useState('rezumat')
  const [activeIds, setActiveIds] = useState(ALL_NETWORK_IDS)
  const [entryOpen, setEntryOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  // `null` significa «el más reciente»: así el año elegido no se queda
  // apuntando a uno que los datos cargados ni siquiera tienen.
  const [pickedYear, setPickedYear] = useState(null)

  const data = useDataset()

  useEffect(() => {
    loadDataset()
  }, [])

  const years = useMemo(() => [...new Set(data.months.map((m) => m.year))], [data.months])
  const year = years.includes(pickedYear) ? pickedYear : years[years.length - 1]

  // El color sigue a la red, no a su posición: filtrar no repinta la visible.
  const networks = useMemo(() => NETWORKS.filter((n) => activeIds.includes(n.id)), [activeIds])

  const toggleNetwork = (id) =>
    setActiveIds((ids) =>
      ids.includes(id)
        ? ids.length > 1
          ? ids.filter((x) => x !== id)
          : ids
        : ALL_NETWORK_IDS.filter((x) => ids.includes(x) || x === id),
    )

  const View = VIEW_COMPONENTS[view]

  if (data.status === 'loading') {
    return (
      <div className="grid min-h-full place-items-center bg-ink-50/40">
        <Loading text="Se încarcă datele…" />
      </div>
    )
  }

  return (
    <div className="flex min-h-full bg-ink-50/40">
      <Sidebar view={view} onChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          view={view}
          year={year}
          years={years}
          onYear={setPickedYear}
          active={activeIds}
          onToggleNetwork={toggleNetwork}
          onAddData={() => setEntryOpen(true)}
          onOpenNav={() => setNavOpen(true)}
        />

        <main className="flex-1 px-4 py-5 sm:px-8 sm:py-6">
          {/* La key fuerza el remontaje: cada cambio de vista o de año reanima. */}
          <div key={`${view}-${year}`} className="mx-auto max-w-[1400px]">
            <Suspense fallback={<Loading />}>
              <View year={year} networks={networks} activeIds={activeIds} />
            </Suspense>
          </div>
        </main>

        {/* El hueco extra deja sitio al aviso fijo de versión de prueba. */}
        <footer className="px-4 pb-36 pt-2 text-xs text-ink-400 sm:px-8 sm:pb-8">
          FrescoVerde · Panou rețele sociale
        </footer>
      </div>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} view={view} onChange={setView} />
      <DataEntryDrawer open={entryOpen} onClose={() => setEntryOpen(false)} defaultYear={year} />
      <DemoNotice />
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import DataEntryDrawer from './components/entry/DataEntryDrawer'
import DemoNotice from './components/layout/DemoNotice'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import { ALL_NETWORK_IDS, NETWORKS } from './data/networks'
import { loadDataset } from './data/dataset'
import useDataset from './data/useDataset'
import Anual from './views/Anual'
import Audienta from './views/Audienta'
import Campanii from './views/Campanii'
import Crestere from './views/Crestere'
import Interactiuni from './views/Interactiuni'
import Investitie from './views/Investitie'
import Rezumat from './views/Rezumat'
import Trimestrial from './views/Trimestrial'

const VIEW_COMPONENTS = {
  rezumat: Rezumat,
  crestere: Crestere,
  audienta: Audienta,
  interactiuni: Interactiuni,
  investitie: Investitie,
  campanii: Campanii,
  trimestrial: Trimestrial,
  anual: Anual,
}

export default function App() {
  const [view, setView] = useState('rezumat')
  const [activeIds, setActiveIds] = useState(ALL_NETWORK_IDS)
  const [entryOpen, setEntryOpen] = useState(false)
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
        <p className="animate-fade text-sm font-medium text-ink-500">Se încarcă datele…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full bg-ink-50/40">
      <Sidebar view={view} onChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          view={view}
          onView={setView}
          year={year}
          years={years}
          onYear={setPickedYear}
          active={activeIds}
          onToggleNetwork={toggleNetwork}
          onAddData={() => setEntryOpen(true)}
        />

        <main className="flex-1 px-5 py-6 sm:px-8">
          {/* La key fuerza el remontaje: cada cambio de vista o de año reanima. */}
          <div key={`${view}-${year}`} className="mx-auto max-w-[1400px]">
            <View year={year} networks={networks} activeIds={activeIds} />
          </div>
        </main>

        {/* El hueco extra deja sitio al aviso fijo de versión de prueba. */}
        <footer className="px-5 pb-40 pt-2 text-xs text-ink-400 sm:px-8 sm:pb-8">
          FrescoVerde · Panou rețele sociale
        </footer>
      </div>

      <DataEntryDrawer open={entryOpen} onClose={() => setEntryOpen(false)} defaultYear={year} />
      <DemoNotice />
    </div>
  )
}
